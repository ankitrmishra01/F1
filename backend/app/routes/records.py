from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Champion, Driver, Team, Result, Session as F1Session

router = APIRouter(prefix="/api/records", tags=["Records"])

NAME_MAP = {
    "michael_schumacher": "Michael Schumacher",
    "schumacher": "Michael Schumacher",
    "fangio": "Juan Manuel Fangio",
    "prost": "Alain Prost",
    "jack_brabham": "Jack Brabham",
    "brabham": "Jack Brabham",
    "lauda": "Niki Lauda",
    "stewart": "Jackie Stewart",
    "senna": "Ayrton Senna",
    "ascari": "Alberto Ascari",
    "piquet": "Nelson Piquet",
    "hill": "Graham Hill",
    "phil_hill": "Phil Hill",
    "damon_hill": "Damon Hill",
    "surtees": "John Surtees",
    "hulme": "Denny Hulme",
    "rindt": "Jochen Rindt",
    "fittipaldi": "Emerson Fittipaldi",
    "andretti": "Mario Andretti",
    "scheckter": "Jody Scheckter",
    "rosberg": "Keke Rosberg",
    "mansell": "Nigel Mansell",
    "hakkinen": "Mika Häkkinen",
    "vettel": "Sebastian Vettel",
    "nico_rosberg": "Nico Rosberg",
    "hamilton": "Lewis Hamilton",
    "max_verstappen": "Max Verstappen",
    "verstappen": "Max Verstappen",
    "team_lotus": "Lotus",
    "lotus": "Lotus",
    "brabham-repco": "Brabham-Repco",
    "cooper-climax": "Cooper-Climax",
    "matra-ford": "Matra-Ford",
    "tyrrell-ford": "Tyrrell-Ford",
    "brawn": "Brawn GP",
    "benetton": "Benetton",
    "williams": "Williams",
    "mclaren": "McLaren",
    "ferrari": "Ferrari",
    "mercedes": "Mercedes",
    "red_bull": "Red Bull",
}

def clean_name(raw_id: str, db: Session, is_driver=True):
    if not raw_id: return "Unknown"
    lower_id = raw_id.lower()
    if lower_id in NAME_MAP:
        return NAME_MAP[lower_id]
        
    if is_driver:
        d = db.query(Driver).filter_by(driver_id=raw_id).first()
        if d: return f"{d.given_name} {d.family_name}"
    else:
        t = db.query(Team).filter_by(team_id=raw_id).first()
        if t: return t.name
        
    # Formatting helper for unmapped raw strings
    return raw_id.replace("_", " ").title()

# True All-Time Official F1 Records (1950 - Present)
ALL_TIME_WINS_DRIVERS = [
    {"name": "Lewis Hamilton", "total": 103},
    {"name": "Michael Schumacher", "total": 91},
    {"name": "Max Verstappen", "total": 63},
    {"name": "Sebastian Vettel", "total": 53},
    {"name": "Alain Prost", "total": 51},
    {"name": "Ayrton Senna", "total": 41},
    {"name": "Fernando Alonso", "total": 32},
    {"name": "Nigel Mansell", "total": 31},
    {"name": "Jackie Stewart", "total": 27},
    {"name": "Jim Clark", "total": 25},
    {"name": "Niki Lauda", "total": 25},
]

ALL_TIME_POLES_DRIVERS = [
    {"name": "Lewis Hamilton", "total": 104},
    {"name": "Michael Schumacher", "total": 68},
    {"name": "Ayrton Senna", "total": 65},
    {"name": "Sebastian Vettel", "total": 57},
    {"name": "Max Verstappen", "total": 40},
    {"name": "Jim Clark", "total": 33},
    {"name": "Alain Prost", "total": 33},
    {"name": "Nigel Mansell", "total": 32},
    {"name": "Nico Rosberg", "total": 30},
    {"name": "Charles Leclerc", "total": 26},
    {"name": "Mika Häkkinen", "total": 26},
]

ALL_TIME_PODIUMS_DRIVERS = [
    {"name": "Lewis Hamilton", "total": 201},
    {"name": "Michael Schumacher", "total": 155},
    {"name": "Sebastian Vettel", "total": 122},
    {"name": "Max Verstappen", "total": 111},
    {"name": "Alain Prost", "total": 106},
    {"name": "Fernando Alonso", "total": 106},
    {"name": "Kimi Räikkönen", "total": 103},
    {"name": "Ayrton Senna", "total": 80},
    {"name": "Rubens Barrichello", "total": 68},
    {"name": "Valtteri Bottas", "total": 67},
]

ALL_TIME_WINS_TEAMS = [
    {"name": "Ferrari", "total": 246},
    {"name": "McLaren", "total": 188},
    {"name": "Mercedes", "total": 128},
    {"name": "Red Bull", "total": 120},
    {"name": "Williams", "total": 114},
    {"name": "Team Lotus", "total": 79},
    {"name": "Brabham", "total": 35},
    {"name": "Renault", "total": 35},
    {"name": "Benetton", "total": 27},
    {"name": "Tyrrell", "total": 23},
]

@router.get("/champions")
def get_champions(db: Session = Depends(get_db)):
    """Every drivers' and constructors' champion"""
    champs = db.query(Champion).order_by(Champion.season.desc()).all()
    
    drivers = [c for c in champs if c.championship_type == "drivers"]
    teams = [c for c in champs if c.championship_type == "constructors"]
    
    d_list = []
    for d in drivers:
        name = clean_name(d.winner_id, db, is_driver=True)
        d_list.append({"season": d.season, "champion": name, "points": d.points})
        
    t_list = []
    for t in teams:
        name = clean_name(t.winner_id, db, is_driver=False)
        t_list.append({"season": t.season, "champion": name, "points": t.points})
        
    return {
        "drivers": d_list,
        "constructors": t_list
    }

@router.get("/all-time")
def get_all_time_leaderboards(db: Session = Depends(get_db)):
    """All-time leaderboards (wins, poles, podiums, championships)"""
    # Championships tally from DB champions table
    champs = db.query(Champion.winner_id, Champion.championship_type, func.count(Champion.id).label('total'))\
               .group_by(Champion.winner_id, Champion.championship_type)\
               .all()
    
    driver_champ_counts = {}
    for c in champs:
        if c[1] == 'drivers':
            name = clean_name(c[0], db, is_driver=True)
            driver_champ_counts[name] = driver_champ_counts.get(name, 0) + c[2]

    team_champ_counts = {}
    for c in champs:
        if c[1] == 'constructors':
            name = clean_name(c[0], db, is_driver=False)
            team_champ_counts[name] = team_champ_counts.get(name, 0) + c[2]
            
    driver_champs_list = sorted([{"name": k, "total": v} for k, v in driver_champ_counts.items()], key=lambda x: x['total'], reverse=True)[:10]
    team_champs_list = sorted([{"name": k, "total": v} for k, v in team_champ_counts.items()], key=lambda x: x['total'], reverse=True)[:10]

    return {
        "championships": {
            "drivers": driver_champs_list,
            "constructors": team_champs_list
        },
        "wins": {
            "drivers": ALL_TIME_WINS_DRIVERS,
            "constructors": ALL_TIME_WINS_TEAMS
        },
        "poles": ALL_TIME_POLES_DRIVERS,
        "podiums": ALL_TIME_PODIUMS_DRIVERS
    }
