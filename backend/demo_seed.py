import asyncio
import uuid
import random
from datetime import datetime, timedelta
from src.db.supabase import save_incident, update_heatmap
from loguru import logger

CITIES = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Rawalpindi"]
CATEGORIES = ["Stalking", "Verbal Harassment", "Cyberbullying", "Physical Assault", "Workplace Harassment"]
PPC_MAPPING = {
    "Stalking": ["PPC 509", "PECA 21"],
    "Verbal Harassment": ["PPC 509"],
    "Cyberbullying": ["PECA 20", "PECA 21"],
    "Physical Assault": ["PPC 354"],
    "Workplace Harassment": ["PPC 509", "AASHA Act 2010"]
}

async def seed_data(count: int = 55):
    """Seed dummy cases to test the dashboard pipeline."""
    logger.info(f"Seeding {count} dummy cases...")
    for i in range(count):
        case_id = f"MHZ-{str(uuid.uuid4()).upper()[:6]}"
        city = random.choice(CITIES)
        category = random.choice(CATEGORIES)
        ppc = PPC_MAPPING[category]
        
        # Save incident
        await save_incident(
            case_id=case_id,
            transcription=f"Dummy report: Someone is harassing me near {city} central area.",
            details={"incident_type": category, "location": city},
            fir_draft=f"FIR DRAFT for {category} in {city}...",
            ppc_sections=ppc,
            routing={"primary_authority": f"Women Police Station {city}"}
        )
        
        # Heatmap
        await update_heatmap(city)
        logger.info(f"Seeded: {case_id} — {city} ({category})")
        
    logger.info("✅ Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
