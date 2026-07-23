from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Team, Result, Race, Session as F1Session

router = APIRouter(prefix="/api/teams", tags=["Teams"])

@router.get("/")
def get_teams(db: Session = Depends(get_db)):
    """List all teams"""
    teams = db.query(Team).order_by(Team.name).all()
    return [{"team_id": t.team_id, "name": t.name, "nationality": t.nationality} for t in teams]

@router.get("/standings/current")
def get_constructor_standings(season: int = None, db: Session = Depends(get_db)):
    """Constructor standings for a specific season or latest season"""
    if not season:
        season = db.query(func.max(Race.season)).scalar()
    if not season: return []
    
    team_points = db.query(Team.team_id, Team.name, func.sum(Result.points).label("points"))\
        .select_from(Result)\
        .join(Team, Result.team_id == Team.team_id)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .join(Race, F1Session.race_id == Race.race_id)\
        .filter(Race.season == season, F1Session.session_name == "Race")\
        .group_by(Team.team_id, Team.name)\
        .order_by(func.sum(Result.points).desc())\
        .all()
        
    return [{"team_id": t[0], "team": t[1], "points": t[2], "season": season} for t in team_points]

@router.get("/{team_id}")
def get_team_profile(team_id: str, db: Session = Depends(get_db)):
    """Profile stats: wins, podiums, points. Supports team_id or team name."""
    team = db.query(Team).filter((Team.team_id == team_id) | (Team.name.ilike(team_id))).first()
    if not team:
        raise HTTPException(status_code=404, detail=f"Team '{team_id}' not found")
        
    # Get all results for this team in 'Race' sessions
    race_results = db.query(Result, F1Session, Race)\
        .select_from(Result)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .join(Race, F1Session.race_id == Race.race_id)\
        .filter(
            Result.team_id == team.team_id,
            F1Session.session_name == "Race"
        ).all()
    
    wins = sum(1 for r, _, _ in race_results if r.position == 1)
    podiums = sum(1 for r, _, _ in race_results if r.position and r.position <= 3)
    total_points = sum(r.points for r, _, _ in race_results if r.points)
    
    # Per-season breakdown
    seasons = {}
    for r, _, race in race_results:
        if race.season not in seasons:
            seasons[race.season] = {"points": 0, "wins": 0}
        seasons[race.season]["points"] += (r.points or 0)
        if r.position == 1:
            seasons[race.season]["wins"] += 1
            
    return {
        "team_id": team.team_id,
        "name": team.name,
        "nationality": team.nationality,
        "stats": {
            "wins": wins,
            "podiums": podiums,
            "total_points": Math_round(total_points) if 'Math_round' in globals() else round(total_points, 1)
        },
        "seasons": seasons
    }

@router.get("/{team_id}/races")
def get_team_races(team_id: str, season: int = None, db: Session = Depends(get_db)):
    """Full race-by-race history for team"""
    team = db.query(Team).filter((Team.team_id == team_id) | (Team.name.ilike(team_id))).first()
    if not team:
        return []

    query = db.query(Result, F1Session, Race)\
        .select_from(Result)\
        .join(F1Session, Result.session_id == F1Session.session_id)\
        .join(Race, F1Session.race_id == Race.race_id)\
        .filter(
            Result.team_id == team.team_id,
            F1Session.session_name == "Race"
        )
    if season:
        query = query.filter(Race.season == season)
        
    results = query.order_by(Race.season.desc(), Race.round.desc(), Result.position.asc()).all()
    
    race_map = {}
    for r, s, race in results:
        key = (race.season, race.round)
        if key not in race_map:
            race_map[key] = {
                "season": race.season,
                "round": race.round,
                "race_name": race.race_name,
                "points": 0,
                "best_position": 999
            }
        
        race_map[key]["points"] += (r.points or 0)
        if r.position and r.position < race_map[key]["best_position"]:
            race_map[key]["best_position"] = r.position

    for v in race_map.values():
        if v["best_position"] == 999: v["best_position"] = None
            
    sorted_history = sorted(race_map.values(), key=lambda x: (x["season"], x["round"]), reverse=True)
    return sorted_history
