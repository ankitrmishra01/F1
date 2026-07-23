from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Driver, Result, Race, Session as F1Session

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

@router.get("/")
def get_drivers(db: Session = Depends(get_db)):
    """List all drivers"""
    drivers = db.query(Driver).order_by(Driver.given_name).all()
    return [{"driver_id": d.driver_id, "name": f"{d.given_name} {d.family_name}", "nationality": d.nationality} for d in drivers]

@router.get("/{driver_id}")
def get_driver_profile(driver_id: str, db: Session = Depends(get_db)):
    """Profile stats: wins, podiums, poles, points"""
    driver = db.query(Driver).filter(Driver.driver_id == driver_id).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    # Get all results for this driver in 'Race' sessions
    race_results = db.query(Result, F1Session, Race).join(F1Session).join(Race).filter(
        Result.driver_id == driver_id,
        F1Session.session_name == "Race"
    ).all()
    
    wins = sum(1 for r, _, _ in race_results if r.position == 1)
    podiums = sum(1 for r, _, _ in race_results if r.position and r.position <= 3)
    total_points = sum(r.points for r, _, _ in race_results if r.points)
    
    # Poles from 'Qualifying' sessions
    quali_results = db.query(Result).join(F1Session).filter(
        Result.driver_id == driver_id,
        F1Session.session_name == "Qualifying",
        Result.position == 1
    ).count()
    
    # Per-season breakdown
    seasons = {}
    for r, _, race in race_results:
        if race.season not in seasons:
            seasons[race.season] = {"points": 0, "wins": 0}
        seasons[race.season]["points"] += (r.points or 0)
        if r.position == 1:
            seasons[race.season]["wins"] += 1
            
    return {
        "driver_id": driver.driver_id,
        "name": f"{driver.given_name} {driver.family_name}",
        "nationality": driver.nationality,
        "date_of_birth": driver.date_of_birth,
        "stats": {
            "wins": wins,
            "podiums": podiums,
            "poles": quali_results,
            "total_points": total_points
        },
        "seasons": seasons
    }

@router.get("/{driver_id}/races")
def get_driver_races(driver_id: str, season: int = None, db: Session = Depends(get_db)):
    """Full race-by-race history"""
    query = db.query(Result, F1Session, Race).join(F1Session).join(Race).filter(
        Result.driver_id == driver_id,
        F1Session.session_name == "Race"
    )
    if season:
        query = query.filter(Race.season == season)
        
    results = query.order_by(Race.season.desc(), Race.round.desc()).all()
    
    history = []
    for r, s, race in results:
        history.append({
            "season": race.season,
            "round": race.round,
            "race_name": race.race_name,
            "position": r.position,
            "points": r.points,
            "status": r.status
        })
        
    return history
