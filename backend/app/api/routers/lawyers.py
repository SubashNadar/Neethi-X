"""Lawyer directory endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.schemas import LawyerCard, LawyerDetail, LawyersListOut
from app.db.models import Lawyer
from app.db.session import get_db

router = APIRouter(prefix="/lawyers", tags=["lawyers"])


def _to_card(lawyer: Lawyer) -> LawyerCard:
    return LawyerCard(
        id=lawyer.id,
        name=lawyer.name,
        initials=lawyer.initials,
        avatar_color=lawyer.avatar_color,
        spec=lawyer.spec,
        category=lawyer.category,
        exp=lawyer.exp,
        langs=lawyer.langs_list,
        rating=lawyer.rating,
        reviews=lawyer.reviews,
        next_slot=lawyer.next_slot,
    )


@router.get("", response_model=LawyersListOut)
def list_lawyers(
    category: str | None = Query(default=None), db: Session = Depends(get_db)
) -> LawyersListOut:
    query = db.query(Lawyer)
    if category and category.lower() != "all":
        query = query.filter(Lawyer.category == category)
    lawyers = query.order_by(Lawyer.created_at.asc()).all()
    return LawyersListOut(lawyers=[_to_card(lawyer) for lawyer in lawyers])


@router.get("/{lawyer_id}", response_model=LawyerDetail)
def get_lawyer(lawyer_id: str, db: Session = Depends(get_db)) -> LawyerDetail:
    lawyer = db.get(Lawyer, lawyer_id)
    if lawyer is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Lawyer not found")
    return LawyerDetail(
        **_to_card(lawyer).model_dump(),
        bio=lawyer.bio,
        bar_council_id=lawyer.bar_council_id,
        price=lawyer.price,
        price_struck=lawyer.price_struck,
    )
