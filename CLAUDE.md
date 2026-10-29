# Nya-AI — project memory

Read this first in any new session and keep it current.

## What this is

**Nya-AI** is an AI legal-information app for India: free cited answers from Indian bare acts and
judgments, plus paid consultations with verified advocates (₹500, advocate keeps 70%). It was
previously built under another name; that name and its design files were removed on 2026-10-29.
Nya-AI is the only product.

## Sources of truth

1. **UI:** the Orbit design canvas, https://claude.ai/artifact/QYs5pGyrFcvACgYUWrUp1g. Every screen
   has a desktop and a phone board, wired for Play mode. Style: navy `#0A1424` with a faint grid,
   brass `#D9B56E`, cream `#F6EEDF`, Fraunces headings, Figtree body, JetBrains Mono for metadata
   and citations.
2. **Agent plan:** https://claude.ai/artifact/KtuTmzcwCe2aMQqWRtVN29 (LangGraph graph, LlamaIndex
   library, Langfuse observability, per-agent SLOs).
3. **Capstone design:** SubashNadar/legal-docs-platform `docs/NYA-AI.md` and
   `evals/GOLDEN-QUERIES.md`.
4. **API contract:** `backend/src/nya_ai/schemas.py` + `routers/`, mirrored by
   `frontend/src/types.ts` + `lib/api.ts`. If they disagree, that is a bug.
5. **Decisions:** `docs/DECISIONS.md`.

## Where the code lives

- `backend/` — FastAPI, uv-managed, package `nya_ai`. Run:
  `cd backend && uv sync && uv run uvicorn nya_ai.main:app --reload --port 8000`. SQLite dev DB
  `nya_ai.db` is created and seeded on boot.
- `frontend/` — Vite + React + TypeScript + Tailwind 3 (shadcn/ui pattern, lucide, motion, sonner).
  Run: `cd frontend && npm install && npm run dev`.
- `nya-ai/` — planned home of the agent service (LangGraph + LlamaIndex + pgvector + Langfuse).
  Neethi-era subagents were removed; build with Claude Code directly.

## Conventions

- **uv only** for Python.
- Push straight to `main`; run `npm run build` and `uv run pytest` first.
- OTP login accepts any 4-digit code. Payments are real Razorpay (test keys), payouts manual.
- Public legal sources only; never advice on a user's own case; escalate to an advocate.
- Azure OpenAI (personal subscription): gpt-5.4-nano, gpt-5.4, text-embedding-3-large at 1536
  dimensions. Keys never committed.

## Log (newest first)

- **2026-10-29** — Orbit theme applied across the app (tokens in `tailwind.config.js`, grid in
  `index.css`); chat rebuilt to the Orbit layout (trace panel, cited ¶ answer, temporal panel).
  Orbit screens not yet in the app: law library admin, consult plan, live call, legal/about/contact/
  help pages, basics states board.
- **2026-10-29** — Rebranded to Nya-AI: package `neethi` → `nya_ai`, Orbit logo and favicon,
  JetBrains Mono added, all user-facing copy renamed. Removed the old design export, UI reference,
  build guardrails, open-questions log, three old subagents, pitch deck, roadmap and Vite template
  leftovers. Key decisions kept in `docs/DECISIONS.md`. Next: build the Orbit screens and the
  `nya-ai/` agent service. The GitHub repo is still named Neethi-X until the owner renames it.
- **2026-10-28** — UI polish and premium navy/brass redesign; Orbit chosen as the final UI.
- **2026-07-18** — Real Razorpay integration; lawyer OTP role login; JWT logout revocation;
  explicit mark-read for messages; standalone mobile Bookings and Account screens.
- **2026-07-17** — Backend and frontend first built and verified end to end.
