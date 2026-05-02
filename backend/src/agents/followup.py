from src.db.supabase_client import get_case_status

STATUS_EMOJIS = {
    "pending":  "⏳",
    "drafted":  "📄",
    "routed":   "🚔",
    "closed":   "✅",
}

async def handle_followup(case_id: str) -> str:
    """
    Follow-up Agent: Retrieve case status anonymously by Case ID.
    Returns a formatted WhatsApp message.
    """
    case = await get_case_status(case_id)
    if not case:
        return (
            f"❌ *Case not found:* `{case_id}`\n\n"
            "Please check your Case ID and try again.\n"
            "_Format: STATUS MHZ-XXXXXX_"
        )

    status = case.get("status", "pending")
    emoji = STATUS_EMOJIS.get(status, "🔄")
    location = case.get("location_name") or "Not specified"
    category = case.get("category") or "Report"
    ppc = ", ".join(case.get("ppc_sections") or []) or "Pending"

    return (
        f"🛡️ *MehfoozAI Case Update*\n\n"
        f"📋 *Case ID:* `{case_id}`\n"
        f"{emoji} *Status:* {status.upper()}\n"
        f"📍 *Location:* {location}\n"
        f"📝 *Category:* {category}\n"
        f"⚖️ *PPC Sections:* {ppc}\n\n"
        f"_Your identity remains fully anonymous._\n"
        f"_Her awaz suni jaayegi — safely._"
    )
