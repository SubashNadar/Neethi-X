# Neethi-X — project memory

Read this first in any new session. It's the "where we left off" doc — keep it updated as the project moves,
don't let it go stale.

## What this is

**Neethi-X** (assistant persona: **Neethi**) is an AI legal-assistant platform for India — free AI chat
grounded in Indian law, paid verified-lawyer consultations at ₹500 (lawyer keeps 70%). The whole product was
recreated from a single design source: a packed interactive-artifact export at
[`Neethi-X Demo.html`](Neethi-X%20Demo.html) (repo root). The business-planning docs at repo root
(`LEGALCHAT_PITCH_DECK.md`, `DEVELOPMENT_ROADMAP.md`) still say "LegalChat" — that's the intentional original
business name; the product itself is Neethi-X.

## Doc map — read in this order for any change

1. **[`.claude/NEETHI_UI_REFERENCE.md`](.claude/NEETHI_UI_REFERENCE.md)** — every screen, exact copy, design
   tokens (colors, fonts, animation keyframes), seed data, transcribed from the demo bundle. There's no decode
   tooling for the raw bundle in this repo anymore, so treat this doc as the practical source of truth rather
   than something to re-derive from `Neethi-X Demo.html` directly.
2. **[`.claude/NEETHI_BUILD_GUARDRAILS.md`](.claude/NEETHI_BUILD_GUARDRAILS.md)** — mandatory process rules:
   don't silently invent unclear behavior/copy/citations; log ambiguous decisions instead (see next doc); a
   "110%" bar defining what counts as legitimate robustness vs. an unauthorized design change (never).
3. **[`.claude/NEETHI_OPEN_QUESTIONS.md`](.claude/NEETHI_OPEN_QUESTIONS.md)** — running log of decisions made
   where the source material was ambiguous. **All 9 original entries were walked through with the user on
   2026-07-18** (see the "Resolution pass with user, 2026-07-18" entry at the top). 3 were kept as-implemented
   (messages endpoints, lawyer mobile-tab labels, demo-lawyer guest-login identity, `Booking` extra fields —
   4 total), 4 were overridden (mobile Bookings/Profile get standalone screens not a shared dashboard route;
   OTP login gains an explicit `role` param for lawyer login, match-only/no-autocreate; message unread is
   cleared only via a new explicit mark-read endpoint, not implicitly; JWT expiry drops to 24h **and** gets
   real server-side logout invalidation), and 1 is pending user input (real bio/Bar Council ID for 3 of the 4
   seed lawyers — placeholders stay until supplied).

There is no separate API contract doc — see "Where the actual code lives" below.

## Where the actual code lives

- **`backend/`** — FastAPI, Python, **uv-managed** (`pyproject.toml` + `uv.lock`, `src/neethi/` layout). Run:
  `cd backend && uv sync && uv run uvicorn neethi.main:app --reload --port 8000`. SQLite dev DB
  (`neethi.db`, gitignore-worthy, deleted during cleanup — regenerates with seed data on boot). Chat has a
  verbatim rule-engine fallback (works with zero config) plus an optional Claude API path — **the Claude API
  path is unverified**, no `ANTHROPIC_API_KEY` has been available in any session so far.
  `backend/src/neethi/schemas.py` + `routers/` is the current API contract (see below).
- **`frontend/`** — Vite + React + TypeScript + Tailwind. Run: `cd frontend && npm install && npm run dev`
  (defaults to hitting `http://localhost:8000/api`, no env file needed for local dev).
  `frontend/src/types.ts` + `lib/api.ts` is the frontend's side of that same contract — if it and the backend
  disagree, that's a bug to fix, not a doc to consult.
