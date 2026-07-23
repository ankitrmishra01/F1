from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Race, Session as F1Session, Result, Driver, Team
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/races", tags=["Races"])

@router.get("/")
def get_races(season: int = None, db: Session = Depends(get_db)):
    """List all races, optionally filtered by season, with winner/podium data for completed races"""
    query = db.query(Race)
    if season:
        query = query.filter(Race.season == season)
    races = query.order_by(Race.season.desc(), Race.round.desc()).all()
    
    result_list = []
    for r in races:
        race_session = db.query(F1Session).filter_by(race_id=r.race_id, session_name="Race").first()
        winner_name = None
        podium_drivers = []
        is_completed = False
        
        if race_session:
            podium_res = db.query(Result, Driver)\
                .select_from(Result)\
                .join(Driver, Result.driver_id == Driver.driver_id)\
                .filter(Result.session_id == race_session.session_id, Result.position <= 3)\
                .order_by(Result.position.asc())\
                .all()
                
            if podium_res:
                is_completed = True
                podium_drivers = [f"{d.given_name} {d.family_name}" for res, d in podium_res]
                if len(podium_drivers) > 0:
                    winner_name = podium_drivers[0]
                    
        result_list.append({
            "race_id": r.race_id,
            "season": r.season,
            "round": r.round,
            "race_name": r.race_name,
            "date": r.date,
            "circuit_name": r.circuit_name,
            "country": r.country,
            "circuit_type": r.circuit_type,
            "is_completed": is_completed,
            "winner": winner_name,
            "podium": podium_drivers
        })
        
    return result_list

@router.get("/{race_id}/sessions")
def get_race_sessions(race_id: int, db: Session = Depends(get_db)):
    """All sessions for one race weekend, with results or timetable if upcoming"""
    race = db.query(Race).filter(Race.race_id == race_id).first()
    if not race:
        raise HTTPException(status_code=404, detail="Race not found")
        
    sessions = db.query(F1Session).filter(F1Session.race_id == race_id).all()
    
    response = {
        "race_id": race.race_id,
        "race_name": race.race_name,
        "season": race.season,
        "country": race.country,
        "circuit_name": race.circuit_name,
        "is_upcoming": False,
        "sessions": {}
    }
    
    has_results = False
    for s in sessions:
        results_data = []
        results = db.query(Result, Driver, Team)\
                    .select_from(Result)\
                    .join(Driver, Result.driver_id == Driver.driver_id)\
                    .join(Team, Result.team_id == Team.team_id)\
                    .filter(Result.session_id == s.session_id)\
                    .order_by(Result.position.asc())\
                    .all()
                    
        if results:
            has_results = True
            for r, d, t in results:
                results_data.append({
                    "driver_id": d.driver_id,
                    "driver_name": f"{d.given_name} {d.family_name}",
                    "team_id": t.team_id,
                    "team_name": t.name,
                    "position": r.position,
                    "points": r.points,
                    "grid": r.grid,
                    "status": r.status
                })
            response["sessions"][s.session_name] = results_data

    # If upcoming race with no recorded session results, generate weekend timetable schedule
    if not has_results:
        response["is_upcoming"] = True
        race_dt = datetime.strptime(race.date, "%Y-%m-%d") if race.date else datetime.now()
        
        response["timetable"] = [
            {"session": "Practice 1 (FP1)", "date": (race_dt - timedelta(days=2)).strftime("%a, %d %b %Y"), "time": "13:30 Local / 11:30 UTC"},
            {"session": "Practice 2 (FP2)", "date": (race_dt - timedelta(days=2)).strftime("%a, %d %b %Y"), "time": "17:00 Local / 15:00 UTC"},
            {"session": "Practice 3 (FP3)", "date": (race_dt - timedelta(days=1)).strftime("%a, %d %b %Y"), "time": "12:30 Local / 10:30 UTC"},
            {"session": "Qualifying", "date": (race_dt - timedelta(days=1)).strftime("%a, %d %b %Y"), "time": "16:00 Local / 14:00 UTC"},
            {"session": "Grand Prix Race", "date": race_dt.strftime("%a, %d %b %Y"), "time": "15:00 Local / 13:00 UTC"}
        ]

    return response
