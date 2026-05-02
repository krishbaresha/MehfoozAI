import httpx
import resend
from src.config.settings import settings
from loguru import logger

if settings.RESEND_API_KEY:
    resend.api_key = settings.RESEND_API_KEY.get_secret_value()
else:
    logger.warning("RESEND_API_KEY not configured. Email notifications will be disabled.")

from twilio.rest import Client

def _meta_configured() -> bool:
    """Check if Meta API credentials are properly set."""
    return bool(
        settings.META_ACCESS_TOKEN
        and settings.META_PHONE_NUMBER_ID
        and settings.META_ACCESS_TOKEN.get_secret_value() != "placeholder"
    )

def _twilio_configured() -> bool:
    """Check if Twilio credentials are properly set."""
    return bool(
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_WHATSAPP_NUMBER
    )

async def send_whatsapp_reply(to_number: str, message: str):
    """
    Send a WhatsApp reply via Meta Cloud API.
    """
    if _meta_configured():
        clean_number = to_number.replace("whatsapp:", "").replace("+", "")
        # Mask the token for logs but check if it's there
        token_preview = f"{settings.META_ACCESS_TOKEN.get_secret_value()[:10]}..." if settings.META_ACCESS_TOKEN else "MISSING"
        url = f"https://graph.facebook.com/v21.0/{settings.META_PHONE_NUMBER_ID}/messages"
        
        logger.info(f"🔗 Meta Request: URL={url} | Phone={clean_number} | Token={token_preview}")

        headers = {
            "Authorization": f"Bearer {settings.META_ACCESS_TOKEN.get_secret_value()}",
            "Content-Type": "application/json",
        }
        data = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_number,
            "type": "text",
            "text": {"body": message}
        }
        
        import requests
        session = requests.Session()
        
        for attempt in range(1, 4): # Try 3 times
            try:
                logger.info(f"📤 [Attempt {attempt}] Sending to {clean_number}...")
                response = session.post(url, headers=headers, json=data, timeout=15)
                
                if response.status_code in (200, 201, 202):
                    logger.info(f"✅ WhatsApp reply SUCCESS for {clean_number}")
                    return
                
                logger.error(f"❌ Meta API Error {response.status_code}: {response.text}")
                if response.status_code in (401, 403):
                    logger.error("🛑 Auth Error. Check Token/Permissions.")
                    return
                # On 500 or 429, we might want to retry
                
            except requests.exceptions.Timeout:
                logger.warning(f"⏳ Timeout on attempt {attempt} (15s). Retrying...")
            except Exception as e:
                logger.error(f"💥 Connection Error on attempt {attempt}: {type(e).__name__} - {str(e)}")
            
            import time
            time.sleep(1) # Small gap between retries

    else:
        logger.error("❌ Meta API not configured. Check META_ACCESS_TOKEN and META_PHONE_NUMBER_ID in .env")



def send_case_confirmation(to_number: str, case_id: str, routing: dict) -> str:
    """Returns formatted case confirmation text (used as TwiML body)."""
    authority = routing.get("primary_authority", "Nearest Police Station")
    support = routing.get("secondary_support", "Madadgaar 15")
    return (
        f"🛡️ *MehfoozAI* — Report Received Anonymously\n\n"
        f"📋 *Case ID:* `{case_id}`\n"
        f"_(Save this to track your case)_\n\n"
        f"✅ *FIR drafted* with relevant PPC sections\n"
        f"🚔 *Routed to:* {authority}\n"
        f"💙 *Support:* {support}\n\n"
        f"💬 To check status, reply: *STATUS {case_id}*\n\n"
        f"_Her awaz suni jaayegi — anonymously, safely._"
    )
