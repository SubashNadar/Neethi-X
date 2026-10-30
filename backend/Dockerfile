# API image. Build from backend/:  docker build -t nya-ai-api .
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /srv

# Install dependencies first so this layer is cached unless pyproject.toml or uv.lock changes.
COPY pyproject.toml uv.lock .python-version README.md ./
RUN uv sync --frozen --no-dev --no-install-project

# Now copy the source and install it.
COPY app app
COPY data data
RUN uv sync --frozen --no-dev

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uv", "run", "--no-sync", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
