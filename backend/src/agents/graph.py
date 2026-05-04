import operator
from typing import TypedDict, List, Optional, Annotated
from langgraph.graph import StateGraph, END
from src.agents.intake import extract_details
from src.agents.fir_drafter import draft_fir
from src.agents.router import route_report
from src.agents.safety_mapper import map_to_safety_zones
from loguru import logger

# ─── State ──────────────────────────────────────────────────────────
class AgentState(TypedDict):
    input: str
    details: Optional[dict]
    fir_result: Optional[dict]
    fir_draft: Optional[str]
    ppc_sections: Optional[List[str]]
    routing: Optional[dict]
    safety_zone: Optional[dict]
    status: str
    errors: Annotated[List[str], operator.add]

# ─── Nodes ──────────────────────────────────────────────────────────

async def intake_node(state: AgentState) -> dict:
    logger.info("🧠 [Agent 1/4] Intake — extracting details...")
    try:
        details = await extract_details(state["input"])
        return {"details": details, "status": "details_extracted", "errors": []}
    except Exception as e:
        logger.error(f"Intake error: {e}")
        return {"errors": [str(e)], "status": "error_intake", "details": {}}

async def fir_drafting_node(state: AgentState) -> dict:
    logger.info("📄 [Agent 2/4] FIR — drafting legal document...")
    try:
        result = await draft_fir(state["details"])
        return {
            "fir_result": result,
            "fir_draft": result.get("fir_text_english"),
            "ppc_sections": result.get("ppc_sections", []),
        }
    except Exception as e:
        logger.error(f"FIR error: {e}")
        return {"errors": [str(e)]}

async def routing_node(state: AgentState) -> dict:
    logger.info("🚔 [Agent 3/4] Routing — finding nearest authority...")
    try:
        routing = await route_report(state["details"])
        return {"routing": routing}
    except Exception as e:
        logger.error(f"Routing error: {e}")
        return {"errors": [str(e)]}

async def safety_mapper_node(state: AgentState) -> dict:
    logger.info("🗺️ [Agent 4/4] Safety Mapper — classifying danger zone...")
    try:
        zone = await map_to_safety_zones(state["details"])
        return {"safety_zone": zone}
    except Exception as e:
        logger.error(f"Safety mapper error: {e}")
        return {"errors": [str(e)]}

# ─── Graph ──────────────────────────────────────────────────────────

workflow = StateGraph(AgentState)

workflow.add_node("intake", intake_node)
workflow.add_node("fir_drafter", fir_drafting_node)
workflow.add_node("router", routing_node)
workflow.add_node("safety_mapper", safety_mapper_node)

workflow.set_entry_point("intake")

# Branching: Run these in parallel as they only depend on intake details
workflow.add_edge("intake", "fir_drafter")
workflow.add_edge("intake", "router")
workflow.add_edge("intake", "safety_mapper")

# All paths lead to completion
workflow.add_edge("fir_drafter", END)
workflow.add_edge("router", END)
workflow.add_edge("safety_mapper", END)

app_graph = workflow.compile()

async def run_pipeline(user_input: str) -> AgentState:
    """Run the full 4-agent pipeline and return final state."""
    initial_state: AgentState = {
        "input": user_input,
        "details": None,
        "fir_result": None,
        "fir_draft": None,
        "ppc_sections": None,
        "routing": None,
        "safety_zone": None,
        "status": "started",
        "errors": [],
    }
    result = await app_graph.ainvoke(initial_state)
    return result
