from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from app.database import get_db, Race, SessionLocal
from app.ml.data_sync import sync_season
from datetime import datetime

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def run_sync(season: int):
    db = SessionLocal()
    try:
        sync_season(db, season)
    finally:
        db.close()

@router.post("/sync-latest")
def sync_latest_season(background_tasks: BackgroundTasks, db: DBSession = Depends(get_db)):
    """Sync the current season data without blocking. Auto-detects year from today's date."""
    current_year = datetime.now().year
    background_tasks.add_task(run_sync, current_year)
    return {"message": f"Sync for season {current_year} started in the background."}
