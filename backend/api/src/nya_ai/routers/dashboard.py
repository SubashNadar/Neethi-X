"""Dashboard endpoints (per-role summary stats)."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from nya_ai.auth import get_current_user
from nya_ai.database import get_db
from nya_ai.models import Booking, ChatMessage, Lawyer, User
from nya_ai.routers.bookings import _to_out
from nya_ai.schemas import LawyerDashboardOut, RecentQuestion, UserDashboardOut

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# Canned older examples, reproduced verbatim from the original design spec "Recent
# questions" — the demo hardcodes these two regardless of what the user actually asked.
CANNED_QUESTIONS = [
    RecentQuestion(q="Can my society stop me from keeping a pet?", when="2 days ago"),
    RecentQuestion(q="Traffic challan paid twice — refund?", when="last week"),
]

ACTIVE_BOOKING_STATUSES = ("paid", "accepted", "completed")


def _relative_time(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = now - dt
    seconds = delta.total_seconds()
    if seconds < 60:
        return "just now"
    minutes = int(seconds // 60)
    if minutes < 60:
        return f"{minutes} min ago"
    hours = int(minutes // 60)
    if hours < 24:
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    days = int(hours // 24)
    return f"{days} day{'s' if days != 1 else ''} ago"


@router.get("/user", response_model=UserDashboardOut)
def user_dashboard(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> UserDashboardOut:
    if user.role != "user":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="User account required")

    questions_answered = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.role == "user")
        .count()
    )

    user_bookings = (
        db.query(Booking)
        .filter(Booking.user_id == user.id, Booking.status.in_(ACTIVE_BOOKING_STATUSES))
        .order_by(Booking.created_at.desc())
        .all()
    )
    consults_booked = len(user_bookings)
    saved_amount = 4500 if consults_booked else 0

    upcoming = None
    upcoming_booking = next(
        (b for b in user_bookings if b.status in ("paid", "accepted")), None
    )
    if upcoming_booking is not None:
        lawyer = db.get(Lawyer, upcoming_booking.lawyer_id)
        upcoming = _to_out(upcoming_booking, lawyer)

    recent_user_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == user.id, ChatMessage.role == "user")
        .order_by(ChatMessage.created_at.desc())
        .limit(3)
        .all()
    )
    recent = [
        RecentQuestion(q=msg.text, when=_relative_time(msg.created_at))
        for msg in recent_user_messages
    ]
    recent.extend(CANNED_QUESTIONS)
    recent = recent[:4]

    return UserDashboardOut(
        questions_answered=questions_answered,
        consults_booked=consults_booked,
        saved_amount=saved_amount,
        upcoming=upcoming,
        recent_questions=recent,
    )


@router.get("/lawyer", response_model=LawyerDashboardOut)
def lawyer_dashboard(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> LawyerDashboardOut:
    if user.role != "lawyer" or user.lawyer_id is None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Lawyer account required")

    lawyer = db.get(Lawyer, user.lawyer_id)
    if lawyer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lawyer not found")

    request_bookings = (
        db.query(Booking)
        .filter(
            Booking.lawyer_id == lawyer.id,
            Booking.status.in_(("pending_payment", "paid")),
        )
        .order_by(Booking.created_at.asc())
        .all()
    )
    requests = [_to_out(b, lawyer) for b in request_bookings]

    return LawyerDashboardOut(
        earnings_month=lawyer.earnings_month,
        consultations=lawyer.consultations,
        rating=lawyer.rating,
        reviews=lawyer.reviews,
        share_pct=lawyer.share_pct,
        requests=requests,
    )
