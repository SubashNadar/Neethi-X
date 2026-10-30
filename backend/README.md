# Nya-AI backend

All Python code for Nya-AI, in one [uv workspace](https://docs.astral.sh/uv/concepts/projects/workspaces/):
one `uv.lock` and one `.venv` here in `backend/`.

```
backend/
  pyproject.toml   workspace members
  uv.lock
  api/             FastAPI app, package nya_ai: auth, advocates, bookings, Razorpay, chat endpoint
  agent/           agent service, package nya_agent: LangGraph graph, LlamaIndex law library, Langfuse
```

```bash
cd backend
uv sync --all-packages                                        # both packages into backend/.venv

cd api   && uv run uvicorn nya_ai.main:app --reload --port 8000   # API on :8000
cd agent && uv run nya-agent count                            # law library CLI
```

Run tests in each member: `cd api && uv run pytest`, `cd agent && uv run pytest`.

Each member keeps its own `.env` (copy its `.env.example`). The API image is built from this
folder so it sees the lock file: `docker build -f api/Dockerfile -t nya-ai-api .`
