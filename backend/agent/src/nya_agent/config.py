"""Settings read from the environment or `backend/agent/.env`. Keys are never committed."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Postgres with pgvector, from docker-compose.yml.
    DATABASE_URL: str = "postgresql+psycopg://nya:nya@localhost:5433/nya"

    # Azure OpenAI (personal subscription). Embeddings use text-embedding-3-large cut to 1536 dims.
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_API_KEY: str = ""
    AZURE_OPENAI_API_VERSION: str = "2024-10-21"
    AZURE_EMBED_DEPLOYMENT: str = "text-embedding-3-large"
    EMBED_DIM: int = 1536

    # Self-hosted Langfuse from docker-compose.yml (http://localhost:3000).
    LANGFUSE_HOST: str = "http://localhost:3000"
    LANGFUSE_PUBLIC_KEY: str = ""
    LANGFUSE_SECRET_KEY: str = ""


@lru_cache
def get_settings() -> Settings:
    return Settings()
