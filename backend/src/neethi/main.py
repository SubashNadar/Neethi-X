"""FastAPI app entrypoint: CORS, router mounting, startup DB init + seed."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from neethi.config import get_settings
from neethi.database import Base, SessionLocal, engine
from neethi.models import RevokedToken, utcnow
from neethi.routers import auth, bookings, chat, dashboard, lawyers, messages, payments
from neethi.seed import seed_if_empty

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_if_empty(db)
        # Bound the revoked_tokens table without needing a cron job — see
        # .claude/NEETHI_OPEN_QUESTIONS.md "Resolution pass with user, 2026-07-18" (#9).
        db.query(RevokedToken).filter(RevokedToken.expires_at < utcnow()).delete()
        db.commit()
    finally:
        db.close()
    yield


app = FastAPI(title="Neethi-X API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(lawyers.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
