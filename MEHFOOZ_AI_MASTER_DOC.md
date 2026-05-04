# 🛡️ MehfoozAI: Full Project Intelligence & Architecture Document

This document is designed for AI consumption. It provides a 360-degree view of the **MehfoozAI** project, its mission, technical stack, data structures, and the current production state.

---

## 1. Project Mission & Core Concept
**MehfoozAI** is an AI-powered safety and justice platform designed specifically for women in Pakistan. It addresses the barriers of social stigma, safety fears, and legal complexity in reporting harassment.

- **Primary Interface**: WhatsApp (accessible, low-bandwidth, familiar).
- **Core Value**: Anonymous, AI-guided reporting that transforms informal descriptions into structured legal data (PPC Mapping & FIR Drafts).
- **Stakeholders**: 
  - **Victims/Reporters**: Use WhatsApp to report safely.
  - **Authorities (Police/Law Enforcement)**: Use the Dashboard to track incidents, analyze hotspots, and manage cases.

---

## 2. Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14 (App Router) | High-performance React framework for the Dashboard & Landing Page. |
| **Backend** | FastAPI (Python) | High-speed asynchronous API for processing reports and AI logic. |
| **Database** | Supabase (PostgreSQL) | Primary production database with Realtime capabilities. |
| **Local Fallback** | SQLite | Used for local development and as a failsafe for the backend. |
| **AI Intelligence** | Custom Pipeline + OpenAI/Gemini | Extracts data, maps legal sections, and drafts FIRs. |
| **Voice Processing** | Whisper AI | Transcribes audio reports (voice notes) from WhatsApp. |
| **Integration** | Meta WhatsApp Cloud API | Handles incoming/outgoing messages. |
| **Maps** | Leaflet.js | Visualizes incident hotspots on the safety heatmap. |
| **Hosting** | Netlify (FE) / Render.com (BE) | Current cloud infrastructure. |

---

## 3. Database Schema (Production - Supabase)

### Table: `incidents`
This is the core table storing all report details.
- `id`: UUID (Primary Key)
- `case_id`: String (e.g., MHZ-ABC123) - Human-readable unique ID.
- `description`: Text - Original user input.
- `transcription`: Text - Text extracted from voice notes.
- `category`: String - Type of incident (e.g., Harassment, Stalking).
- `status`: String (pending, routed, closed) - Case lifecycle state.
- `location_name`: String - Contextual location (e.g., "Saddar, Karachi").
- `latitude` / `longitude`: Float - Precise geocoordinates.
- `ppc_sections`: JSONB - List of relevant Pakistan Penal Code sections (e.g., ["Section 509", "Section 354"]).
- `fir_draft`: Text - AI-generated First Information Report content.
- `routing_info`: JSONB - Details on which police station the report was sent to.
- `safety_zone`: JSONB - Safety score and advice for the area.
- `sender_phone`: String - Encrypted or masked phone number of the reporter.
- `evidence_urls`: JSONB - Links to images/videos/audio files stored in Supabase Storage.
- `credibility_score`: Integer - AI-calculated score (0-100) based on report consistency.
- `complainant_name`: String - Optional name.

### Table: `safety_heatmap`
- `latitude` / `longitude`: Float - Coordinates for the heatmap.
- `intensity`: Integer - Weight of the incident (e.g., multiple reports in one spot).

---

## 4. Key Workflows

### A. The Reporting Pipeline
1. **Intake**: User sends text/voice/location to WhatsApp.
2. **Preprocessing**: Voice is transcribed via Whisper.
3. **AI Extraction**: 
   - Extract `incident_type`, `location`, `offender_description`.
   - Map to `PPC Sections`.
   - Generate `FIR Draft`.
4. **Persistence**: Data saved to Supabase; Case ID generated.
5. **Feedback**: User receives an official Case ID and legal assessment via WhatsApp.

### B. Authority Dashboard
1. **Real-time Stats**: Fetches total reports, solved cases, and heatmap points.
2. **Case Tracking**: List of incidents with deep-dive intelligence views.
3. **Heatmap Visualization**: Dynamic Leaflet map showing dangerous zones.
4. **Resolution**: Authorities can mark cases as "Resolved," which triggers a final confirmation message to the victim.

---

## 5. Current Production Status
- **Backend**: Hosted on Render.com (Free Tier).
- **Frontend**: Hosted on Netlify.
- **WhatsApp**: Verified Meta Webhook integration.
- **Environment**: Using `.env` for secrets like `SUPABASE_KEY`, `OPENAI_API_KEY`, and `META_TOKEN`.

---

## 6. Scaling Strategies (Free & Low-Cost)

To scale MehfoozAI to thousands of users without high costs, follow these recommendations:

### ⚡ Infrastructure Optimization
1. **Move Backend to Fly.io or Railway**: Render's free tier has "cold starts" (sleeps after 15 mins). Fly.io or Railway offer low-cost or better free-tier options that stay awake or wake up faster.
2. **Edge Functions**: Move lightweight logic (like webhook verification) to **Supabase Edge Functions** (Deno) or **Cloudflare Workers**. This reduces the load on your main Python backend.

### 🤖 AI Cost Management
1. **Switch to Gemini 1.5 Flash**: Use Google's Gemini API (via Vertex AI or AI Studio). It has a very generous free tier (15 requests per minute, 1 million tokens per month free).
2. **Local Transcription**: Use `openai-whisper` (base model) locally on your server if resources allow, instead of the paid API, to transcribe voice notes for free.

### 📱 Messaging Costs
1. **Meta WhatsApp 1k Free**: Meta provides 1,000 free service-initiated conversations per month. Stick to this for the pilot.
2. **Direct Web App**: For non-critical updates, encourage users to check their status on a lightweight "Status Portal" (web link) instead of sending many WhatsApp messages.

### 📊 Database & Storage
1. **Supabase Free Tier**: Plenty for thousands of rows. For evidence files, use Supabase Storage's 1GB free limit but implement auto-deletion for evidence older than 30 days to keep it within the free tier.

---

## 7. Instructions for AI Analysis
When analyzing this project:
1. **Review `backend/src/main.py`** for API logic.
2. **Review `backend/src/db/supabase_client.py`** for data flow.
3. **Review `frontend/app/dashboard/page.jsx`** for UI implementation.
4. **Focus on "Anonymous Intelligence"** as the core competitive advantage.

---
*Created on: 2026-05-03*
