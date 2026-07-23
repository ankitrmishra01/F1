from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Race, Session as F1Session, Result, Driver, Team

router = APIRouter(prefix="/api/races", tags=["Races"])

@router.get("/")
def get_races(season: int = None, db: Session = Depends(get_db)):
    """List all races, optionally filtered by season"""
    query = db.query(Race)
    if season:
        query = query.filter(Race.season == season)
    races = query.order_by(Race.season.desc(), Race.round.desc()).all()
    
    return [{
        "race_id": r.race_id,
        "season": r.season,
        "round": r.round,
        "race_name": r.race_name,
        "date": r.date,
        "circuit_name": r.circuit_name,
        "country": r.country,
        "circuit_type": r.circuit_type
    } for r in races]

@router.get("/{race_id}/sessions")
def get_race_sessions(race_id: int, db: Session = Depends(get_db)):
    """All sessions for one race weekend, with results"""
    race = db.query(Race).filter(Race.race_id == race_id).first()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
        
    sessions = db.query(F1Session).filter(F1Session.race_id == race_id).all()
    
    response = {
        "race_id": race.race_id,
        "race_name": race.race_name,
        "season": race.season,
        "country": race.country,
        "sessions": {}
    }
    
    for s in sessions:
        results_data = []
        # Get results with driver and team
        results = db.query(Result, Driver, Team)\
                    .join(Driver)\
                    .join(Team)\
                    .filter(Result.session_id == s.session_id)\
                    .order_by(Result.position.asc())\
                    .all()
                    
        for r, d, t in results:
            results_data.append({
                "driver_id": d.driver_id,
                "driver_name": f"{d.given_name} {d.family_name}",
                "team_name": t.name,
                "position": r.position,
                "points": r.points,
                "grid": r.grid,
                "status": r.status
            })
            
        response["sessions"][s.session_name] = results_data
        
    return response
