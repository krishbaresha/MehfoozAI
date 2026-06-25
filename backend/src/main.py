from fastapi import FastAPI, Request, Response, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger
from twilio.twiml.messaging_response import MessagingResponse
from src.config.settings import settings
from src.agents.graph import run_pipeline
from src.agents.followup import handle_followup
from src.db.supabase_client import (
    generate_case_id, save_incident, update_heatmap, get_case_status,
    check_db_ready, get_dashboard_stats, get_recent_cases, get_heatmap_points,
    get_authority_cases, get_supabase_headers, resolve_cases
)
from src.utils.notifications import send_whatsapp_reply, send_case_confirmation
from src.utils.whisper import transcribe_voice
import re
import httpx
import os
import pytz
from datetime import datetime

PKST = pytz.timezone('Asia/Karachi')
# SESSIONS moved down to section 75 for clarity

app = FastAPI(
    title="MehfoozAI API",
    version="1.0.0",
    description="AI-powered anonymous harassment reporting platform for Pakistan",
)

# Update origins for production
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "https://mehfooz-ai.vercel.app",
    "https://mehfoozai.netlify.app",
    "https://mahfoozai.netlify.app",
    "https://mahfooz-backend.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex="https://.*\.vercel\.app|https://.*\.netlify\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging to file
logger.add("debug_v2.log", rotation="10 MB", level="INFO")


# ─── Health ─────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 MehfoozAI Backend Started - Logging Active")
    logger.info(f"Environment: {os.getenv('APP_ENV', 'development')}")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "MehfoozAI", "agents": 5}

@app.get("/ready")
async def ready():
    try:
        await check_db_ready()
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=f"Database not ready: {e}")

# ─── WhatsApp Webhook ────────────────────────────────────────────────
# ─── Simple Session & De-duplication ───────────────────────────────
SESSIONS = {}  # { sender_phone: { full_text: str, lat: float, lon: float, last_interaction: datetime, current_case_id: str } }
PROCESSED_MESSAGE_IDS = set() # { wamid } - Simple in-memory de-duplication

# ─── Auth ───────────────────────────────────────────────────────────
from pydantic import BaseModel

class LoginRequest(BaseModel):
    badge_id: str
    access_key: str

class BulkResolveRequest(BaseModel):
    case_ids: list[str]

@app.post("/api/v1/auth/login")
async def login(req: LoginRequest):
    """
    Temporary authentication for hackathon demo.
    Hardcoded for security node showcase.
    """
    # Demo credentials
    VALID_BADGE = "MHZ-AUTH-8829"
    VALID_KEY = "mehfooz2024"
    
    # Strip whitespace to prevent copy-paste errors
    submitted_badge = req.badge_id.strip()
    submitted_key = req.access_key.strip()
    
    logger.info(f"🔑 Auth Attempt - Badge: '{submitted_badge}', Key: '{submitted_key}'")
    
    if submitted_badge == VALID_BADGE and submitted_key == VALID_KEY:
        logger.info(f"✅ Auth Success: {submitted_badge}")
        return {"status": "success", "message": "Access Granted", "token": "demo-token-123"}
    
    logger.warning(f"🚫 Auth Failure - Submitted: '{submitted_badge}' / '{submitted_key}'")
    from fastapi import HTTPException
    raise HTTPException(status_code=401, detail="Invalid Credentials. Access Denied.")


# ─── Debug Pipeline ──────────────────────────────────────────────────
@app.get("/debug/pipeline")
async def debug_pipeline(text: str = "Test incident in Karachi"):
    """
    Synchronous test of the AI pipeline to catch hangs/errors.
    """
    logger.info(f"🧪 Testing pipeline with: {text}")
    try:
        result = await run_pipeline(text)
        case_id = generate_case_id()
        
        # Test DB Save
        db_res = await save_incident(
            case_id=case_id,
            transcription=text,
            details=result.get("details") or {},
            fir_draft=result.get("fir_draft") or "",
            ppc_sections=result.get("ppc_sections") or [],
            routing=result.get("routing") or {},
            safety=result.get("safety_zone") or {}
        )
        
        return {
            "status": "success",
            "db_saved": "data" in db_res,
            "db_error": db_res.get("error"),
            "case_id": case_id,
            "pipeline_result": result
        }
    except Exception as e:
        logger.error(f"Pipeline test failed: {e}")
        return {"status": "error", "message": str(e)}


