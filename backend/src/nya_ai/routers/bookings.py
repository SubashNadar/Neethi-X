"""Booking endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from nya_ai.auth import get_current_user
from nya_ai.database import get_db
from nya_ai.models import Booking, Lawyer, User
from nya_ai.routers.lawyers import _to_card
from nya_ai.schemas import BookingIn, BookingOut, BookingRespondIn, BookingsListOut, ConsultBrief

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _to_out(booking: Booking, lawyer: Lawyer) -> BookingOut:
    return BookingOut(
        id=booking.id,
        ref=booking.ref,
        lawyer=_to_card(lawyer),
        user_id=booking.user_id,
        client_name=booking.client_name,
        client_initials=booking.client_initials,
        topic=booking.topic,
        brief=ConsultBrief.model_validate_json(booking.brief_json) if booking.brief_json else None,
        day_label=booking.day_label,
        slot_label=booking.slot_label,
        consult_type=booking.consult_type,
        fee=booking.fee,
        lawyer_share=booking.lawyer_share,
        status=booking.status,
        created_at=booking.created_at,
    )


def _next_ref(db: Session) -> str:
    today = datetime.now(timezone.utc).date()
    prefix = f"NX-{today:%Y%m%d}-"
    count_today = (
        db.query(func.count(Booking.id)).filter(Booking.ref.like(f"{prefix}%")).scalar() or 0
    )
    return f"{prefix}{count_today + 1:03d}"


def _get_owned_booking(db: Session, booking_id: str, user: User) -> Booking:
    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Booking not found")
    is_owner_user = user.role == "user" and booking.user_id == user.id
    is_owner_lawyer = user.role == "lawyer" and booking.lawyer_id == user.lawyer_id
    if not (is_owner_user or is_owner_lawyer):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your booking")
    return booking


@router.post("", response_model=BookingOut)
def create_booking(
    payload: BookingIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookingOut:
    if payload.consult_type not in ("Video", "Phone"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid consult_type")
    lawyer = db.get(Lawyer, payload.lawyer_id)
    if lawyer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lawyer not found")

    booking = Booking(
        ref=_next_ref(db),
        lawyer_id=lawyer.id,
        user_id=user.id,
        client_name=user.name,
        client_initials=user.initials,
        topic=payload.brief.topic if payload.brief else None,
        brief_json=payload.brief.model_dump_json() if payload.brief else None,
        day_label=payload.day_label,
        slot_label=payload.slot_label,
        consult_type=payload.consult_type,
        fee=lawyer.price,
        lawyer_share=int(lawyer.price * lawyer.share_pct / 100),
        status="pending_payment",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return _to_out(booking, lawyer)


@router.get("/me", response_model=BookingsListOut)
def my_bookings(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> BookingsListOut:
    if user.role == "lawyer":
        if user.lawyer_id is None:
            return BookingsListOut(bookings=[])
        bookings = (
            db.query(Booking)
            .filter(Booking.lawyer_id == user.lawyer_id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    else:
        bookings = (
            db.query(Booking)
            .filter(Booking.user_id == user.id)
            .order_by(Booking.created_at.desc())
            .all()
        )
    out = []
    for booking in bookings:
        lawyer = db.get(Lawyer, booking.lawyer_id)
        out.append(_to_out(booking, lawyer))
    return BookingsListOut(bookings=out)


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(
    booking_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> BookingOut:
    booking = _get_owned_booking(db, booking_id, user)
    lawyer = db.get(Lawyer, booking.lawyer_id)
    return _to_out(booking, lawyer)


@router.patch("/{booking_id}/respond", response_model=BookingOut)
def respond_booking(
    booking_id: str,
    payload: BookingRespondIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> BookingOut:
    if user.role != "lawyer":
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Lawyer account required")
    if payload.action not in ("accept", "decline"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid action")

    booking = db.get(Booking, booking_id)
    if booking is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.lawyer_id != user.lawyer_id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your booking")

    booking.status = "accepted" if payload.action == "accept" else "declined"
    db.commit()
    db.refresh(booking)
    lawyer = db.get(Lawyer, booking.lawyer_id)
    return _to_out(booking, lawyer)
