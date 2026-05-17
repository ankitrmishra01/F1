from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import Race
from app.ml.data_processor import DataProcessor

router = APIRouter(prefix="/api/races", tags=["races"])
data_processor = DataProcessor()

@router.on_event("startup")
async def startup():
    """Load data on startup"""
    data_processor.load_data()

@router.get("/", response_model=List[dict])
async def get_all_races():
    """Get all F1 races"""
    try:
        races = data_processor.get_all_races()
        return races
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{race_id}", response_model=dict)
async def get_race(race_id: int):
    """Get a specific race by ID"""
    try:
        race = data_processor.get_race_by_id(race_id)
        if race is None:
            raise HTTPException(status_code=404, detail="Race not found")
        return race
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/upcoming")
async def get_upcoming_races():
    """Get upcoming races"""
    try:
        races = data_processor.get_all_races()
        # Return next 3 races
        return races[:3] if len(races) >= 3 else races
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
