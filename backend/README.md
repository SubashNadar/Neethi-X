# Neethi-X backend

FastAPI backend for Neethi-X — a free AI legal assistant for India, with optional paid
verified-lawyer consults. `src/neethi/schemas.py` + `routers/` is the current API contract
(mirrored by `frontend/src/types.ts` + `lib/api.ts`). See `../.claude/NEETHI_UI_REFERENCE.md`
for the product this backend serves.

## Quickstart (uv only — no venv, no pip, no requirements.txt)

```bash
cd backend
uv sync
cp .env.example .env   # optional — defaults work with zero configuration
uv run uvicorn neethi.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000/api`, with interactive docs at
`http://localhost:8000/docs`. A local `neethi.db` SQLite file is created and seeded
(4 demo lawyers, 3 lawyer-portal requests, 3 message threads) automatically on first
boot — nothing to run manually.

The AI chat works out of the box with **zero configuration** via a built-in
keyword→citation rule engine (theft, rent/deposit, FIR, divorce, salary disputes — see
`../.claude/NEETHI_UI_REFERENCE.md` §Chat for the verbatim copy). Set `ANTHROPIC_API_KEY` in `.env`
to switch chat answers to the live Claude API instead; if that call ever fails, the app
transparently falls back to the rule engine.

## Environment variables

See `.env.example`. All have working defaults except `ANTHROPIC_API_KEY`, which is
optional.

## Running tests

```bash
uv run pytest
```

## Project layout

```
src/neethi/
  main.py         FastAPI app, CORS, router mounting, startup seed
  config.py       pydantic-settings Settings (env-driven)
  database.py     SQLAlchemy engine/session/Base
  models.py       ORM models (User, Lawyer, ChatMessage, Booking, PaymentOrder, ...)
  schemas.py      Pydantic request/response models (the API contract itself)
  auth.py         JWT issuance/verification, demo OTP + guest login helpers
  chat_engine.py  Verbatim rule engine + optional Anthropic API path
  seed.py         Seeds demo lawyers / lawyer-portal requests / message threads
  routers/        auth, chat, lawyers, bookings, payments, dashboard
```

## Notes

- Package manager is **uv** exclusively — add dependencies with `uv add <pkg>`
  (`uv add --group dev <pkg>` for dev-only tools), never edit `pyproject.toml`
  dependency lists by hand for anything beyond pins.
- Payments are **simulated** (Razorpay-shaped, no live gateway calls) — see
  `routers/payments.py`.
- Any decision not settled by the UI reference / API contract is logged in
  `../.claude/NEETHI_OPEN_QUESTIONS.md`.
