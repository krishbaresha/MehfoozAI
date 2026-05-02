from groq import Groq
from src.config.settings import settings
import httpx
import os
from loguru import logger
from typing import Optional

client = Groq(api_key=settings.GROQ_API_KEY.get_secret_value())

async def get_meta_media_url(media_id: str) -> Optional[str]:
    """Get the download URL for a media file from Meta API."""
    if not settings.META_ACCESS_TOKEN:
        return None
    
    url = f"https://graph.facebook.com/v19.0/{media_id}"
    headers = {"Authorization": f"Bearer {settings.META_ACCESS_TOKEN.get_secret_value()}"}
    
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(url, headers=headers)
            if response.status_code == 200:
                return response.json().get("url")
            else:
                logger.error(f"Meta Media URL Error {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Error fetching Meta media URL: {e}")
    return None

async def transcribe_voice(media_id_or_url: str) -> str:
    """
    Downloads audio and transcribes it using Groq Whisper.
    Supports both direct URLs (Twilio) and Media IDs (Meta).
    """
    file_path = "temp_voice.ogg"
    
    # 1. Determine download URL and headers
    download_url = media_id_or_url
    headers = {}

    # If it's a Meta Media ID (numeric-ish), get the URL first
    if media_id_or_url.isdigit() or len(media_id_or_url) > 10 and not media_id_or_url.startswith("http"):
        meta_url = await get_meta_media_url(media_id_or_url)
        if meta_url:
            download_url = meta_url
            if settings.META_ACCESS_TOKEN:
                headers = {"Authorization": f"Bearer {settings.META_ACCESS_TOKEN.get_secret_value()}"}
        else:
            return "Error: Could not retrieve Meta media URL."

    # 2. Download file
    try:
        async with httpx.AsyncClient() as http_client:
            response = await http_client.get(download_url, headers=headers)
            if response.status_code == 200:
                with open(file_path, "wb") as f:
                    f.write(response.content)
            else:
                return f"Error: Could not download audio (HTTP {response.status_code})."
    except Exception as e:
        return f"Download error: {str(e)}"

    # 3. Transcribe using Groq
    try:
        with open(file_path, "rb") as file:
            transcription = client.audio.transcriptions.create(
                file=(file_path, file.read()),
                model="whisper-large-v3",
                prompt="Specify that the language is Urdu or a related regional language from Pakistan. The audio is a report of a safety incident.",
                response_format="text"
            )
        return transcription
    except Exception as e:
        logger.error(f"Groq Transcription Error: {e}")
        return f"Transcription error: {str(e)}"
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

