from groq import AsyncGroq
from src.config.settings import settings
import json

client = AsyncGroq(api_key=settings.GROQ_API_KEY.get_secret_value())

async def draft_fir(details: dict) -> dict:
    """
    Drafts a formal FIR and maps it to PPC sections.
    """
    prompt = f"""
    You are a Legal AI Assistant specializing in the Pakistan Penal Code (PPC).
    Based on the incident details provided, draft a formal FIR (First Information Report) in both English and Urdu.
    Also, identify the relevant PPC sections (e.g., Section 354, 509).
    
    Incident Details: {json.dumps(details)}
    
    Return ONLY a JSON object with the following keys:
    - fir_text_english: (string)
    - fir_text_urdu: (string)
    - ppc_sections: (list of strings like ["Section 509", "Section 354"])
    - legal_advice: (one sentence for the victim)
    
    JSON:
    """
    
    chat_completion = await client.chat.completions.create(
        messages=[
            {"role": "system", "content": "You are an expert in Pakistani criminal law."},
            {"role": "user", "content": prompt},
        ],
        model="llama-3.3-70b-versatile",
        response_format={"type": "json_object"}
    )
    
    return json.loads(chat_completion.choices[0].message.content)
