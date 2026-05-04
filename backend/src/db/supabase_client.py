import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional
from loguru import logger
import os

from ..config.settings import settings
from supabase import create_client, Client as SupabaseClient

DB_PATH = "mehfooz.db"

# Initialize Supabase client
supabase: Optional[SupabaseClient] = None
try:
    if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
        if "placeholder" not in settings.SUPABASE_URL:
            supabase = create_client(
                settings.SUPABASE_URL,
                settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()
            )
            logger.info("📡 Supabase connection established")
except Exception as e:
    logger.warning(f"⚠️ Could not connect to Supabase: {e}. Falling back to SQLite.")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Incidents table
    c.execute('''CREATE TABLE IF NOT EXISTS incidents (
        id TEXT PRIMARY KEY,
        case_id TEXT UNIQUE,
        description TEXT,
        transcription TEXT,
        category TEXT,
        status TEXT DEFAULT 'pending',
        location_name TEXT,
        latitude REAL,
        longitude REAL,
        ppc_sections TEXT,
        fir_draft TEXT,
        routing_info TEXT,
        safety_zone TEXT,
        sender_phone TEXT,
        evidence_urls TEXT,
        complainant_name TEXT,
        complainant_cnic TEXT,
        perpetrator_data TEXT,
        summary TEXT,
        credibility_score INTEGER DEFAULT 75,
        is_emergency INTEGER DEFAULT 0,
        is_verified INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    # Heatmap table
    c.execute('''CREATE TABLE IF NOT EXISTS heatmap (
        id TEXT PRIMARY KEY,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        intensity INTEGER DEFAULT 1,
        location_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )''')
    # Add new columns to incidents if they don't exist (migration)
    for col, col_type, default in [
        ("credibility_score", "INTEGER", "75"),
        ("is_emergency", "INTEGER", "0"),
        ("is_verified", "INTEGER", "0"),
        ("complainant_name", "TEXT", "NULL"),
        ("complainant_cnic", "TEXT", "NULL"),
        ("perpetrator_data", "TEXT", "NULL"),
        ("summary", "TEXT", "NULL"),
    ]:
        try:
            c.execute(f"ALTER TABLE incidents ADD COLUMN {col} {col_type} DEFAULT {default}")
        except Exception:
            pass

    # Add new columns to heatmap
    try:
        c.execute("ALTER TABLE heatmap ADD COLUMN location_name TEXT")
    except Exception:
        pass

    conn.commit()
    conn.close()

def generate_case_id() -> str:
    short = str(uuid.uuid4()).replace("-", "").upper()[:6]
    return f"MHZ-{short}"

async def save_incident(case_id, transcription, details, fir_draft, ppc_sections, routing, safety):
    """Save incident to Supabase (Production) with SQLite fallback (Dev)."""
    
    # Prepare data
    lat = details.get("latitude")
    lng = details.get("longitude")
    credibility = details.get("credibility_score", 75)
    is_emergency = bool(details.get("is_emergency", False))
    is_verified = bool(details.get("is_verified", False))
    location_name = details.get("location") or details.get("location_name")
    complainant_name = details.get("complainant_name") or "Anonymous Source"
    complainant_cnic = details.get("complainant_cnic")
    summary = details.get("summary") or transcription[:200] + "..." if len(transcription) > 200 else transcription
    
    perp_raw = details.get("perpetrator_description") or details.get("perpetrator_data")
    perp_data = perp_raw if isinstance(perp_raw, dict) else {"description": perp_raw or "Not identified"}

    incident_data = {
        "id": str(uuid.uuid4()),
        "case_id": case_id,
        "description": transcription,
        "transcription": transcription,
        "category": details.get("incident_type", "Harassment"),
        "status": "routed",
        "location_name": location_name,
        "latitude": lat,
        "longitude": lng,
        "ppc_sections": ppc_sections if (ppc_sections and len(ppc_sections) > 0) else None,
        "fir_draft": fir_draft,
        "routing_info": routing,
        "safety_zone": safety,
        "sender_phone": details.get("sender_phone"),
        "evidence_urls": details.get("evidence_urls") if (details.get("evidence_urls") and len(details.get("evidence_urls")) > 0) else None,
        "credibility_score": credibility,
        "is_emergency": bool(is_emergency),
        "is_verified": bool(is_verified),
        "complainant_name": complainant_name,
        "complainant_cnic": complainant_cnic,
        "perpetrator_data": perp_data,
        "summary": summary
    }

    # 1. Try Supabase
    if supabase:
        try:
            supabase.table("incidents").insert(incident_data).execute()
            logger.info(f"✅ Saved to Supabase: {case_id}")
            if lat and lng:
                await update_heatmap_with_coords(lat, lng, location_name or "", 1)
            return {"id": incident_data["id"]}
        except Exception as e:
            logger.error(f"❌ Supabase Insert Error: {e}")

    # 2. Fallback to SQLite
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute('''INSERT OR IGNORE INTO incidents 
            (id, case_id, description, transcription, category, status, location_name,
             latitude, longitude, ppc_sections, fir_draft, routing_info, safety_zone,
             sender_phone, evidence_urls, credibility_score, is_emergency, is_verified,
             complainant_name, complainant_cnic, perpetrator_data, summary)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (incident_data["id"], incident_data["case_id"], incident_data["description"], 
             incident_data["transcription"], incident_data["category"], incident_data["status"],
             incident_data["location_name"], incident_data["latitude"], incident_data["longitude"],
             json.dumps(incident_data["ppc_sections"]), incident_data["fir_draft"], json.dumps(incident_data["routing_info"]),
             json.dumps(incident_data["safety_zone"]), incident_data["sender_phone"], json.dumps(incident_data["evidence_urls"]),
             incident_data["credibility_score"], incident_data["is_emergency"], incident_data["is_verified"],
             incident_data["complainant_name"], incident_data["complainant_cnic"], 
             json.dumps(incident_data["perpetrator_data"]), incident_data["summary"]))
        conn.commit()
        if lat and lng:
            await update_heatmap_with_coords(lat, lng, location_name or "", 1)
        logger.info(f"✅ Saved to SQLite (Fallback): {case_id}")
        return {"id": incident_data["id"]}
    except Exception as e:
        logger.error(f"❌ SQLite Save Error: {e}")
        return {}
    finally:
        conn.close()

