from groq import AsyncGroq
from src.config.settings import settings
import json
import re
from loguru import logger

client = AsyncGroq(api_key=settings.GROQ_API_KEY.get_secret_value())

# Known Pakistani cities/areas for fallback extraction
KNOWN_LOCATIONS = [
    "saddar", "gulshan", "lyari", "korangi", "nazimabad", "north nazimabad",
    "site", "defence", "dha", "clifton", "orangi", "malir", "landhi",
    "karachi", "lahore", "islamabad", "rawalpindi", "faisalabad", "multan",
    "peshawar", "quetta", "hyderabad", "sukkur", "bahawalpur", "sialkot",
    "gujranwala", "abbottabad", "mardan", "mingora", "dera ghazi khan",
    "empress market", "cantonment", "johar", "federal b area", "fb area",
    "bahria", "dha", "pwd", "g-9", "g-10", "g-11", "f-7", "f-8", "i-8",
]

def _fallback_extract(text: str) -> dict:
    """Rule-based fallback if Groq is unavailable."""
    text_lower = text.lower()

    # Location detection
    location = None
    for loc in KNOWN_LOCATIONS:
        if loc in text_lower:
            location = loc.title()
            break

    # Emergency keyword detection
    emergency_keywords = ["help", "madad", "bachao", "rape", "attack", "maar", "khun", "gun", "pistol", "knife", "chaku"]
    is_emergency = any(k in text_lower for k in emergency_keywords)

    # Incident type detection
    if any(k in text_lower for k in ["follow", "peeche", "stalk"]):
        incident_type = "Stalking"
    elif any(k in text_lower for k in ["maar", "attack", "assault", "peet"]):
        incident_type = "Physical Assault"
    elif any(k in text_lower for k in ["gandi", "bura", "harass", "taunt", "chherna"]):
        incident_type = "Verbal Harassment"
    elif any(k in text_lower for k in ["cyber", "online", "social media", "message", "photo"]):
        incident_type = "Cyber Harassment"
    else:
        incident_type = "Harassment"

    return {
        "incident_type": incident_type,
        "location": location or "Location Not Specified",
        "time": "Not specified",
        "perpetrator_description": "Not specified",
        "complainant_name": "Anonymous",
        "complainant_cnic": None,
        "is_emergency": is_emergency,
        "credibility_score": 6,
        "next_step": "COMPLETE",
        "suggested_response": "Aapki report register ho rahi hai. Hum jald action lenge."
    }


async def extract_details(user_input: str) -> dict:
    """
    Uses Llama 3.3 to extract incident details.
    For hackathon demo: completes with partial data (location + incident type sufficient).
    """
    prompt = f"""
You are a Senior Police Investigator for MehfoozAI Pakistan. Your goal is to gather high-quality intelligence for authorities.
A victim has sent you this message via WhatsApp:

"{user_input}"

Analyze the conversation and return structured JSON. 

INVESTIGATION RULES:
1. Be thorough. We need: Incident Type, Specific Location (Landmark/Street), Time, Perpetrator Description (Clothes, Age, Build), and Evidence (if any).
2. ONLY set next_step to "COMPLETE" if:
   - You have a clear incident type AND a specific location AND a basic perpetrator description.
   - OR if the user is in an active emergency (is_emergency: true).
   - OR if the user says they don't have any more details.
3. If details are missing, set next_step to "COLLECT_INFO" and use "suggested_response" to ask for the missing piece (e.g., "Kya aap bata sakti hain usne kya pehna tha?" or "Ye Saddar mein kis jagah hua?").
4. Extract location from ANY landmark, shop name, or street mentioned.
5. summary: This is for authorities. Write a high-impact, 1-2 sentence tactical summary. Focus on WHO, WHERE, and WHAT.

Return ONLY a valid JSON object:
{{
  "incident_type": "string (Harassment/Stalking/Physical Assault/Cyber Harassment/Rape/Attempted Assault)",
  "location": "string or null (city/area/landmark)",
  "time": "string or null",
  "perpetrator_description": "string or null",
  "complainant_name": "Anonymous",
  "complainant_cnic": null,
  "summary": "string (TACTICAL SUMMARY: [Type] reported at [Location] involving [Perp Description]. Action level: [Urgency])",
  "is_emergency": boolean,
  "credibility_score": integer (1-100),
  "next_step": "COMPLETE" or "COLLECT_INFO",
  "suggested_response": "Empathetic, investigative response in Roman Urdu (1-2 sentences)"
}}
"""

    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a specialized legal intake AI. Always return valid JSON."},
                {"role": "user", "content": prompt},
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            timeout=20.0,
        )
        result = json.loads(chat_completion.choices[0].message.content)

        # Normalize credibility_score: AI sometimes returns 1-10 scale, normalize to 1-100
        score = result.get("credibility_score", 70)
        if isinstance(score, (int, float)) and score <= 10:
            result["credibility_score"] = int(score * 10)

        # Fallback location: if AI returned null/empty, try rule-based extraction
        if not result.get("location") or result["location"].lower() in ("null", "none", "not specified", "unknown"):
            fb = _fallback_extract(user_input)
            if fb["location"] != "Location Not Specified":
                result["location"] = fb["location"]
                logger.info(f"📍 Fallback location extracted: {result['location']}")

        logger.info(f"✅ Intake complete — type={result.get('incident_type')}, loc={result.get('location')}, step={result.get('next_step')}")
        return result

    except Exception as e:
        logger.error(f"Groq API Error in intake: {e}")
        # Full fallback — don't let the pipeline die
        return _fallback_extract(user_input)
