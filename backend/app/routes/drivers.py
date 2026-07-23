from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db, Driver, Team, Result, Race, Session as F1Session
import requests
from datetime import datetime

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"

DRIVER_META = {
    "hamilton": {
        "number": "44",
        "bio": "Sir Lewis Hamilton MBE is a British driver for Scuderia Ferrari. A 7-time World Champion, Hamilton holds the all-time records for most wins (103), poles (104), and podiums (201).",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png"
    },
    "verstappen": {
        "number": "1",
        "bio": "Max Verstappen is a Dutch driver for Red Bull Racing. A 4-time World Champion (2021-2024), Verstappen holds the record for most wins in a single season (19).",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png"
    },
    "norris": {
        "number": "4",
        "bio": "Lando Norris is a British-Belgian driver for McLaren. Maiden winner at Miami 2024, Norris led McLaren to the 2024 Constructors' World Championship.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png"
    },
    "leclerc": {
        "number": "16",
        "bio": "Charles Leclerc is a Monegasque driver for Scuderia Ferrari. A 2017 F2 Champion, Leclerc won Monaco 2024 & Monza 2024 for Ferrari.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png"
    },
    "piastri": {
        "number": "81",
        "bio": "Oscar Piastri is an Australian driver for McLaren. F3 & F2 Champion in rookie seasons, Piastri won Hungary 2024 & Azerbaijan 2024.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png"
    },
    "russell": {
        "number": "63",
        "bio": "George Russell is a British driver for Mercedes-AMG. F2 Champion in 2018, Russell won Brazil 2022 & Austria 2024 for Mercedes.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png"
    },
    "sainz": {
        "number": "55",
        "bio": "Carlos Sainz is a Spanish driver for Williams Racing. Sainz won Silverstone 2022, Singapore 2023, Australia 2024, and Mexico 2024.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png"
    },
    "alonso": {
        "number": "14",
        "bio": "Fernando Alonso is a 2-time World Champion (2005, 2006) driving for Aston Martin. Alonso holds the record for most F1 race starts in history.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png"
    },
    "antonelli": {
        "number": "12",
        "bio": "Andrea Kimi Antonelli is an Italian prodigy driving for Mercedes-AMG. FRECA Champion in 2023, Antonelli stepped up directly to Formula 1.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png"
    },
    "bearman": {
        "number": "87",
        "bio": "Oliver Bearman is a British driver for Haas F1 Team. Bearman scored points on his Ferrari F1 debut in Saudi Arabia 2024.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png"
    },
    "hadjar": {
        "number": "6",
        "bio": "Isack Hadjar is a French-Algerian driver in the Red Bull driver programme. F2 Title contender, Hadjar earned his F1 race seat.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png"
    },
    "bortoleto": {
        "number": "5",
        "bio": "Gabriel Bortoleto is a Brazilian driver for Sauber/Audi F1 Team. 2023 FIA Formula 3 Champion & 2024 FIA Formula 2 Champion.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png"
    },
    "colapinto": {
        "number": "43",
        "bio": "Franco Colapinto is an Argentine driver. Colapinto made a historic F1 debut at Monza 2024, scoring points for Williams in Baku.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png"
    },
    "doohan": {
        "number": "7",
        "bio": "Jack Doohan is an Australian driver for BWT Alpine F1 Team. F2 Runner-Up and son of 5-time 500cc Motorcycle World Champion Mick Doohan.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png"
    },
    "gasly": {
        "number": "10",
        "bio": "Pierre Gasly is a French driver for BWT Alpine F1 Team. Winner of the 2020 Italian Grand Prix at Monza with AlphaTauri.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png"
    },
    "ocon": {
        "number": "31",
        "bio": "Esteban Ocon is a French driver for Haas F1 Team. GP3 Champion in 2015, Ocon scored maiden F1 victory at Hungary 2021.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png"
    },
    "albon": {
        "number": "23",
        "bio": "Alexander Albon is a Thai-British driver leading Williams Racing. Albon scored podiums with Red Bull in 2020.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png"
    },
    "stroll": {
        "number": "18",
        "bio": "Lance Stroll is a Canadian driver for Aston Martin Aramco. 2016 F3 Champion, Stroll scored maiden podium in Baku 2017 & pole at Turkey 2020.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png"
    },
    "tsunoda": {
        "number": "22",
        "bio": "Yuki Tsunoda is a Japanese driver for Visa Cash App RB. Tsunoda entered F1 in 2021 following strong performance in F3 & F2.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png"
    },
    "hulkenberg": {
        "number": "27",
        "bio": "Nico Hülkenberg is a German driver for Kick Sauber / Audi. 2009 GP2 Champion & 2015 24 Hours of Le Mans winner.",
        "image": "https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png"
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
    
    age = "N/A"
    if dob and len(dob) >= 4:
        try:
            birth_year = int(dob[:4])
            age = datetime.now().year - birth_year
        except Exception:
            pass

    # Look up metadata from DRIVER_META or family name key
    meta_key = driver_id.lower()
    if driver and driver.family_name:
        if driver.family_name.lower() in DRIVER_META:
            meta_key = driver.family_name.lower()
            
    meta = DRIVER_META.get(meta_key, {})
    number = meta.get("number", "10")
    bio = meta.get("bio", f"{name} is a Formula One racing driver competing at the highest level of motorsport.")
    image = meta.get("image", None)

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
