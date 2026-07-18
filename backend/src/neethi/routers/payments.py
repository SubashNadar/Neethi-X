"""Payment endpoints — Razorpay simulated, no live gateway calls."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from neethi.auth import get_current_user
from neethi.database import get_db
from neethi.models import Booking, Lawyer, PaymentOrder, User
from neethi.routers.bookings import _get_owned_booking, _to_out
from neethi.schemas import PaymentConfirmOut, PaymentOrderIn, PaymentOrderOut

router = APIRouter(prefix="/payments", tags=["payments"])

VALID_METHODS = {"upi", "card", "netbanking"}


@router.post("/order", response_model=PaymentOrderOut)
def create_order(
    payload: PaymentOrderIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentOrderOut:
    if payload.method not in VALID_METHODS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid payment method")

    booking = _get_owned_booking(db, payload.booking_id, user)
    if booking.status != "pending_payment":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Booking is not awaiting payment"
        )

    order = PaymentOrder(
        booking_id=booking.id,
        method=payload.method,
        amount=booking.fee,
        status="processing",
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return PaymentOrderOut(order_id=order.id, amount=order.amount, status=order.status)


@router.post("/{order_id}/confirm", response_model=PaymentConfirmOut)
def confirm_order(
    order_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentConfirmOut:
    order = db.get(PaymentOrder, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Payment order not found")

    booking = db.get(Booking, order.booking_id)
    if booking is None or booking.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your payment order")

    order.status = "paid"
    if booking.status == "pending_payment":
        booking.status = "paid"
    db.commit()
    db.refresh(order)
    db.refresh(booking)

    lawyer = db.get(Lawyer, booking.lawyer_id)
    return PaymentConfirmOut(status=order.status, booking=_to_out(booking, lawyer))
