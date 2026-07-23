from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Driver, Team, Result, Race, Session as F1Session

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

@router.get("/")
def get_drivers(db: Session = Depends(get_db)):
    """List all drivers"""
    drivers = db.query(Driver).order_by(Driver.given_name).all()
    return [{"driver_id": d.driver_id, "name": f"{d.given_name} {d.family_name}", "nationality": d.nationality} for d in drivers]

@router.get("/standings/current")
def get_driver_standings(season: int = None, db: Session = Depends(get_db)):
    """Driver standings for a specific season or latest season"""
    if not season:
        season = db.query(func.max(Race.season)).scalar()
    if not season: return []

    driver_points = db.query(
        Driver.driver_id,
        Driver.given_name,
        Driver.family_name,
        Driver.nationality,
        Team.name.label("team_name"),
        func.sum(Result.points).label("points")
    ).select_from(Result)\
    .join(Driver, Result.driver_id == Driver.driver_id)\
    .join(Team, Result.team_id == Team.team_id)\
    .join(F1Session, Result.session_id == F1Session.session_id)\
    .join(Race, F1Session.race_id == Race.race_id)\
    .filter(Race.season == season, F1Session.session_name == "Race")\
    .group_by(Driver.driver_id, Driver.given_name, Driver.family_name, Driver.nationality, Team.name)\
    .order_by(func.sum(Result.points).desc())\
    .all()

    return [{
        "driver_id": d[0],
        "name": f"{d[1]} {d[2]}",
        "nationality": d[3],
        "team_name": d[4],
        "points": d[5],
        "season": season
    } for d in driver_points]

@router.get("/{driver_id}")
def get_driver_profile(driver_id: str, db: Session = Depends(get_db)):
    """Profile stats: wins, podiums, poles, points"""
    driver = db.query(Driver).filter((Driver.driver_id == driver_id) | (Driver.family_name.ilike(driver_id))).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
        
    # Get all results for this driver in 'Race' sessions
    race_results = db.query(Result, F1Session, Race)\
        .select_from(Result)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .join(Race, F1Session.race_id == Race.race_id)\
        .filter(
            Result.driver_id == driver.driver_id,
            F1Session.session_name == "Race"
        ).all()
    
    wins = sum(1 for r, _, _ in race_results if r.position == 1)
    podiums = sum(1 for r, _, _ in race_results if r.position and r.position <= 3)
    total_points = sum(r.points for r, _, _ in race_results if r.points)
    
    # Poles from 'Qualifying' sessions
    quali_results = db.query(Result)\
        .select_from(Result)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .filter(
            Result.driver_id == driver.driver_id,
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
            "total_points": round(total_points, 1)
        },
        "seasons": seasons
    }

@router.get("/{driver_id}/races")
def get_driver_races(driver_id: str, season: int = None, db: Session = Depends(get_db)):
    """Full race-by-race history"""
    driver = db.query(Driver).filter((Driver.driver_id == driver_id) | (Driver.family_name.ilike(driver_id))).first()
    if not driver: return []

    query = db.query(Result, F1Session, Race)\
        .select_from(Result)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .join(Race, F1Session.race_id == Race.race_id)\
        .filter(
            Result.driver_id == driver.driver_id,
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