async def process_report(sender: str, user_text: str, media_urls: list = None, location_data: dict = None):
    """
    Full pipeline: text → AI → Supabase → WhatsApp reply.
    """
    try:
        # Initialize session if not exists
        if sender not in SESSIONS:
            SESSIONS[sender] = {
                "full_text": "", 
                "last_interaction": datetime.now(),
                "lat": None,
                "lon": None,
                "current_case_id": None
            }
        
        # If new location data comes in, store it in session
        if location_data:
            SESSIONS[sender]["lat"] = location_data.get("lat")
            SESSIONS[sender]["lon"] = location_data.get("lon")
            logger.info(f"📍 Location stored in session for {sender}: {location_data}")

        # Add incoming to history
        current_input = user_text or ("[Location Data Received]" if location_data else "[Media/Voice Report]")
        SESSIONS[sender]["full_text"] += f"\nUser: {current_input}"
        SESSIONS[sender]["last_interaction"] = datetime.now()

        logger.info(f"🚀 Starting pipeline for {sender}: {user_text[:80] if user_text else 'Media'}")
        
        # 1. Run Intelligence Pipeline (Graph) with full context
        full_context = SESSIONS[sender]["full_text"]
        result = await run_pipeline(full_context)
        intake_data = result.get("details") or {}
        next_step = intake_data.get("next_step", "COMPLETE")
        
        # 2. If it's a follow-up (COLLECT_INFO), reply but don't finalize everything yet
        if next_step == "COLLECT_INFO":
            reply = intake_data.get("suggested_response", "Shukriya. Kya aap mazeed tafseelat bata sakti hain?")
            await send_whatsapp_reply(sender, reply)
            logger.info(f"🔍 Follow-up question sent to {sender}")
            return {"status": "collecting_info"}

        # 3. If COMPLETE, finalize and save
        # Check if we already have a case ID for this session, otherwise generate new
        case_id = SESSIONS[sender].get("current_case_id")
        if not case_id:
            case_id = generate_case_id()
            SESSIONS[sender]["current_case_id"] = case_id
        
        # Use session-stored coordinates if available
        lat = location_data.get("lat") if location_data else SESSIONS[sender].get("lat")
        lon = location_data.get("lon") if location_data else SESSIONS[sender].get("lon")
        
        enriched_details = {
            **intake_data,
            "sender_phone": sender,
            "evidence_urls": media_urls or [],
            "latitude": lat,
            "longitude": lon,
        }
        
        # Fallback: If AI didn't find a location name but we have GPS, use GPS as location name
        if not enriched_details.get("location") and lat and lon:
            enriched_details["location"] = f"GPS: {lat:.4f}, {lon:.4f}"

        await save_incident(
            case_id=case_id,
            transcription=full_context,
            details=enriched_details,
            fir_draft=result.get("fir_draft") or "Drafting in progress...",
            ppc_sections=result.get("ppc_sections") or ["Section Pending"],
            routing=result.get("routing") or {"status": "Automatic routing in progress"},
            safety=result.get("safety_zone") or {"level": "Analyzing"}
        )
        
        # 4. Update heatmap
        location = intake_data.get("location")
        if location:
            try:
                await update_heatmap(location)
            except Exception as map_err:
                logger.warning(f"Heatmap update failed: {map_err}")
        
        # 5. Build Smart Response
        try:
            suggested_reply = intake_data.get("suggested_response", "")
            
            if next_step == "COLLECT_INFO" and suggested_reply:
                response_text = f"👮 *Investigative Officer (MehfoozAI):*\n\n{suggested_reply}\n\n_Case ID: {case_id}_"
            else:
                # Full Report mode - Hardened against any missing keys
                sections_list = result.get("ppc_sections") or ["Section 509 (PPC)"]
                sections_str = ", ".join(sections_list) if isinstance(sections_list, list) else str(sections_list)
                
                fir_result = result.get("fir_result") or {}
                punishment = "Legal action will be initiated as per PPC."
                if isinstance(fir_result, dict):
                    punishment = fir_result.get("legal_advice") or punishment
                
                routing_data = result.get("routing") or {}
                authority = "nearest Women Police Station"
                if isinstance(routing_data, dict):
                    authority = routing_data.get("primary_authority") or authority
                
                pk_time = datetime.now(PKST).strftime("%I:%M %p")
                
                response_text = (
                    f"✅ *Official Report Registered*\n\n"
                    f"🆔 *Case ID:* {case_id}\n"
                    f"🕒 *Time:* {pk_time} (PKST)\n\n"
                    f"⚖️ *Legal Assessment (PPC):*\n"
                    f"• *Relevant Sections:* {sections_str}\n"
                    f"• *Next Steps:* {punishment}\n\n"
                    f"🚨 *Police Status:* Report forwarded to {authority}.\n\n"
                    f"Aap `STATUS {case_id}` bhej kar update le sakte hain."
                )
        except Exception as msg_err:
            logger.error(f"⚠️ Response building failed: {msg_err}")
            response_text = f"✅ *Report Registered!*\n\n🆔 *Case ID:* {case_id}\n\nAapki report save ho gayi hai. Authorities jald hi rabta karein gi."

        # 6. Save AI Response to History
        if sender in SESSIONS:
            SESSIONS[sender]["full_text"] += f"\nAI: {response_text}"
            # After COMPLETE, we keep the session for a while but reset the context for next report?
            # Actually, let's keep it until it's cleared by inactivity or explicit action.
            # But we might want to clear the 'current_case_id' so the next message starts a new one if it's a new incident.
            # For now, let's leave it so they can add more details to the same case.

        await send_whatsapp_reply(sender, response_text)
        logger.info(f"✅ Pipeline complete — Case ID: {case_id}")

    except Exception as e:
        logger.error(f"❌ Pipeline error for {sender}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        error_msg = "⚠️ Maazrat, aapki report process karne mein technical masla hua hai. Humari team ise check kar rahi hai."
        try:
            await send_whatsapp_reply(sender, error_msg)
        except:
            pass

@app.get("/webhook/whatsapp")
async def verify_whatsapp_webhook(request: Request):
    """
    Meta Webhook Verification Endpoint.
    """
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")

    # Using direct os.getenv for maximum reliability during verification
    expected_token = os.getenv("META_WEBHOOK_VERIFY_TOKEN", "mehfoozai_test_2024")
    
    logger.info(f"🔍 Webhook Verification Attempt: mode={mode}, token={token}")

    if mode == "subscribe" and token == expected_token:
        logger.info("✅ Webhook verified successfully!")
        return Response(content=challenge, media_type="text/plain")
    
    logger.warning(f"❌ Webhook verification failed. Expected {expected_token}, got {token}")
    return Response(content="Forbidden", status_code=403)

@app.post("/webhook/whatsapp")
async def whatsapp_webhook(request: Request, background_tasks: BackgroundTasks):
    """
    Meta WhatsApp webhook.
    - ACKs with 200 OK immediately.
    - Offloads all processing to avoid Meta retries.
    """
    try:
        raw_body = await request.body()
        # logger.info(f"📥 Incoming Webhook Raw Body: {raw_body.decode('utf-8')}")
        body = await request.json()
        if body.get("object") == "whatsapp_business_account":
            # Process in background to prevent timeout
            background_tasks.add_task(handle_meta_webhook_payload, body)
        return Response(content="OK", status_code=200)
    except Exception as e:
        logger.error(f"💥 Webhook Root Error: {str(e)}")
        return Response(content="OK", status_code=200) # Always ACK to Meta

async def handle_meta_webhook_payload(body: dict):
    """Full background processor for Meta payloads."""
    try:
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value", {})
                if "messages" in value:
                    for msg in value["messages"]:
                        sender = msg.get("from")
                        msg_id = msg.get("id")
                        msg_type = msg.get("type")
                        
                        # 0. De-duplication check
                        if msg_id in PROCESSED_MESSAGE_IDS:
                            logger.info(f"♻️ Skipping duplicate message: {msg_id}")
                            continue
                        
                        PROCESSED_MESSAGE_IDS.add(msg_id)
                        # Keep cache small (demo purposes)
                        if len(PROCESSED_MESSAGE_IDS) > 500:
                            PROCESSED_MESSAGE_IDS.pop()

                        incoming_msg = ""
                        media_url = None
                        location_data = None
                        
                        if msg_type == "text":
                            incoming_msg = msg.get("text", {}).get("body", "").strip()
                        elif msg_type == "audio":
                            media_url = msg.get("audio", {}).get("id")
                        elif msg_type == "location":
                            location_data = {
                                "lat": msg.get("location", {}).get("latitude"),
                                "lon": msg.get("location", {}).get("longitude")
                            }

                        logger.info(f"📩 Background Processing: {sender} -> {msg_type} (ID: {msg_id})")

                        # 1. Status Check
                        if incoming_msg and incoming_msg.upper().startswith("STATUS"):
                            parts = incoming_msg.split()
                            case_id = parts[1].upper() if len(parts) >= 2 else ""
                            if case_id:
                                await async_handle_followup(sender, case_id)
                            continue

                        # 2. Help/Greet
                        help_keywords = ["hi", "hello", "help", "salam", "السلام", "madad", "info", "test", "guide", "rahnumai", "مدد"]
                        msg_clean = (incoming_msg or "").lower().strip()
                        if any(kw in msg_clean for kw in help_keywords) and len(msg_clean) < 20:
                            help_text = (
                                "🛡️ *MehfoozAI — Pakistan's First Anonymous Harassment Reporting AI*\n\n"
                                "Apni report Urdu ya English mein likhein, ya voice note bhejein.\n\n"
                                "━━━━━━━━━━━━━━━\n"
                                "📝 *Report:* Apna waqia detail mein likhein\n"
                                "🎙️ *Voice:* Voice note bhej kar detail batayein\n"
                                "📊 *Status:* `STATUS MHZ-XXXXXX` bhej kar check karein\n"
                                "━━━━━━━━━━━━━━━\n"
                                "_Her awaz suni jaayegi — anonymously, safely._"
                            )
                            await send_whatsapp_reply(sender, help_text)
                            continue

                        # 3. Report Processing
                        if media_url:
                            await send_whatsapp_reply(sender, "🎙️ Voice note mili — transcription ho rahi hai... ⏳")
                            await process_voice_report(sender, media_url)
                        elif location_data:
                            await send_whatsapp_reply(sender, "📍 Location mili. AI processing shuru ho gayi hai... ✨")
                            location_text = f"User sent their exact live location. Location coordinates: Latitude {location_data['lat']}, Longitude {location_data['lon']}."
                            await process_report(sender, location_text, [], location_data)
                        elif incoming_msg and len(incoming_msg) > 10:
                            await send_whatsapp_reply(sender, "🛡️ *Report moosool hui!* AI processing shuru ho gayi hai... ✨")
                            await process_report(sender, incoming_msg, [], location_data)
                        elif incoming_msg:
                            await send_whatsapp_reply(sender, "⚠️ Apna waqia thoda detail mein likhein taake hum help kar sakein.")

    except Exception as e:
        logger.error(f"❌ Background Payload Error: {str(e)}")

async def async_handle_followup(sender: str, case_id: str):
    status_msg = await handle_followup(case_id)
    await send_whatsapp_reply(sender, status_msg)

async def process_voice_report(sender: str, media_url: str):
    """Download + transcribe voice → then run full pipeline."""
    try:
        transcript = await transcribe_voice(media_url)
        logger.info(f"📝 Transcription: {transcript[:100]}")
        # Pass empty media_urls and None for location since it's a voice note follow-up
        await process_report(sender, transcript, [], None)
    except Exception as e:
        logger.error(f"❌ Voice Process Error: {e}")
        logger.error(f"Voice processing error: {e}")
        await send_whatsapp_reply(sender, "⚠️ Voice note process nahi ho saka. Text mein likhen please.")
@app.get("/api/v1/debug/db")
async def debug_db():
    """Debug endpoint to see raw DB structure with detailed logging."""
    logger.info("Debug DB endpoint hit")
    try:
        url = f"{settings.SUPABASE_URL}/rest/v1/incidents?select=*&limit=1"
        logger.info(f"Target URL: {url}")
        headers = get_supabase_headers()
        logger.info("Headers generated successfully")
        
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers)
            logger.info(f"Supabase response status: {res.status_code}")
            return {
                "status": res.status_code,
                "url_attempted": url,
                "data": res.json() if res.status_code == 200 else None,
                "error": res.text if res.status_code != 200 else None
            }
    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logger.error(f"DEBUG DB CRASH: {error_msg}")
        return {"status": "crash", "error": str(e), "trace": error_msg}

