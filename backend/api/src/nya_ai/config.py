"""Application settings, loaded from environment variables / .env."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./nya_ai.db"

    # Dev-only default; override in production. Any value is fine since this is a
    # demo/hackathon-grade JWT secret, not a production credential store.
    JWT_SECRET: str = "dev-only-nya-ai-jwt-secret-change-me"
    JWT_ALGORITHM: str = "HS256"
    # 24 hours: shortened from the original 7-day default per the user's resolution
    # pass (docs/DECISIONS.md, "Resolution pass with user, 2026-07-18",
    # #9) — paired with real server-side logout invalidation (RevokedToken) since a
    # shorter expiry alone doesn't make logout take effect immediately.
    JWT_EXPIRE_MINUTES: int = 60 * 24

    ANTHROPIC_API_KEY: str | None = None
    ANTHROPIC_MODEL: str = "claude-sonnet-5"

    # Razorpay test-mode credentials. When unset, payment endpoints return 503 at
    # request time — the rest of the app (free chat, lawyers, dashboard) still boots
    # and works with zero config. See docs/DECISIONS.md "Real Razorpay
    # integration" entry.
    RAZORPAY_KEY_ID: str | None = None
    RAZORPAY_KEY_SECRET: str | None = None
    RAZORPAY_WEBHOOK_SECRET: str | None = None

    CORS_ORIGINS: str = "http://localhost:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def razorpay_configured(self) -> bool:
        return bool(self.RAZORPAY_KEY_ID and self.RAZORPAY_KEY_SECRET)


@lru_cache
def get_settings() -> Settings:
    return Settings()
