from groq import AsyncGroq
from src.config.settings import settings
import json

client = AsyncGroq(api_key=settings.GROQ_API_KEY.get_secret_value())

async def map_to_safety_zones(details: dict) -> dict:
    """
    Safety Mapper Agent: Analyzes location + incident type to classify danger level
    and recommend patrol action.
    """
    prompt = f"""
    You are the Safety Mapper AI for MehfoozAI, a women's safety platform in Pakistan.
    Analyze the following incident to identify danger zone severity and recommend an action.
    
    Incident: {json.dumps(details)}
    
    Return ONLY a JSON object with these keys:
    - danger_level: ("low" | "medium" | "high" | "critical")
    - zone_type: (e.g., "Public Transport", "Workplace", "Street", "Home", "Online")
    - patrol_recommendation: (one sentence action for police)
    - is_recurring_pattern: (boolean — true if this area likely has repeat incidents)
    - priority_score: (integer 1-10)
    
    JSON:
    """
    chat_completion = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are a geographic safety analyst for Pakistan."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"},
    )
    return json.loads(chat_completion.choices[0].message.content)
