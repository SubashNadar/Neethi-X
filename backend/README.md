# Nya-AI backend

FastAPI backend for Nya-AI — a free AI legal assistant for India, with optional paid
verified-lawyer consults. `src/nya_ai/schemas.py` + `routers/` is the current API contract
(mirrored by `frontend/src/types.ts` + `lib/api.ts`).

## Quickstart (uv only — no venv, no pip, no requirements.txt)

```bash
cd backend
uv sync
cp .env.example .env   # optional — defaults work with zero configuration
uv run uvicorn nya_ai.main:app --reload --port 8000
```

The API is now live at `http://localhost:8000/api`, with interactive docs at
`http://localhost:8000/docs`. A local `nya_ai.db` SQLite file is created and seeded
(4 demo lawyers, 3 lawyer-portal requests, 3 message threads) automatically on first
boot — nothing to run manually.

The AI chat works out of the box with **zero configuration** via a built-in
keyword→citation rule engine (theft, rent/deposit, FIR, divorce, salary disputes). Set `ANTHROPIC_API_KEY` in `.env`
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
src/nya_ai/
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
- Payments use Razorpay Orders, Checkout.js and a webhook (`routers/payments.py`). Without
  keys the payment endpoints return `503`.
- Product decisions the code depends on are logged in `../docs/DECISIONS.md`.
- The keyword rule engine is the fallback; the Nya-AI agent (LangGraph + LlamaIndex) will
  replace `chat_engine.get_answer`.