- **`.claude/agents/`** — native Claude Code subagents (`neethi-architect`, `neethi-backend-developer`,
  `neethi-frontend-developer`) — the only build path, no API key needed. Ask Claude Code directly ("use
  neethi-backend-developer to add X") or invoke via the `Agent` tool with `subagent_type` set to the agent's
  name.

## Conventions to not re-litigate

- **uv only** for Python — never `pip install` / `venv` / `requirements.txt` anywhere in this repo.
- Payments are **simulated** (Razorpay-shaped, no live gateway). OTP login accepts any 4-digit code (matches
  the demo's documented `1234` convenience).
- Don't redesign screens/copy "because it reads better" — guardrails §4 is explicit that this is a violation,
  not a judgment call. Flag it instead.
- Backend and frontend are built independently by separate subagents, in parallel, against request/response
  shapes spelled out by `neethi-architect` (no longer a persisted contract doc — see below) — this works (both
  builds converged correctly on the `/api/messages/*` gap independently) as long as whoever plans a change
  states the shapes explicitly up front.

## Episodic log (newest first)

- **2026-07-18** (later) — Replaced the simulated payment flow with a real Razorpay integration
  (Orders API + Checkout.js + webhook), per a scoping pass and architect spec (see
  `.claude/NEETHI_OPEN_QUESTIONS.md`'s "Real Razorpay integration" entries). Two product decisions
  confirmed with the user first: (1) real payment-detail entry now happens inside Razorpay's own
  hosted checkout modal — the existing method-picker screen stays but only pre-selects a tab in
  that modal now, no longer collects payment data itself; (2) lawyer payouts stay **manual
  settlement**, not Razorpay Route — no per-lawyer linked-account KYC being built. Backend:
  `PaymentOrder` reshaped (paise-unit amount, `razorpay_order_id`/`payment_id`/`signature`,
  `verified` flag), new `WebhookEvent` table for idempotency, real `client.order.create`, SDK-based
  signature verification on confirm, new `POST /api/payments/webhook` (raw-body verification before
  JSON parse, handles `payment.captured`/`payment.failed` only). Unset keys → `503` at request time,
  rest of the app unaffected (confirmed default). Frontend: real Checkout.js modal integration with
  success/dismiss/failure handling, badge copy "Razorpay · simulated" → "Razorpay · secure".
  **Not verified**: the actual live order-creation/signature round-trip against Razorpay's real
  servers — no test-mode API keys were available in this session; only the zero-config `503` path
  and the SDK's HMAC verification logic (via a unit test with a fake local secret) were exercised.
  Get free Razorpay test keys (no KYC needed) whenever ready to test the real flow. Also repo-wide
  note: the repo is now git-initialized and pushed to `github.com/SubashNadar/Neethi-X` (`main`),
  and `backend/Dockerfile` + `frontend/Dockerfile` (+ `nginx.conf` for SPA routing) exist for a
  future Coolify deployment, not yet build-tested against real Docker (none available locally).
- **2026-07-18** — Walked through all 9 `.claude/NEETHI_OPEN_QUESTIONS.md` entries with the user (see that
  file's "Resolution pass with user, 2026-07-18" section for the full record). 4 kept as-implemented
  (messages endpoints, lawyer mobile-tab labels, demo-lawyer guest-login identity, `Booking` extra fields), 4
  overridden and built this session, 1 (real bio/Bar Council ID for 3 of 4 seed lawyers — Rohan Deshpande,
  Sana Qureshi, Arjun Nair) still pending user-supplied content, placeholders unchanged. Built and verified
  end-to-end (backend + frontend agents, each ran real HTTP/browser checks against a live server pair):
  - **Lawyer OTP login**: `POST /api/auth/otp/verify` now takes an optional `role` field. `role="lawyer"`
    matches an existing lawyer account by phone (never auto-creates); the seeded lawyer (Meera Krishnan) was
    given phone `1234567890` (user-supplied demo number) so this is actually reachable end-to-end, not just a
    correct-but-dead code path. `role` omitted/`"user"` is byte-for-byte unchanged. Frontend's existing
    "I'm a lawyer" login toggle (previously only wired to guest login) now threads through to OTP verify too.
  - **Real logout invalidation**: JWTs now carry a `jti`; a new `revoked_tokens` table + `POST /api/auth/logout`
    make logout immediately kill that token server-side (confirmed: same token → 401 right after logout, new
    token still works) rather than just waiting out expiry. JWT expiry also shortened 7d → 24h. Revoked-token
    rows are pruned on logout and once on app boot so the table stays bounded.
  - **Message unread flag**: new `PATCH /api/messages/threads/{id}/read` is now the *only* way a thread's
    unread flag clears — removed the old implicit clear-on-view and clear-on-reply side effects.
  - **Mobile Bookings/Profile**: both tabs used to alias to `/dashboard`; now standalone `/bookings` and
    `/account` screens exist, built only from already-sourced data/copy (booking list reused from the
    dashboard card, account display-name reusing the existing friend/guest fallback rule) — no invented
    settings features (no language picker, saved answers, help/support), per explicit user decision to keep
    Profile minimal (account info + sign-out only, no Neethi Plus upsell on mobile). Sign-out moved from the
    `AppShell` header into the new Account screen.
  Not yet done: sourcing real bios/Bar Council IDs for the 3 non-Meera lawyers (Task pending on user input).
- **2026-07-17** — User manually deleted `agents/` entirely (including the demo-bundle extraction tool,
  `agents/tools/extract_demo_bundle.py`) and `NEETHI_API_CONTRACT.md`/`QUICK_START_CHECKLIST.md`, and moved
  `Neethi-X Demo.html` and `NEETHI_UI_REFERENCE.md` to repo root / `.claude/` respectively. Asked to have
  dangling references cleaned up. Updated: guardrails source-of-truth hierarchy (contract doc replaced by "the
  actual code is the contract"; extraction-script step replaced by "the UI reference is the practical source,
  no decode tooling exists in-repo"), all three subagent personas, `.claude/NEETHI_UI_REFERENCE.md`'s own
  header, this file's doc map/conventions/paths, `README.md`, `DEVELOPMENT_ROADMAP.md`'s banner, `backend/
  README.md`, and inline comments in `backend/src/neethi/{models,schemas,seed,auth}.py` and `routers/
  {auth,messages}.py` that cited the deleted contract doc. **Note for next session**: if you want the demo
  bundle independently re-verifiable again, the extraction script's logic is simple (parse the two
  `<script type="__bundler/...">` tags out of the HTML, base64/gzip-decode) and was written once already this
  project — ask if it's worth rebuilding rather than assuming it should be.
- **2026-07-17** — Added a "pre-build plan, not current state" banner to `DEVELOPMENT_ROADMAP.md` (and
  originally to `QUICK_START_CHECKLIST.md`, since deleted) — both contained setup steps/code that actively
  contradicted the real build (venv/pip vs uv, Postgres+Redis+Pinecone+Celery vs SQLite-only, Twilio OTP vs
  demo-any-4-digit, from-scratch `main.py`/`ChatBox.jsx` unrelated to what's in `backend/`/`frontend/`).
  `LEGALCHAT_PITCH_DECK.md` left untouched — it's business narrative, not setup instructions, so the drift
  there is low-risk. User chose "banner only" over deleting or leaving unmarked (they deleted the checklist
  file separately later, see the entry above).
- **2026-07-17** — Deleted the standalone Python pipeline entirely (`agents/architecture_builder_agent.py`,
  `developer_agent.py`, `orchestrator.py`, `config.py`, `prompts.py`, `utils.py`, its own `pyproject.toml`/
  `uv.lock`/`.venv`, and its 5 docs) — it was never run in this project and only added navigation overhead now
  that native subagents are the actual workflow. `.claude/agents/neethi-architect.md` had one dangling
  reference to a doc from that pipeline (`agents/LEGALCHAT_AGENT_SYSTEM.md`) removed.
- **2026-07-17** — Backend and frontend both built by native subagents, verified running together end-to-end
  (lawyers/chat/auth/booking/payment flows hit and confirmed correct against a live server pair). Repo cleaned
  up: runtime artifacts removed (`neethi.db`, `__pycache__`, `dist/`, ruff cache); `NEETHI_BUILD_GUARDRAILS.md`
  and `NEETHI_OPEN_QUESTIONS.md` moved from repo root into `.claude/`; this file created. **Next**: go through
  the 9 open questions in `.claude/NEETHI_OPEN_QUESTIONS.md` with the user.
- **2026-07-17** (earlier) — User approved a static HTML mockup (all 10 screens, exact embedded fonts/tokens)
  before build started — see the guardrails doc's origin: the user asked for "all possible guardrails" and
  visual sign-off before development, specifically because early attempts had drifted (e.g. a stray
  `BACKEND_OUTPUT_DIR = "./UV"` edit, literal misreading of "use the uv folder structure").
- **2026-07-17** (start) — Project started as a standalone Python pipeline that would call the Anthropic API
  directly (`agents/*.py`, needing `ANTHROPIC_API_KEY`), then pivoted to Claude Code's native subagents once it
  became clear no API key was available — and, once that was working well, the original pipeline was deleted
  (see the entry above) rather than kept around as an unused second path.
