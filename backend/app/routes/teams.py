from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas import Team
from app.ml.data_processor import DataProcessor

router = APIRouter(prefix="/api/teams", tags=["teams"])
data_processor = DataProcessor()

@router.on_event("startup")
async def startup():
    """Load data on startup"""
    data_processor.load_data()

@router.get("/", response_model=List[dict])
async def get_all_teams():
    """Get all F1 teams"""
    try:
        teams = data_processor.get_all_teams()
        return teams
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{team_id}", response_model=dict)
async def get_team(team_id: int):
    """Get a specific team by ID"""
    try:
        team = data_processor.get_team_by_id(team_id)
        if team is None:
            raise HTTPException(status_code=404, detail="Team not found")
        return team
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/standings/current")
async def get_standings():
    """Get current championship standings"""
    try:
        teams = data_processor.get_all_teams()
        # Sort by points descending
        standings = sorted(teams, key=lambda x: x.get('points', 0), reverse=True)
        return standings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
