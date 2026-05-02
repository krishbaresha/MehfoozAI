# AI Coding Master Skill Guide 🚀

Use this guide to maximize your efficiency when working with AI agents for Full Stack Web Applications.

## 1. Project Structure First
Always tell the AI your folder structure immediately.
- **Tip**: "My project has a `frontend` and `backend` folder. Please use `frontend` as the base for Next.js and `backend` for FastAPI."
- **Benefit**: Saves 30+ minutes of fixing root directory hosting errors.

## 2. The "Deployment Checklist" Strategy
Before deploying, ask the AI to verify these 3 things:
1. **CORS**: "Check if my production domain is in the backend CORS whitelist."
2. **Env Vars**: "Identify all `process.env` and `os.getenv` variables I need to add to my hosting provider (Netlify/Vercel/Render)."
3. **Build Config**: "Check if `tsconfig.json` or `next.config.mjs` has any settings that might block the production build."

## 3. Effective Error Reporting
Don't just say "It's not working."
- **Bad**: "Error aa raha hai."
- **Good**: "Console mein 'Failed to fetch' aa raha hai. Backend port 8000 par chal raha hai. `.env.local` mein URL ye hai: [Paste URL]."
- **Benefit**: The AI can find the exact line and fix it in 1 turn instead of 5.

## 4. Environment Switching (Local vs Prod)
Always maintain a clear separation.
- **Rule**: Keep `http://localhost:8000` in `.env.local` and your **Production URL** in the Hosting Dashboard (Netlify/Vercel settings). Never hardcode URLs in your `.jsx` files.

## 5. Clean Slate Principle
When switching between projects (like ClimateOs and MehfoozAI):
- **Command**: `taskkill /F /IM node.exe` (on Windows) to clear all ports.
- Start only the necessary services to avoid port clashing.

## 6. AI Agent "Effective Prompting"
- **Context is King**: Always mention your OS (Windows) and your package manager (npm).
- **One Task at a Time**: Instead of "Fix everything," say "Fix the 404 error first, then we will look at the database connection."

## 7. Mobile-First Responsiveness
Don't wait until the end to fix mobile views.
- **Tip**: "Make this component responsive from the start using media queries or flexbox. Ensure it stacks on screens smaller than 768px."
- **Checklist**: 
  - [ ] Mobile navigation (hamburger menu).
  - [ ] Touch-friendly button sizes.
  - [ ] Horizontal scroll for wide tables.
  - [ ] Stacking grid layouts.

---
*Happy Coding! 💻*
