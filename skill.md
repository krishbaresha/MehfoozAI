# Full-Stack Development Playbook: AI-Agent Edition

Use this guide to maximize your efficiency when building complex web apps with AI agents. This "Skill Document" will help you avoid common pitfalls and speed up your development cycles.

---

## 1. Project Scaffolding & Setup
- **Environment Variables First**: Always define `NEXT_PUBLIC_API_URL` and `DATABASE_URL` from day one. Avoid hardcoding `localhost`.
- **Backend Readiness**: Use a health-check endpoint (`/api/v1/health`) to let the frontend know when the backend (especially on Render/Heroku) is awake.

## 2. Responsive UI Mastery
- **Flexible Grids**: Use `grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))` instead of fixed pixel widths.
- **Mobile-First CSS**: Always include a base responsive block in your main layout:
  ```css
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
    .stack-mobile { flex-direction: column !important; }
  }
  ```
- **State-Driven UI**: Use a `useIsMobile` hook to conditionally render components (like Mobile Menus vs. Sidebars).

## 3. Managing AI Agents Effectively
- **Provide Context**: When asking for fixes, share the relevant code *and* the browser console error.
- **Request "Atomic" Changes**: Instead of "Fix the whole dashboard," ask for "Fix the responsive layout of the stats grid in the dashboard."
- **Syntax Guarding**: Before committing a large UI change, ask the agent to "Validate the JSX structure for unclosed tags or nested button errors."

## 4. Debugging Common Full-Stack Errors
- **"Failed to Fetch"**: Usually CORS, wrong URL, or Backend down. Check `main.py` for `CORSMiddleware`.
- **"Hydration Mismatch"**: Avoid using `window` or `localStorage` directly in the initial render. Use `useEffect`.
- **"White Screen of Death"**: Almost always a JSX syntax error or a null pointer (e.g., `data.map` where data is undefined). Always use optional chaining: `data?.map()`.

---

## 5. Deployment Checklist
1. [ ] Set `NEXT_PUBLIC_API_URL` in Netlify/Vercel.
2. [ ] Verify Backend API is reachable via Postman/CURL.
3. [ ] Run `npm run build` locally to catch syntax errors before pushing to Git.
4. [ ] Test the critical flow (e.g., WhatsApp Intake) on a real phone viewport.

## 6. Avoiding Common Deployment Traps
- **Root Directory Issues**: If your frontend is inside a `frontend/` folder, remember to configure the "Base Directory" or "Root Directory" in Vercel/Netlify. (e.g., using `netlify.toml` with `base = "frontend"`).
- **TypeScript/JSX Build Exclusions**: Ensure your `tsconfig.json`'s `include` array covers your file extensions (`"**/*.js"`, `"**/*.jsx"`, `"**/*.ts"`, `"**/*.tsx"`). Otherwise, your build might silently skip your pages, leading to 404s.
- **CORS Policies**: Explicitly whitelist your production frontend domains (e.g., `https://.*\.netlify\.app`) in your backend's CORS middleware.

## 7. Multi-Project & Environment Management
- **The Clean Slate Principle**: When switching between projects locally (e.g., from ClimateOS to MehfoozAI), always kill orphaned processes to prevent port clashing and data mismatch. (Windows Command: `taskkill /F /IM node.exe`).
- **Environment Parity**: Keep local URLs like `http://localhost:8000` strictly in `.env.local`. Never hardcode API URLs in your code; always rely on environment variables like `process.env.NEXT_PUBLIC_API_URL`.

## 8. MehfoozAI Lessons: Production Hardening

These are specialized lessons learned from building the MehfoozAI Harassment Reporting system.

### A. The "Spelling Trap" (CORS & Deployment)
- **Problem:** Deployment URLs like `mahfoozai.netlify.app` vs `mehfoozai.netlify.app` can break the entire frontend-backend connection.
- **Solution:** Use **Regex Origins** in your backend CORS settings to allow variations and prevent spelling mistakes from blocking your data.
- **Check:** Always verify your `NEXT_PUBLIC_API_URL` in the hosting provider (Netlify/Render) environment variables.

### B. AI Loop Prevention (Conversation Turn Counting)
- **Problem:** AI agents sometimes get stuck asking for information indefinitely.
- **Solution:** Implement a **Turn Counter** in your session state. If `turn_count > 2`, force the AI's internal state to `COMPLETE`. This breaks the cycle and forces the reporting pipeline to trigger.

### C. The "NoneType" Resilience (LLM Output Handling)
- **Problem:** LLMs can return inconsistent JSON or missing keys, causing the backend to crash with `AttributeError`.
- **Solution:** 
    - Use the **`or {}` fallback pattern:** `fir_result = result.get("fir_result") or {}`.
    - Use **Nested Try-Except:** Wrap the final user message formatting in its own block. If it fails, send a simplified "Report Registered" message instead of a "Technical Error".

### D. Cloud Reliability (Supabase + SQLite Dual-Sync)
- **Problem:** Cloud services like Supabase can occasionally be slow or fail to respond.
- **Solution:** Always sync production data to both **Supabase (Primary)** and **SQLite (Local Fallback)**. This ensures that even if the cloud sync fails, the data is stored on the server for later recovery.

### E. Modern Aesthetics (Premium Design System)
- **Glassmorphism:** Use `backdrop-filter: blur(10px)` for that sleek, modern tech look.
- **Vibrant Gradients:** Avoid flat colors; use `linear-gradient` to give the UI depth and energy.
- **Micro-Animations:** Use `transition: all 0.3s ease` on every interactive element.

---
*Generated for MehfoozAI & ClimateOS — May 2026*
