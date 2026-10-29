FROM python:3.11-slim

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies first so this layer is cached unless pyproject.toml/uv.lock change.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Now copy the actual source and install the project itself.
COPY . .
RUN uv sync --frozen --no-dev

ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "nya_ai.main:app", "--host", "0.0.0.0", "--port", "8000"]
