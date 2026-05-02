import sqlite3
import uuid
import json
from datetime import datetime

DB_PATH = "mehfooz.db"

def seed():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    
    # Clear old data if any
    c.execute("DELETE FROM incidents")
    
    cases = [
        ("MHZ-HYD001", "Verbal harassment at Tower Market, Hyderabad", "Verbal Harassment", "Hyderabad", 25.3960, 68.3578),
        ("MHZ-KHI992", "Stalking incident near Empress Market", "Stalking", "Karachi", 24.8607, 67.0011),
        ("MHZ-LHR441", "Workplace harassment reported in Gulberg", "Workplace Harassment", "Lahore", 31.5204, 74.3587),
    ]
    
    for cid, desc, cat, loc, lat, lon in cases:
        idx = str(uuid.uuid4())
        c.execute('''INSERT INTO incidents 
            (id, case_id, description, transcription, category, status, location_name, latitude, longitude, ppc_sections, fir_draft, routing_info, safety_zone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (idx, cid, desc, desc, cat, "routed", loc, lat, lon, 
             json.dumps(["Section 509"]), "Sample FIR Draft...", 
             json.dumps({"primary_authority": f"{loc} Police Station"}), 
             json.dumps({"danger_level": "medium"})))
    
    conn.commit()
    conn.close()
    print("✅ Database seeded with live-looking data!")

if __name__ == "__main__":
    seed()
