from groq import Groq
from loguru import logger
import os
import json

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def identify_laws(state):
    logger.info("⚖️ Analyzing Pakistan Penal Code (PPC) sections...")
    details = state.get("details", {})
    incident_type = details.get("incident_type", "Unknown")
    description = state.get("input", "")

    prompt = f"""
    You are a legal expert in Pakistan Penal Code (PPC).
    Analyze this incident and identify relevant PPC sections and their punishments.
    
    Incident: {incident_type}
    Description: {description}
    
    Return ONLY a JSON object:
    {{
        "sections": ["Section 509", "Section 354"],
        "punishments": ["Up to 3 years imprisonment or fine", "Death or life imprisonment"],
        "legal_advice": "Aap foran FIR darj karwayein, ye ek non-bailable offense hai.",
        "law_summary_urdu": "PPC Section 509 ke teht kisi khatoon ki behurmati ki saza 3 saal qaid hai."
    }}
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        legal_data = json.loads(response.choices[0].message.content)
        return {"ppc_sections": legal_data}
    except Exception as e:
        logger.error(f"Legal Node Error: {e}")
        return {"ppc_sections": {"sections": ["509"], "law_summary_urdu": "PPC ke mutabiq ye jurm hai."}}
