"""Payment endpoints — real Razorpay integration (Orders API + Checkout + webhooks).

Lawyer payouts stay manual-settlement only (no Razorpay Route / linked accounts /
automated split-payout) — see docs/DECISIONS.md "Real Razorpay
integration" entry for the full scoping decision.

When Razorpay keys are unset, `/order` and the webhook return 503 at request time; the
rest of the app boots and works normally with zero config.
"""

import json
import logging

import razorpay
import razorpay.errors
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.routers.bookings import _get_owned_booking, _to_out
from app.api.schemas import (
    PaymentConfirmIn,
    PaymentConfirmOut,
    PaymentOrderIn,
    PaymentOrderOut,
    PrefillOut,
)
from app.core.config import get_settings
from app.core.security import get_current_user
from app.db.models import Booking, Lawyer, PaymentOrder, User, WebhookEvent
from app.db.session import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/payments", tags=["payments"])

VALID_METHODS = {"upi", "card", "netbanking"}


def _rzp_client() -> razorpay.Client:
    settings = get_settings()
    return razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


def _order_out(order: PaymentOrder, user: User) -> PaymentOrderOut:
    return PaymentOrderOut(
        order_id=order.id,
        razorpay_order_id=order.razorpay_order_id,
        razorpay_key_id=get_settings().RAZORPAY_KEY_ID,
        amount=order.amount,
        currency=order.currency,
        status=order.status,
        prefill=PrefillOut(name=user.name, contact=user.phone, email=None),
    )


def _mark_paid(
    db: Session,
    order: PaymentOrder,
    booking: Booking,
    payment_id: str,
    signature: str | None,
) -> None:
    """Idempotently mark an order (and its booking) as paid."""
    order.razorpay_payment_id = payment_id
    if signature is not None:
        order.razorpay_signature = signature
    order.verified = True
    order.status = "paid"
    if booking.status == "pending_payment":
        booking.status = "paid"


@router.post("/order", response_model=PaymentOrderOut)
def create_order(
    payload: PaymentOrderIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentOrderOut:
    settings = get_settings()
    if not settings.razorpay_configured:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Payments are not configured")

    if payload.method not in VALID_METHODS:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid payment method")

    booking = _get_owned_booking(db, payload.booking_id, user)
    if booking.status != "pending_payment":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST, detail="Booking is not awaiting payment"
        )

    existing = (
        db.query(PaymentOrder)
        .filter(
            PaymentOrder.booking_id == booking.id,
            PaymentOrder.status == "created",
            PaymentOrder.razorpay_order_id.isnot(None),
        )
        .order_by(PaymentOrder.created_at.desc())
        .first()
    )
    if existing is not None:
        existing.method = payload.method
        db.commit()
        db.refresh(existing)
        return _order_out(existing, user)

    amount_paise = booking.fee * 100
    client = _rzp_client()
    try:
        rzp_order = client.order.create(
            {"amount": amount_paise, "currency": "INR", "receipt": booking.ref}
        )
    except Exception:  # noqa: BLE001 - any SDK/network failure surfaces as a 502
        logger.exception("Razorpay order.create failed")
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, detail="Could not reach payment gateway"
        ) from None

    order = PaymentOrder(
        booking_id=booking.id,
        method=payload.method,
        amount=amount_paise,
        currency="INR",
        receipt=booking.ref,
        razorpay_order_id=rzp_order["id"],
        status="created",
        verified=False,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return _order_out(order, user)


@router.post("/{order_id}/confirm", response_model=PaymentConfirmOut)
def confirm_order(
    order_id: str,
    body: PaymentConfirmIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> PaymentConfirmOut:
    order = db.get(PaymentOrder, order_id)
    if order is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Payment order not found")

    booking = db.get(Booking, order.booking_id)
    if booking is None or booking.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your payment order")

    if order.verified and order.status == "paid":
        lawyer = db.get(Lawyer, booking.lawyer_id)
        return PaymentConfirmOut(status="paid", booking=_to_out(booking, lawyer))

    if body.razorpay_order_id != order.razorpay_order_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Order mismatch")

    client = _rzp_client()
    try:
        client.utility.verify_payment_signature(
            {
                "razorpay_order_id": body.razorpay_order_id,
                "razorpay_payment_id": body.razorpay_payment_id,
                "razorpay_signature": body.razorpay_signature,
            }
        )
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Payment verification failed") from None

    _mark_paid(
        db,
        order,
        booking,
        payment_id=body.razorpay_payment_id,
        signature=body.razorpay_signature,
    )
    db.commit()
    db.refresh(order)
    db.refresh(booking)

    lawyer = db.get(Lawyer, booking.lawyer_id)
    return PaymentConfirmOut(status=order.status, booking=_to_out(booking, lawyer))


@router.post("/webhook")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)) -> dict:
    settings = get_settings()
    if not settings.RAZORPAY_WEBHOOK_SECRET:
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, detail="Webhooks not configured")

    raw = await request.body()
    signature = request.headers.get("X-Razorpay-Signature", "")
    client = _rzp_client()
    try:
        client.utility.verify_webhook_signature(
            raw.decode(), signature, settings.RAZORPAY_WEBHOOK_SECRET
        )
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature") from None

    payload = json.loads(raw)
    event = payload.get("event", "")
    event_id = request.headers.get("X-Razorpay-Event-Id", "")

    if event_id and db.get(WebhookEvent, event_id):
        return {"status": "ignored"}
    if event_id:
        db.add(WebhookEvent(event_id=event_id, event_type=event))
        db.commit()

    if event == "payment.captured":
        entity = payload["payload"]["payment"]["entity"]
        order = (
            db.query(PaymentOrder)
            .filter(PaymentOrder.razorpay_order_id == entity["order_id"])
            .first()
        )
        if order is not None:
            booking = db.get(Booking, order.booking_id)
            if booking is not None:
                _mark_paid(db, order, booking, payment_id=entity["id"], signature=None)
    elif event == "payment.failed":
        entity = payload["payload"]["payment"]["entity"]
        order = (
            db.query(PaymentOrder)
            .filter(PaymentOrder.razorpay_order_id == entity["order_id"])
            .first()
        )
        if order is not None:
            order.status = "failed"
            # booking intentionally LEFT at pending_payment (retryable) — confirmed
            # default, see docs/DECISIONS.md.

    db.commit()
    return {"status": "ok"}