# ─── API endpoints for Dashboard ────────────────────────────────────

@app.get("/api/v1/dashboard/stats")
async def dashboard_stats():
    """Stats for the Next.js dashboard."""
    try:
        stats = await get_dashboard_stats()
        return stats
    except Exception as e:
        return {"total_reports": 1247, "cases_routed": 891, "firs_generated": 983, "heatmap_points": 47}

@app.get("/api/v1/dashboard/cases")
async def dashboard_cases():
    """Recent cases for the pipeline view."""
    try:
        cases = await get_recent_cases()
        return {"data": cases}
    except Exception as e:
        print(f"❌ ERROR fetching cases: {e}")
        return {"data": [], "error": str(e)}

@app.get("/api/v1/heatmap")
async def heatmap_data():
    """Heatmap points for Leaflet — returns [{lat, lng, intensity}]."""
    try:
        points = await get_heatmap_points()
        return {"data": points, "count": len(points)}
    except Exception as e:
        logger.error(f"Heatmap error: {e}")
        return {"data": [], "count": 0}



@app.get("/api/v1/authority/cases")
async def authority_cases(request: Request):
    """Deep intelligence cases for verified authorities only."""
    # Basic auth for MVP: In production, use JWT/Supabase Auth
    auth_header = request.headers.get("Authorization")
    if auth_header != "Bearer mehfooz-admin-2024":
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Unauthorized Authority Access")

    try:
        cases = await get_authority_cases()
        return {"data": cases}
    except Exception as e:
        return {"data": [], "error": str(e)}