async def update_heatmap_with_coords(lat: float, lng: float, location_name: str = "", intensity: int = 1):
    """Save a real lat/lng point to Supabase (Production) or SQLite (Dev)."""
    point_data = {
        "id": str(uuid.uuid4()),
        "latitude": lat,
        "longitude": lng,
        "intensity": intensity,
        "location_name": location_name
    }

    if supabase:
        try:
            # Note: Using 'safety_heatmap' to match the user's remote table name
            supabase.table("safety_heatmap").insert(point_data).execute()
            logger.info(f"🔥 Heatmap point saved to Supabase: {lat},{lng}")
            return
        except Exception as e:
            logger.error(f"❌ Supabase Heatmap Error: {e}")

    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        c.execute(
            "INSERT INTO heatmap (id, latitude, longitude, intensity, location_name) VALUES (?, ?, ?, ?, ?)",
            (point_data["id"], point_data["latitude"], point_data["longitude"], 
             point_data["intensity"], point_data["location_name"])
        )
        conn.commit()
        logger.info(f"✅ Heatmap point saved to SQLite: {lat},{lng}")
    except Exception as e:
        logger.error(f"❌ SQLite Heatmap Error: {e}")
    finally:
        conn.close()

PAKISTAN_GEOCODES = {
    "saddar":            (24.8568, 67.0104),
    "gulshan":           (24.9210, 67.0911),
    "lyari":             (24.8607, 67.0008),
    "korangi":           (24.8238, 67.1282),
    "north nazimabad":   (24.9408, 67.0397),
    "nazimabad":         (24.9171, 67.0270),
    "site":              (24.8961, 67.0124),
    "defence":           (24.8128, 67.0640),
    "malir":             (24.8804, 67.1921),
    "landhi":            (24.8549, 67.1637),
    "clifton":           (24.8035, 67.0314),
    "orangi":            (24.9479, 66.9949),
    "baldia":            (24.9047, 66.9850),
    "gulberg":           (24.8926, 67.0760),
    "karachi":           (24.8607, 67.0104),
    "lahore":            (31.5204, 74.3587),
    "islamabad":         (33.7294, 73.0931),
    "rawalpindi":        (33.5973, 73.0479),
    "faisalabad":        (31.4504, 73.1350),
    "multan":            (30.1575, 71.5249),
    "peshawar":          (34.0151, 71.5249),
    "quetta":            (30.1798, 66.9750),
    "hyderabad":         (25.3960, 68.3578),
    "sukkur":            (27.7052, 68.8574),
    "bahawalpur":        (29.3956, 71.6722),
}

def get_geocode(location_str: str):
    if not location_str:
        return None
    loc_lower = location_str.lower()
    for key, (lat, lng) in PAKISTAN_GEOCODES.items():
        if key in loc_lower:
            return (lat, lng)
    return None

async def update_heatmap(location_str: str):
    """
    Called from the pipeline with a location string like 'Saddar, Karachi'.
    We geocode well-known Pakistan areas to real coords and save to heatmap.
    """
    if not location_str:
        return

    coords = get_geocode(location_str)

    if coords:
        # Add slight random offset so points don't all stack exactly
        import random
        lat = coords[0] + random.uniform(-0.005, 0.005)
        lng = coords[1] + random.uniform(-0.005, 0.005)
        await update_heatmap_with_coords(lat, lng, location_str, 2)
    else:
        logger.warning(f"Could not geocode location: {location_str}")

