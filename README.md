# Nya-AI

Nya-AI answers questions about Indian law from the law books themselves, cites the exact section
for every claim, and hands over to a verified advocate when a question needs real advice. Legal
information, not legal advice.

- **Design (Orbit UI, every screen on desktop and phone):** https://claude.ai/artifact/QYs5pGyrFcvACgYUWrUp1g
- **Agent plan (LangGraph, LlamaIndex, Langfuse):** https://claude.ai/artifact/KtuTmzcwCe2aMQqWRtVN29
- **Capstone design and golden queries:** [SubashNadar/legal-docs-platform](https://github.com/SubashNadar/legal-docs-platform), `docs/NYA-AI.md`

## What runs today

| Part | Folder | Status |
| --- | --- | --- |
| Web app (React, Vite, TypeScript, Tailwind) | `frontend/` | Chat, advocates, booking, payment, lawyer portal |
| API (FastAPI, Python, uv) | `backend/` | Auth (OTP, JWT with logout), lawyers, bookings, Razorpay, messages |
| Chat answers | `backend/src/nya_ai/chat_engine.py` | Keyword rule engine as a fallback |
| Nya-AI agent (LangGraph + LlamaIndex + pgvector) | `nya-ai/` (planned) | Not built yet; will replace `chat_engine.get_answer` |

## Run it locally

```bash
# API on http://localhost:8000
cd backend && uv sync && uv run uvicorn nya_ai.main:app --reload --port 8000

# Web app on http://localhost:5173
cd frontend && npm install && npm run dev
```

OTP login accepts any 4-digit code. The seeded advocate can sign in with phone `1234567890`.
Razorpay test keys go in `backend/.env` (see `backend/.env.example`); without them the payment
endpoints return `503` and everything else still works.

## Docs

- [`docs/DECISIONS.md`](docs/DECISIONS.md): product decisions the code depends on.
- [`backend/README.md`](backend/README.md): API layout, environment variables, tests.
- [`CLAUDE.md`](CLAUDE.md): working notes for Claude Code sessions.

## Rules

- Public legal sources only (India Code bare acts, government tables, public judgments). No
  publisher commentaries or textbooks.
- Never give advice on a user's own case; escalate to an advocate.
- Python is managed with **uv** only. No `pip`, `venv` or `requirements.txt`.
- No API keys in the repository.
