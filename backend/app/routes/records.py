from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Champion, Driver, Team, Result, F1Session

router = APIRouter(prefix="/api/records", tags=["Records"])

@router.get("/champions")
def get_champions(db: Session = Depends(get_db)):
    """Every drivers' and constructors' champion"""
    champs = db.query(Champion).order_by(Champion.season.desc()).all()
    
    drivers = [c for c in champs if c.championship_type == "drivers"]
    teams = [c for c in champs if c.championship_type == "constructors"]
    
    d_list = []
    for d in drivers:
        driver = db.query(Driver).filter_by(driver_id=d.winner_id).first()
        name = f"{driver.given_name} {driver.family_name}" if driver else d.winner_id
        d_list.append({"season": d.season, "champion": name, "points": d.points})
        
    t_list = []
    for t in teams:
        team = db.query(Team).filter_by(team_id=t.winner_id).first()
        name = team.name if team else t.winner_id
        t_list.append({"season": t.season, "champion": name, "points": t.points})
        
    return {
        "drivers": d_list,
        "constructors": t_list
    }

@router.get("/all-time")
def get_all_time_leaderboards(db: Session = Depends(get_db)):
    """All-time leaderboards (wins, poles, podiums, championships)"""
    # Championships
    champs = db.query(Champion.winner_id, Champion.championship_type, func.count(Champion.id).label('total'))\
               .group_by(Champion.winner_id, Champion.championship_type)\
               .all()
    
    driver_champs = [{"id": c[0], "total": c[2]} for c in champs if c[1] == 'drivers']
    team_champs = [{"id": c[0], "total": c[2]} for c in champs if c[1] == 'constructors']
    
    # Wins (from Results where position=1 in Race session)
    driver_wins = db.query(Result.driver_id, func.count(Result.result_id).label('total'))\
                    .join(F1Session).filter(F1Session.session_name == 'Race', Result.position == 1)\
                    .group_by(Result.driver_id).order_by(func.count(Result.result_id).desc()).limit(10).all()
                    
    team_wins = db.query(Result.team_id, func.count(Result.result_id).label('total'))\
                  .join(F1Session).filter(F1Session.session_name == 'Race', Result.position == 1)\
                  .group_by(Result.team_id).order_by(func.count(Result.result_id).desc()).limit(10).all()
                  
    # Poles (Qualifying pos 1)
    poles = db.query(Result.driver_id, func.count(Result.result_id).label('total'))\
              .join(F1Session).filter(F1Session.session_name == 'Qualifying', Result.position == 1)\
              .group_by(Result.driver_id).order_by(func.count(Result.result_id).desc()).limit(10).all()
              
    # Podiums (Race pos 1-3)
    podiums = db.query(Result.driver_id, func.count(Result.result_id).label('total'))\
                .join(F1Session).filter(F1Session.session_name == 'Race', Result.position <= 3)\
                .group_by(Result.driver_id).order_by(func.count(Result.result_id).desc()).limit(10).all()
                
    # Format names
    def format_driver(d_id, total):
        d = db.query(Driver).filter_by(driver_id=d_id).first()
        name = f"{d.given_name} {d.family_name}" if d else d_id
        return {"name": name, "total": total}
        
    def format_team(t_id, total):
        t = db.query(Team).filter_by(team_id=t_id).first()
        name = t.name if t else t_id
        return {"name": name, "total": total}

    return {
        "championships": {
            "drivers": sorted([format_driver(d['id'], d['total']) for d in driver_champs], key=lambda x: x['total'], reverse=True)[:10],
            "constructors": sorted([format_team(t['id'], t['total']) for t in team_champs], key=lambda x: x['total'], reverse=True)[:10]
        },
        "wins": {
            "drivers": [format_driver(r[0], r[1]) for r in driver_wins],
            "constructors": [format_team(r[0], r[1]) for r in team_wins]
        },
        "poles": [format_driver(r[0], r[1]) for r in poles],
        "podiums": [format_driver(r[0], r[1]) for r in podiums]
    }