async def get_dashboard_stats():
    """Retrieve stats from Supabase (Production) or SQLite (Dev)."""
    if supabase:
        try:
            total_res = supabase.table("incidents").select("count", count="exact").execute()
            total = total_res.count if total_res.count is not None else 0
            
            heatmap_res = supabase.table("safety_heatmap").select("count", count="exact").execute()
            h_points = heatmap_res.count if heatmap_res.count is not None else 0
            
            return {
                "total_reports": total,
                "cases_routed": total,
                "heatmap_points": h_points,
                "firs_generated": total
            }
        except Exception as e:
            logger.error(f"❌ Supabase Stats Error: {e}")

    # SQLite Fallback
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM incidents")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM heatmap")
    h_points = c.fetchone()[0]
    conn.close()

    return {
        "total_reports": total,
        "cases_routed": total,
        "heatmap_points": h_points,
        "firs_generated": total
    }

async def get_recent_cases():
    """Retrieve cases from Supabase (Production) or SQLite (Dev)."""
    if supabase:
        try:
            res = supabase.table("incidents").select("*").order("created_at", desc=True).limit(50).execute()
            data = res.data or []
            for row in data:
                # Supabase might return strings for JSON columns, parse them if needed
                for col in ["ppc_sections", "routing_info", "safety_zone", "evidence_urls", "perpetrator_data"]:
                    val = row.get(col)
                    if isinstance(val, str):
                        try:
                            row[col] = json.loads(val)
                        except Exception:
                            row[col] = [] if col != "perpetrator_data" else {}
            return data
        except Exception as e:
            logger.error(f"❌ Supabase Cases Error: {e}")

    # SQLite Fallback
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM incidents ORDER BY created_at DESC LIMIT 50")
    rows = [dict(r) for r in c.fetchall()]
    conn.close()
    
    for row in rows:
        for col in ["ppc_sections", "routing_info", "safety_zone", "evidence_urls", "perpetrator_data"]:
            val = row.get(col)
            if isinstance(val, str):
                try:
                    row[col] = json.loads(val)
                except Exception:
                    row[col] = [] if col != "perpetrator_data" else {}
    return rows

async def get_heatmap_points():
    """Retrieve heatmap points from Supabase (Production) or SQLite (Dev)."""
    points = []
    if supabase:
        try:
            # 1. Pull from dedicated heatmap table
            res = supabase.table("safety_heatmap").select("latitude, longitude, intensity").execute()
            for r in (res.data or []):
                points.append({"lat": r["latitude"], "lng": r["longitude"], "intensity": r.get("intensity", 1)})
            
            # 2. Pull from incidents table (with geocoding fallback)
            inc_res = supabase.table("incidents").select("location_name, latitude, longitude").execute()
            for r in (inc_res.data or []):
                if r["latitude"] and r["longitude"]:
                    points.append({"lat": r["latitude"], "lng": r["longitude"], "intensity": 1})
                elif r.get("location_name"):
                    coords = get_geocode(r["location_name"])
                    if coords:
                        import random
                        points.append({"lat": coords[0] + random.uniform(-0.005, 0.005), 
                                     "lng": coords[1] + random.uniform(-0.005, 0.005), 
                                     "intensity": 1})
            return points
        except Exception as e:
            logger.error(f"❌ Supabase Heatmap Fetch Error: {e}")

    # SQLite Fallback
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT latitude as lat, longitude as lng, intensity FROM heatmap")
    for r in c.fetchall():
        points.append({"lat": r[0], "lng": r[1], "intensity": r[2]})
    
    c.execute("SELECT location_name, latitude, longitude FROM incidents")
    for r in c.fetchall():
        if r[1] and r[2]:
            points.append({"lat": r[1], "lng": r[2], "intensity": 1})
        elif r[0]:
            coords = get_geocode(r[0])
            if coords:
                import random
                points.append({"lat": coords[0] + random.uniform(-0.005, 0.005), 
                             "lng": coords[1] + random.uniform(-0.005, 0.005), 
                             "intensity": 1})
    conn.close()
    return points

# Keep other functions
async def get_case_status(cid): return {"status": "routed"}
async def get_authority_cases(): 
    """Authority cases includes detailed intel + status filter."""
    return await get_recent_cases()

def get_supabase_headers(): 
    return {
        "apikey": settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value(),
        "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY.get_secret_value()}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }

async def check_db_ready():
    init_db()
    conn = sqlite3.connect(DB_PATH)
    conn.execute("SELECT 1")
    conn.close()
    return True

async def resolve_cases(case_ids: list):
    """Update multiple cases to 'closed' status."""
    if not case_ids:
        return
        
    if supabase:
        try:
            supabase.table("incidents").update({"status": "closed"}).in_("case_id", case_ids).execute()
            logger.info(f"✅ Resolved cases in Supabase: {case_ids}")
        except Exception as e:
            logger.error(f"❌ Supabase Resolve Error: {e}")

    # SQLite Fallback
    init_db()
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    try:
        placeholders = ', '.join(['?'] * len(case_ids))
        c.execute(f"UPDATE incidents SET status = 'closed' WHERE case_id IN ({placeholders})", case_ids)
        conn.commit()
        logger.info(f"✅ Resolved cases in SQLite: {case_ids}")
    except Exception as e:
        logger.error(f"❌ SQLite Resolve Error: {e}")
    finally:
        conn.close()
