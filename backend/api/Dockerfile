# Build from backend/ so the workspace lock file is in the context:
#   docker build -f api/Dockerfile -t nya-ai-api .
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies first so this layer is cached unless a pyproject.toml or uv.lock changes.
COPY pyproject.toml uv.lock .python-version ./
COPY api/pyproject.toml api/
COPY agent/pyproject.toml agent/
RUN uv sync --frozen --no-dev --package nya-ai --no-install-workspace

# Now copy the app source and install it.
COPY api api
RUN uv sync --frozen --no-dev --package nya-ai

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uv", "run", "--no-sync", "uvicorn", "nya_ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
