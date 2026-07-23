from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Race

router = APIRouter(prefix="/api/seasons", tags=["Seasons"])

@router.get("/latest")
def get_latest_season(db: Session = Depends(get_db)):
    """Single source of truth: the max season present in our races table."""
    latest = db.query(func.max(Race.season)).scalar()
    return {"season": latest or 2024}
