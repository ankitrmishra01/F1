from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Driver, Team, Result, Race, Session as F1Session
import requests
from datetime import datetime

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

# Headshots & Bio Metadata for Top F1 Drivers
DRIVER_META = {
    "hamilton": {
        "number": "44",
        "bio": "Sir Lewis Carl Davidson Hamilton MBE is a British racing driver competing in Formula One. A 7-time World Champion, Hamilton holds the all-time records for most race wins (103), pole positions (104), and podium finishes (201).",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png"
    },
    "verstappen": {
        "number": "1",
        "bio": "Max Emilian Verstappen is a Dutch racing driver competing in Formula One for Red Bull Racing. A 4-time World Champion, Verstappen became the youngest driver to start a Formula One race at 17 years old and won the 2021, 2022, 2023, and 2024 World Championships.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png"
    },
    "norris": {
        "number": "4",
        "bio": "Lando Norris is a British-Belgian racing driver competing in Formula One for McLaren. A Formula 2 runner-up in 2018, Norris made his F1 debut in 2019 and scored his maiden Grand Prix victory at Miami in 2024.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png"
    },
    "leclerc": {
        "number": "16",
        "bio": "Charles Marc Hervé Perceval Leclerc is a Monegasque racing driver competing in Formula One for Scuderia Ferrari. A 2017 Formula 2 Champion, Leclerc joined Ferrari in 2019 and became the youngest pole-sitter in Ferrari history.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png"
    },
    "piastri": {
        "number": "81",
        "bio": "Oscar Jack Piastri is an Australian racing driver competing in Formula One for McLaren. Piastri won the 2019 Formula Renault Eurocup, 2020 Formula 3 Championship, and 2021 Formula 2 Championship in consecutive rookie seasons.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png"
    },
    "russell": {
        "number": "63",
        "bio": "George William Russell is a British racing driver competing in Formula One for Mercedes. The 2018 FIA Formula 2 Champion, Russell joined Mercedes full-time in 2022 and scored his maiden Grand Prix win in Brazil 2022.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png"
    },
    "sainz": {
        "number": "55",
        "bio": "Carlos Sainz Vázquez de Castro is a Spanish racing driver competing in Formula One for Williams Racing. Winner of the 2014 Formula Renault 3.5 Series, Sainz scored maiden Grand Prix victories at Silverstone 2022, Singapore 2023, and Australia 2024.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png"
    },
    "alonso": {
        "number": "14",
        "bio": "Fernando Alonso Díaz is a Spanish racing driver competing for Aston Martin. A 2-time World Champion (2005, 2006) and 24 Hours of Le Mans winner, Alonso is the most experienced driver in F1 history with over 390 Grand Prix starts.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png"
    }
}

@router.get("/")
def get_drivers(db: Session = Depends(get_db)):
    """List all drivers"""
    drivers = db.query(Driver).order_by(Driver.given_name).all()
    return [{"driver_id": d.driver_id, "name": f"{d.given_name} {d.family_name}", "nationality": d.nationality} for d in drivers]

@router.get("/standings/current")
def get_driver_standings(season: int = None, db: Session = Depends(get_db)):
    """Driver standings for a specific season or latest season. Dynamically fetches from Jolpica if not in local DB."""
    if not season:
        season = db.query(func.max(Race.season)).scalar()
    if not season: season = datetime.now().year

    # Try local database
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

    if driver_points:
        return [{
            "driver_id": d[0],
            "name": f"{d[1]} {d[2]}",
            "nationality": d[3],
            "team_name": d[4],
            "points": d[5],
            "season": season
        } for d in driver_points]

    # Fallback to Jolpica Ergast API for older seasons (e.g., 2015, 2010)
    try:
        url = f"{JOLPICA_BASE}/{season}/driverStandings.json"
        resp = requests.get(url, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            lists = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
            if lists:
                standings = lists[0].get("DriverStandings", [])
                out = []
                for s in standings:
                    d_info = s.get("Driver", {})
                    t_info = s.get("Constructors", [{}])[0]
                    out.append({
                        "driver_id": d_info.get("driverId"),
                        "name": f"{d_info.get('givenName', '')} {d_info.get('familyName', '')}",
                        "nationality": d_info.get("nationality", ""),
                        "team_name": t_info.get("name", "N/A"),
                        "points": float(s.get("points", 0)),
                        "season": season
                    })
                return out
    except Exception as e:
        print(f"Jolpica driver standings fetch error: {e}")

    return []

@router.get("/{driver_id}")
def get_driver_profile(driver_id: str, db: Session = Depends(get_db)):
    """Profile stats: wins, podiums, poles, points, bio, age, permanent number, headshot image"""
    driver = db.query(Driver).filter((Driver.driver_id == driver_id) | (Driver.family_name.ilike(driver_id))).first()
    
    name = f"{driver.given_name} {driver.family_name}" if driver else driver_id.replace("_", " ").title()
    nat = driver.nationality if driver else "International"
    dob = driver.date_of_birth if driver else "N/A"
    
    # Calculate age
    age = "N/A"
    if dob and len(dob) >= 4:
        try:
            birth_year = int(dob[:4])
            age = datetime.now().year - birth_year
        except Exception:
            pass

    # Metadata enrichment
    meta = DRIVER_META.get(driver_id.lower(), {})
    number = meta.get("number", "10")
    bio = meta.get("bio", f"{name} is a Formula One racing driver competing at the highest level of motorsport.")
    image = meta.get("image", f"https://api.dicebear.com/7.x/bottts/svg?seed={driver_id}")

    # Query results
    race_results = []
    if driver:
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

    quali_results = 0
    if driver:
        quali_results = db.query(Result)\
            .select_from(Result)\
            .join(F1Session, Result.session_id == F1Session.session_id)\
            .filter(
                Result.driver_id == driver.driver_id,
                F1Session.session_name == "Qualifying",
                Result.position == 1
            ).count()

    seasons = {}
    for r, _, race in race_results:
        if race.season not in seasons:
            seasons[race.season] = {"points": 0, "wins": 0}
        seasons[race.season]["points"] += (r.points or 0)
        if r.position == 1:
            seasons[race.season]["wins"] += 1

    return {
        "driver_id": driver.driver_id if driver else driver_id,
        "name": name,
        "nationality": nat,
        "date_of_birth": dob,
        "age": age,
        "number": number,
        "bio": bio,
        "image": image,
        "url": driver.url if driver else f"https://en.wikipedia.org/wiki/{name.replace(' ', '_')}",
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
