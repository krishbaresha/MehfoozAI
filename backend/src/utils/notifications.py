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
        url = f"https://graph.facebook.com/v19.0/{settings.META_PHONE_NUMBER_ID}/messages"
        logger.info(f"📤 Attempting Meta API call to: {url.replace(settings.META_PHONE_NUMBER_ID, 'HIDDEN_ID')}")
        headers = {
            "Authorization": f"Bearer {settings.META_ACCESS_TOKEN.get_secret_value()}",
            "Content-Type": "application/json"
        }
        data = {
            "messaging_product": "whatsapp",
            "to": clean_number,
            "type": "text",
            "text": {"body": message}
        }
        for attempt in range(2):  # Try twice
            try:
                # Use a fresh client for each attempt with a longer timeout
                async with httpx.AsyncClient(timeout=60.0, verify=False) as client:
                    response = await client.post(url, headers=headers, json=data)
                    if response.status_code in (200, 201, 202):
                        logger.info(f"✅ WhatsApp reply sent via Meta to {clean_number}")
                        return
                    elif response.status_code == 401:
                        logger.error(f"❌ Meta Error 401 Unauthorized — The META_ACCESS_TOKEN in .env has likely expired or is invalid.")
                        return
                    else:
                        logger.warning(f"⚠️ Meta API failed ({response.status_code}): {response.text}")
                        return
            except (httpx.ConnectTimeout, httpx.ReadTimeout, httpx.WriteTimeout) as e:
                logger.warning(f"⏳ Meta API Timeout (Attempt {attempt+1}): {e}. Retrying...")
                continue
            except Exception as e:
                logger.error(f"❌ Meta API Connection Error: {type(e).__name__} - {str(e)}")
                return
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
