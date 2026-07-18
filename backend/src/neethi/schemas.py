"""Pydantic request/response models — the API contract itself, mirrored by frontend/src/types.ts."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


# ---------- Auth ----------


class OtpRequestIn(BaseModel):
    phone: str


class OtpRequestOut(BaseModel):
    sent: bool = True


class OtpVerifyIn(BaseModel):
    phone: str
    otp: str
    role: str = "user"  # "user" | "lawyer"


class GuestIn(BaseModel):
    role: str  # "user" | "lawyer"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    name: str | None
    initials: str
    phone: str | None


class TokenOut(BaseModel):
    token: str
    user: UserOut


class MeOut(BaseModel):
    user: UserOut


class LogoutOut(BaseModel):
    ok: bool = True


# ---------- Chat ----------


class ChatMessageIn(BaseModel):
    conversation_id: str | None = None
    message: str


class ChatMessageOut(BaseModel):
    conversation_id: str
    id: str
    text: str
    points: list[str]
    citation: str
    cta: bool


class ChatMessageRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    text: str
    points: list[str]
    citation: str
    cta: bool
    created_at: datetime


class ChatHistoryOut(BaseModel):
    messages: list[ChatMessageRecord]


# ---------- Lawyers ----------


class LawyerCard(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    initials: str
    avatar_color: str
    spec: str
    category: str
    exp: int
    langs: list[str]
    rating: float
    reviews: int
    next_slot: str


class LawyerDetail(LawyerCard):
    bio: str
    bar_council_id: str
    price: int
    price_struck: int


class LawyersListOut(BaseModel):
    lawyers: list[LawyerCard]


# ---------- Bookings ----------


class BookingIn(BaseModel):
    lawyer_id: str
    day_label: str
    slot_label: str
    consult_type: str  # "Video" | "Phone"


class BookingRespondIn(BaseModel):
    action: str  # "accept" | "decline"


class BookingOut(BaseModel):
    id: str
    ref: str
    lawyer: LawyerCard
    user_id: str
    client_name: str | None
    client_initials: str | None
    topic: str | None
    day_label: str
    slot_label: str
    consult_type: str
    fee: int
    lawyer_share: int
    status: str
    created_at: datetime


class BookingsListOut(BaseModel):
    bookings: list[BookingOut]


# ---------- Payments ----------


class PaymentOrderIn(BaseModel):
    booking_id: str
    method: str  # "upi" | "card" | "netbanking"


class PaymentOrderOut(BaseModel):
    order_id: str
    amount: int
    status: str


class PaymentConfirmOut(BaseModel):
    status: str
    booking: BookingOut


# ---------- Messages (lawyer inbox) ----------


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sender: str  # "client" | "lawyer"
    text: str
    created_at: datetime


class MessageThreadOut(BaseModel):
    id: str
    client_name: str
    client_initials: str
    topic: str
    unread: bool
    messages: list[MessageOut]


class MessageThreadsListOut(BaseModel):
    threads: list[MessageThreadOut]


class ThreadReplyIn(BaseModel):
    text: str


class ThreadReplyOut(BaseModel):
    message: MessageOut


# ---------- Dashboard ----------


class RecentQuestion(BaseModel):
    q: str
    when: str


class UserDashboardOut(BaseModel):
    questions_answered: int
    consults_booked: int
    saved_amount: int
    upcoming: BookingOut | None
    recent_questions: list[RecentQuestion]


class LawyerDashboardOut(BaseModel):
    earnings_month: int
    consultations: int
    rating: float
    reviews: int
    share_pct: int
    requests: list[BookingOut]