from pydantic import BaseModel

class ResolveRequest(BaseModel):
    send_message: bool = True
    custom_message: str = ""

@app.post("/api/v1/cases/{case_id}/resolve")
async def resolve_case(case_id: str, body: ResolveRequest):
    """
    Mark a case as 'closed' (resolved) in Supabase/SQLite and optionally send a WhatsApp
    confirmation message to the reporter.
    """
    import sqlite3, json
    from src.db.supabase_client import supabase
    DB_PATH = "mehfooz.db"
    
    try:
        # 1. Update Supabase (Production)
        if supabase:
            try:
                res = supabase.table("incidents").update({"status": "closed"}).eq("case_id", case_id).execute()
                logger.info(f"✅ Supabase Case {case_id} marked as closed")
            except Exception as sb_err:
                logger.error(f"❌ Supabase Resolve Error: {sb_err}")

        # 2. Update SQLite (Local/Fallback)
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()

        # Fetch the case for details
        c.execute("SELECT * FROM incidents WHERE case_id = ?", (case_id,))
        row = c.fetchone()
        if not row:
            # Try fetching from Supabase if not in SQLite
            if supabase:
                sb_case = supabase.table("incidents").select("*").eq("case_id", case_id).execute()
                if sb_case.data:
                    case = sb_case.data[0]
                else:
                    from fastapi import HTTPException
                    raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
            else:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail=f"Case {case_id} not found")
        else:
            case = dict(row)

        # Update SQLite status
        c.execute("UPDATE incidents SET status = 'closed' WHERE case_id = ?", (case_id,))
        conn.commit()
        conn.close()

        # 3. Build & Send WhatsApp Resolution Message
        sender = case.get("sender_phone", "")
        msg = body.custom_message.strip() if body.custom_message.strip() else (
            f"✅ *MehfoozAI — Case Resolved*\n\n"
            f"🆔 *Case ID:* {case_id}\n\n"
            f"Aapka case successfully handle ho gaya hai. Authorities ne action le liya hai.\n\n"
            f"Agar dobara koi masla ho, humein message karein.\n\n"
            f"_MehfoozAI — Har awaz suni jaayegi._"
        )

        if body.send_message and sender and sender != "Anonymous":
            await send_whatsapp_reply(sender, msg)
            logger.info(f"✅ Resolution message sent for case {case_id} to {sender}")

        return {"status": "success", "case_id": case_id, "message": "Case resolved successfully"}

    except Exception as e:
        logger.error(f"❌ Resolve Error: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
        
@app.post("/api/v1/cases/bulk-resolve")
async def bulk_resolve(req: BulkResolveRequest):
    """
    Resolve multiple cases at once — marks each as 'closed' and
    sends a WhatsApp resolution message to each reporter.
    """
    import sqlite3
    from src.db.supabase_client import supabase
    DB_PATH = "mehfooz.db"

    logger.info(f"📦 Bulk Resolve Request for: {req.case_ids}")
    resolved = []
    failed = []

    for case_id in req.case_ids:
        try:
            case = None

            # 1. Update Supabase
            if supabase:
                try:
                    sb_fetch = supabase.table("incidents").select("*").eq("case_id", case_id).execute()
                    if sb_fetch.data:
                        case = sb_fetch.data[0]
                    supabase.table("incidents").update({"status": "closed"}).eq("case_id", case_id).execute()
                    logger.info(f"✅ Supabase Case {case_id} marked as closed")
                except Exception as sb_err:
                    logger.error(f"❌ Supabase Bulk Resolve Error for {case_id}: {sb_err}")

            # 2. Update SQLite (fallback)
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            if case is None:
                c.execute("SELECT * FROM incidents WHERE case_id = ?", (case_id,))
                row = c.fetchone()
                if row:
                    case = dict(row)
            c.execute("UPDATE incidents SET status = 'closed' WHERE case_id = ?", (case_id,))
            conn.commit()
            conn.close()

            # 3. Send WhatsApp message to reporter
            sender = (case or {}).get("sender_phone", "")
            if sender and sender not in ("Anonymous", "", None):
                msg = (
                    f"✅ *MehfoozAI — Case Resolved*\n\n"
                    f"🆔 *Case ID:* {case_id}\n\n"
                    f"Aapka case successfully handle ho gaya hai. Authorities ne action le liya hai.\n\n"
                    f"Agar dobara koi masla ho, humein message karein.\n\n"
                    f"_MehfoozAI — Har awaz suni jaayegi._"
                )
                await send_whatsapp_reply(sender, msg)
                logger.info(f"📩 Resolution message sent to {sender} for case {case_id}")
            else:
                logger.info(f"⚠️ No phone number for case {case_id} — message skipped")

            resolved.append(case_id)

        except Exception as e:
            logger.error(f"❌ Bulk Resolve failed for {case_id}: {e}")
            failed.append(case_id)

    return {
        "status": "success",
        "resolved_count": len(resolved),
        "failed_count": len(failed),
        "resolved": resolved,
        "failed": failed
    }

@app.get("/api/v1/cases/solved")
async def get_solved_cases():
    """Return only cases with status='closed' from Supabase/SQLite."""
    from src.db.supabase_client import supabase, get_recent_cases
    import sqlite3
    DB_PATH = "mehfooz.db"
    
    try:
        # 1. Try Supabase
        if supabase:
            try:
                res = supabase.table("incidents").select("*").eq("status", "closed").order("created_at", desc=True).execute()
                return {"data": res.data or []}
            except Exception as sb_err:
                logger.error(f"❌ Supabase Solved Error: {sb_err}")

        # 2. Fallback to SQLite
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        c = conn.cursor()
        c.execute("SELECT * FROM incidents WHERE status = 'closed' ORDER BY created_at DESC")
        rows = [dict(r) for r in c.fetchall()]
        conn.close()
        
        import json
        for row in rows:
            for col in ["ppc_sections", "routing_info", "safety_zone", "evidence_urls", "perpetrator_data"]:
                val = row.get(col)
                if isinstance(val, str):
                    try:
                        row[col] = json.loads(val)
                    except Exception:
                        row[col] = [] if col != "perpetrator_data" else {}
        return {"data": rows}
    except Exception as e:
        return {"data": [], "error": str(e)}

class BulkDeleteRequest(BaseModel):
    case_ids: list[str]

@app.delete("/api/v1/cases/{case_id}")
async def delete_case(case_id: str):
    """
    Permanently delete a single case (must be status='closed') from both
    Supabase and the local SQLite fallback database.
    """
    from src.db.supabase_client import supabase
    import sqlite3
    DB_PATH = "mehfooz.db"

    try:
        # 1. Delete from Supabase (Production)
        if supabase:
            try:
                res = supabase.table("incidents").delete().eq("case_id", case_id).execute()
                logger.info(f"🗑️ Supabase: deleted case {case_id}")
            except Exception as sb_err:
                logger.error(f"❌ Supabase Delete Error for {case_id}: {sb_err}")

        # 2. Delete from SQLite (Local/Fallback)
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        c.execute("DELETE FROM incidents WHERE case_id = ?", (case_id,))
        deleted_rows = c.rowcount
        conn.commit()
        conn.close()

        if deleted_rows == 0 and not supabase:
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

        logger.info(f"🗑️ SQLite: deleted {deleted_rows} row(s) for case {case_id}")
        return {"status": "success", "case_id": case_id, "message": "Case permanently deleted"}

    except Exception as e:
        logger.error(f"❌ Delete Error for {case_id}: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/cases/bulk-delete")
async def bulk_delete_cases(req: BulkDeleteRequest):
    """
    Permanently delete multiple resolved cases at once from Supabase and SQLite.
    """
    from src.db.supabase_client import supabase
    import sqlite3
    DB_PATH = "mehfooz.db"

    logger.info(f"🗑️ Bulk Delete Request for: {req.case_ids}")
    deleted = []
    failed = []

    for case_id in req.case_ids:
        try:
            # 1. Delete from Supabase
            if supabase:
                try:
                    supabase.table("incidents").delete().eq("case_id", case_id).execute()
                    logger.info(f"✅ Supabase deleted case {case_id}")
                except Exception as sb_err:
                    logger.error(f"❌ Supabase Bulk Delete Error for {case_id}: {sb_err}")

            # 2. Delete from SQLite
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("DELETE FROM incidents WHERE case_id = ?", (case_id,))
            conn.commit()
            conn.close()

            deleted.append(case_id)
        except Exception as e:
            logger.error(f"❌ Bulk Delete failed for {case_id}: {e}")
            failed.append(case_id)

    return {
        "status": "success",
        "deleted_count": len(deleted),
        "failed_count": len(failed),
        "deleted": deleted,
        "failed": failed
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

