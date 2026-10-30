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
4. **API contract:** `backend/api/src/nya_ai/schemas.py` + `routers/`, mirrored by
   `frontend/src/types.ts` + `lib/api.ts`. If they disagree, that is a bug.
5. **Decisions:** `docs/DECISIONS.md`.
6. **SLOs:** `docs/SLOS.md` (definitions, targets, guardrails, how they are tested) and
   `evals/slo-test-sheet.xlsx` (50 golden queries + 10 SLO probes, charts). Keep them in step.

## Where the code lives

- `backend/` — one uv workspace (`backend/pyproject.toml`, one `uv.lock`, one `.venv`) holding all
  Python. See `backend/README.md`.
  - `backend/api/` — FastAPI, package `nya_ai`. Run:
    `cd backend/api && uv sync && uv run uvicorn nya_ai.main:app --reload --port 8000`. SQLite dev DB
    `nya_ai.db` is created and seeded on boot. Docker image builds from `backend/`:
    `docker build -f api/Dockerfile .`
  - `backend/agent/` — agent service (package `nya_agent`). R0, the law library, is built: section
    parser, LlamaIndex ingestion into pgvector, hybrid retrieval with act/date filters, SQL tables,
    golden-set check, Langfuse tracing. `docker compose up -d` there starts pgvector (5433) and
    Langfuse (3000). PDFs go in `backend/agent/data/raw/` (gitignored). See `backend/agent/README.md`.
- `frontend/` — Vite + React + TypeScript + Tailwind 3 (shadcn/ui pattern, lucide, motion, sonner).
  Run: `cd frontend && npm install && npm run dev`.

## Conventions

- **uv only** for Python.
- Push straight to `main`; run `npm run build` and `uv run pytest` (in `backend/api` and
  `backend/agent`) first.
- OTP login accepts any 4-digit code. Payments are real Razorpay (test keys), payouts manual.
- Public legal sources only; never advice on a user's own case; escalate to an advocate.
- Azure OpenAI (personal subscription): gpt-5.4-nano, gpt-5.4, text-embedding-3-large at 1536
  dimensions. Keys never committed.

## Log (newest first)

- **2026-10-30** — SLO definitions and targets in `docs/SLOS.md` and the test sheet
  `evals/slo-test-sheet.xlsx`, following the evaluation rules: Ruff/pylint, input and output
  guardrails, every SLO defined, scores pushed to Langfuse, SLO test cases, Excel plots, Ragas. None
  of it is in code yet.

- **2026-10-30** — Repo layout: all Python moved under `backend/` as one uv workspace, the API to
  `backend/api/`, the agent (was `nya-ai/`) to `backend/agent/`; Python 3.12 for both. Section
  parser checked on the real acts: BNS 358, BNSS 531 and BSA 170 all found. The IPC count hung on
  runs of blank lines; fixed in 49f60d3, its count is not yet confirmed. BNS, BNSS and BSA now come
  from indiacode.gov.in (the old indiacode.nic.in links return 504); the IPC still comes from
  indiacode.nic.in.
- **2026-10-29** — Agent service R0 (law library) in `nya-ai/`. Tested on a synthetic fixture
  against real pgvector and a running Langfuse; not yet run on the real acts because India Code is
  blocked from cloud sessions and the Azure key lives only on the owner's machine. Golden check
  currently FAILs as expected (nothing real ingested). Next: real PDFs + Azure, then R1 (graph).
- **2026-10-29** — Consult plan (`/plan`) and call room (`/call/:bookingId`). "Ask an advocate" in
  chat opens the plan with the question as the facts; the plan is sent as `brief` with
  `POST /api/bookings` (stored in `bookings.brief_json`, added to old dev DBs on boot) and shown to
  the advocate in the portal and the call room. In-app video is not wired; the call room says the
  advocate phones the client and offers agenda, brief and on-device notes. Law library admin waits
  for the agent's ingestion pipeline. Fixed tab highlighting (`/bookings` also lit Lawyers).
- **2026-10-29** — Public Legal, About, Contact and Help pages (`/legal`, `/about`, `/contact`,
  `/help`, shared `InfoLayout`, no sign-in needed), linked from sign-in, sidebar and Account. Contact
  form posts to `POST /api/support` (`SupportMessage`, refs `SUP-YYYYMMDD-###`). Placeholders such
  as [SUPPORT EMAIL] and [OFFICER NAME] still need real values.
- **2026-10-29** — Orbit theme applied across the app (tokens in `tailwind.config.js`, grid in
  `index.css`); chat rebuilt to the Orbit layout (trace panel, cited ¶ answer, temporal panel).
  Orbit screens not yet in the app: law library admin, consult plan, live call, basics states board.
- **2026-10-29** — Rebranded to Nya-AI: package `neethi` → `nya_ai`, Orbit logo and favicon,
  JetBrains Mono added, all user-facing copy renamed. Removed the old design export, UI reference,
  build guardrails, open-questions log, three old subagents, pitch deck, roadmap and Vite template
  leftovers. Key decisions kept in `docs/DECISIONS.md`. Next: build the Orbit screens and the
  `nya-ai/` agent service. The GitHub repo is still named Neethi-X until the owner renames it.
- **2026-10-28** — UI polish and premium navy/brass redesign; Orbit chosen as the final UI.
- **2026-07-18** — Real Razorpay integration; lawyer OTP role login; JWT logout revocation;
  explicit mark-read for messages; standalone mobile Bookings and Account screens.
- **2026-07-17** — Backend and frontend first built and verified end to end.
