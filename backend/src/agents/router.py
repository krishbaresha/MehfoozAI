from groq import AsyncGroq
from src.config.settings import settings
import json

client = AsyncGroq(api_key=settings.GROQ_API_KEY.get_secret_value())

async def route_report(details: dict) -> dict:
    """
    Decides where to route the report (Police vs NGO).
    """
    prompt = f"""
    You are a Safety Dispatcher for MehfoozAI. 
    Based on the incident type and location, identify the most appropriate authority or NGO in Pakistan.
    
    Details: {json.dumps(details)}
    
    Return ONLY a JSON object with the following keys:
    - primary_authority: (e.g., Saddar Women Police Station, Karachi)
    - secondary_support: (e.g., Panah Shelter Home, Madadgaar 15)
    - action_required: (e.g., Immediate Patrol, Legal Counseling)
    - contact_info: (string)
    
    JSON:
    """
    
    chat_completion = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert in Pakistani emergency and social services."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    return json.loads(chat_completion.choices[0].message.content)
