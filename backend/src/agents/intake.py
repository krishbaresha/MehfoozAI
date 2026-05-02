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
    emergency_keywords = ["help", "madad", "bachao", "rape", "attack", "maar", "khun", "gun", "pistol", "knife", "chaku", "suicide"]
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
    elif "suicide" in text_lower or "khudkushi" in text_lower:
        incident_type = "Emergency"
    else:
        incident_type = "Harassment"

    return {
        "incident_type": incident_type,
        "location": location or "Location Not Specified",
        "time": "Not specified",
        "perpetrator_description": "Not specified",
        "complainant_name": "Anonymous",
        "complainant_cnic": None,
        "summary": text[:200],
        "is_emergency": is_emergency,
        "credibility_score": 60,
        "next_step": "COMPLETE",
        "suggested_response": "Aapki report register ho rahi hai. Hum jald action lenge."
    }


async def extract_details(user_input: str) -> dict:
    """
    Uses Llama 3.3 to extract incident details.
    Improved for loop prevention and emergency detection.
    """
    # Fail-safe: Check conversation turns to prevent loops
    user_turns = user_input.count("User:")
    loop_prevention_hint = ""
    if user_turns >= 2:
        loop_prevention_hint = "ATTENTION: This is a follow-up message. You MUST set next_step to 'COMPLETE' and finalize the report now. No more questions."

    prompt = f"""
You are a Senior Police Investigator for MehfoozAI Pakistan. Your goal is to gather high-quality intelligence for authorities.
{loop_prevention_hint}

A victim has sent you this message via WhatsApp (contains history):
"{user_input}"

Analyze the conversation and return structured JSON. 

INVESTIGATION RULES:
1. PRIORITIZE COMPLETION. If you have a general idea of WHAT happened and WHERE, set next_step to "COMPLETE".
2. NO ENDLESS LOOPS. If this looks like a follow-up message (User: ... AI: ... User: ...), you MUST set next_step to "COMPLETE".
3. EMERGENCY: If the user is in danger (suicide, attack, weapons), IMMEDIATELY set next_step to "COMPLETE".
4. MISSING DATA: If location is missing, ask ONCE in Roman Urdu. If they still don't provide it, set "COMPLETE" with "Location Unknown".
5. suggested_response: If next_step is "COLLECT_INFO", ask a SHORT, specific question in Roman Urdu (e.g., "G, ye kis jagah hua?").

Return ONLY a valid JSON object:
{{
  "incident_type": "string (Harassment/Stalking/Physical Assault/Cyber Harassment/Emergency)",
  "location": "string or null",
  "time": "string or null",
  "perpetrator_description": "string or null",
  "complainant_name": "Anonymous",
  "summary": "string",
  "is_emergency": boolean,
  "credibility_score": integer (1-100),
  "next_step": "COMPLETE" or "COLLECT_INFO",
  "suggested_response": "Short question in Roman Urdu if COLLECT_INFO, else empty"
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

        # Normalize credibility_score
        score = result.get("credibility_score", 70)
        if isinstance(score, (int, float)) and score <= 10:
            result["credibility_score"] = int(score * 10)

        # Fallback location
        if not result.get("location") or result["location"].lower() in ("null", "none", "not specified", "unknown"):
            fb = _fallback_extract(user_input)
            if fb["location"] != "Location Not Specified":
                result["location"] = fb["location"]
                logger.info(f"📍 Fallback location extracted: {result['location']}")

        logger.info(f"✅ Intake complete — type={result.get('incident_type')}, loc={result.get('location')}, step={result.get('next_step')}")
        return result

    except Exception as e:
        logger.error(f"Groq API Error in intake: {e}")
        return _fallback_extract(user_input)
