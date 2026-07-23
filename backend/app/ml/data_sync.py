import requests
import json
import sqlite3
import argparse
import sys
import os
from datetime import datetime
import pandas as pd

# Fix the import path so it works when run directly or imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal, Driver, Team, Race, Session, Result, Champion

JOLPICA_BASE = "https://api.jolpi.ca/ergast/f1"
OPENF1_BASE = "https://api.openf1.org/v1"

def fetch_jolpica(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    print(f"Failed to fetch {url}: {response.status_code}")
    return None

def fetch_openf1(endpoint):
    url = f"{OPENF1_BASE}{endpoint}"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    print(f"Failed to fetch {url}: {response.status_code}")
    return None

def sync_champions(db, start_year=1950):
    print("Syncing all-time champions...")
    current_year = datetime.now().year
    
    # Iterate through seasons
    for year in range(start_year, current_year):
        # Driver champion
        d_url = f"{JOLPICA_BASE}/{year}/driverStandings.json"
        data = fetch_jolpica(d_url)
        if data:
            standings = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
            if standings and standings[0].get("DriverStandings"):
                winner = standings[0]["DriverStandings"][0]
                driver = winner["Driver"]["driverId"]
                points = float(winner["points"])
                
                champ = db.query(Champion).filter_by(season=year, championship_type='drivers').first()
                if not champ:
                    db.add(Champion(season=year, championship_type='drivers', winner_id=driver, points=points))
                else:
                    champ.winner_id = driver
                    champ.points = points
        
        # Constructor champion (from 1958)
        if year >= 1958:
            c_url = f"{JOLPICA_BASE}/{year}/constructorStandings.json"
            data = fetch_jolpica(c_url)
            if data:
                standings = data.get("MRData", {}).get("StandingsTable", {}).get("StandingsLists", [])
                if standings and standings[0].get("ConstructorStandings"):
                    winner = standings[0]["ConstructorStandings"][0]
                    team = winner["Constructor"]["constructorId"]
                    points = float(winner["points"])
                    
                    champ = db.query(Champion).filter_by(season=year, championship_type='constructors').first()
                    if not champ:
                        db.add(Champion(season=year, championship_type='constructors', winner_id=team, points=points))
                    else:
                        champ.winner_id = team
                        champ.points = points
                        
        import time
        time.sleep(0.5) # Rate limit protection

    db.commit()

def sync_season(db, season):
    print(f"Syncing season {season}...")
    
    # 1. Races
    races_data = fetch_jolpica(f"{JOLPICA_BASE}/{season}.json?limit=100")
    if not races_data: return
    
    race_list = races_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
    for r in race_list:
        race_id = int(r["season"]) * 100 + int(r["round"]) # Unique int ID
        race_db = db.query(Race).filter_by(race_id=race_id).first()
        if not race_db:
            race_db = Race(
                race_id=race_id,
                season=int(r["season"]),
                round=int(r["round"]),
                race_name=r["raceName"],
                date=r["date"],
                circuit_id=r["Circuit"]["circuitId"],
                circuit_name=r["Circuit"]["circuitName"],
                locality=r["Circuit"]["Location"]["locality"],
                country=r["Circuit"]["Location"]["country"],
                circuit_type="street" if "street" in r["Circuit"]["circuitName"].lower() or "city" in r["Circuit"]["circuitName"].lower() else "permanent"
            )
            db.add(race_db)
        
        # 2. Race Results (Main Session)
        res_data = fetch_jolpica(f"{JOLPICA_BASE}/{season}/{r['round']}/results.json?limit=100")
        if res_data:
            races = res_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            if races:
                results = races[0].get("Results", [])
                sync_results(db, race_db, "Race", r["date"], r.get("time", "15:00:00Z"), results)
        
        # 3. Sprint Results
        sprint_data = fetch_jolpica(f"{JOLPICA_BASE}/{season}/{r['round']}/sprint.json?limit=100")
        if sprint_data:
            sprints = sprint_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            if sprints:
                results = sprints[0].get("SprintResults", [])
                sync_results(db, race_db, "Sprint", None, None, results)
                
        # 4. Qualifying Results
        quali_data = fetch_jolpica(f"{JOLPICA_BASE}/{season}/{r['round']}/qualifying.json?limit=100")
        if quali_data:
            qualis = quali_data.get("MRData", {}).get("RaceTable", {}).get("Races", [])
            if qualis:
                results = qualis[0].get("QualifyingResults", [])
                sync_results(db, race_db, "Qualifying", None, None, results)

    # 5. OpenF1 Practice Sessions (2023+)
    if season >= 2023:
        sync_openf1_practices(db, season)

    db.commit()

def sync_results(db, race, session_name, date, time, results):
    # Ensure session exists
    session = db.query(Session).filter_by(race_id=race.race_id, session_name=session_name).first()
    if not session:
        session = Session(race_id=race.race_id, session_name=session_name, date=date, time=time)
        db.add(session)
        db.flush()
    
    # Process results
    for res in results:
        driver = res.get("Driver", {})
        team = res.get("Constructor", {})
        
        d_id = driver.get("driverId")
        t_id = team.get("constructorId")
        
        if not d_id or not t_id: continue
        
        # Ensure Driver
        d_db = db.query(Driver).filter_by(driver_id=d_id).first()
        if not d_db:
            d_db = Driver(
                driver_id=d_id,
                given_name=driver.get("givenName"),
                family_name=driver.get("familyName"),
                nationality=driver.get("nationality"),
                date_of_birth=driver.get("dateOfBirth"),
                url=driver.get("url")
            )
            db.add(d_db)
            
        # Ensure Team
        t_db = db.query(Team).filter_by(team_id=t_id).first()
        if not t_db:
            t_db = Team(
                team_id=t_id,
                name=team.get("name"),
                nationality=team.get("nationality"),
                url=team.get("url")
            )
            db.add(t_db)
            
        db.flush()
        
        # Result entry
        r_db = db.query(Result).filter_by(session_id=session.session_id, driver_id=d_id).first()
        if not r_db:
            points = float(res.get("points", 0)) if "points" in res else 0.0
            pos_text = res.get("position", "0")
            pos = int(pos_text) if pos_text.isdigit() else None
            grid = int(res.get("grid", 0)) if "grid" in res and str(res.get("grid")).isdigit() else None
            
            # Use Q3/Q2/Q1 for qualifying time
            status = res.get("status")
            if session_name == "Qualifying":
                time_str = res.get("Q3", res.get("Q2", res.get("Q1", "")))
                status = time_str if time_str else None
                
            r_db = Result(
                session_id=session.session_id,
                driver_id=d_id,
                team_id=t_id,
                position=pos,
                points=points,
                grid=grid,
                status=status
            )
            db.add(r_db)

def sync_openf1_practices(db, season):
    print(f"Fetching OpenF1 practice data for {season}...")
    sessions = fetch_openf1(f"/sessions?year={season}")
    if not sessions: return
    
    practice_sessions = [s for s in sessions if s.get("session_type") == "Practice"]
    
    for ps in practice_sessions:
        # Match with Jolpica Race
        # Jolpica doesn't use openf1 meeting_key, so we match by country/year or date
        # OpenF1 date_start e.g. "2023-03-03T11:30:00+00:00"
        date_str = ps.get("date_start", "")[:10]
        # Find a race in the same year close to this date
        races_this_year = db.query(Race).filter_by(season=season).all()
        matched_race = None
        for r in races_this_year:
            if r.date and abs((datetime.strptime(r.date, "%Y-%m-%d") - datetime.strptime(date_str, "%Y-%m-%d")).days) <= 7:
                matched_race = r
                break
        
        if not matched_race: continue
        
        session_name = ps.get("session_name") # "Practice 1", etc.
        # standardize to FP1, FP2, FP3
        s_map = {"Practice 1": "FP1", "Practice 2": "FP2", "Practice 3": "FP3"}
        s_name = s_map.get(session_name, session_name)
        
        session = db.query(Session).filter_by(race_id=matched_race.race_id, session_name=s_name).first()
        if not session:
            session = Session(race_id=matched_race.race_id, session_name=s_name, date=date_str, time="")
            db.add(session)
            db.flush()
            
        # Get fastest laps per driver for this session to figure out positions
        import time
        time.sleep(0.5)
        laps = fetch_openf1(f"/laps?session_key={ps['session_key']}")
        if not laps: continue
        
        df = pd.DataFrame(laps)
        if df.empty or 'lap_duration' not in df.columns: continue
        
        # Get min lap per driver
        fastest = df.dropna(subset=['lap_duration']).groupby('driver_number')['lap_duration'].min().sort_values()
        
        # Map driver numbers to our driver_ids. OpenF1 has a /drivers endpoint
        drivers_info = fetch_openf1(f"/drivers?session_key={ps['session_key']}")
        num_to_name = {d['driver_number']: (d.get('name_acronym', '').lower(), d.get('full_name', '').lower()) for d in drivers_info} if drivers_info else {}
        
        pos = 1
        for driver_num, lap_time in fastest.items():
            # Try to find driver in our DB
            d_info = num_to_name.get(driver_num)
            driver_db = None
            if d_info:
                # Naive matching: OpenF1 acronym matches first 3 of family name, or try to match name
                driver_db = db.query(Driver).filter(
                    (Driver.driver_id.like(f"%{d_info[0]}%")) |
                    (Driver.family_name.ilike(f"%{d_info[1].split()[-1]}%"))
                ).first()
            
            if driver_db:
                # We need the team for the Result. Just pick the team they drove for in the Race session
                race_session = db.query(Session).filter_by(race_id=matched_race.race_id, session_name="Race").first()
                team_id = None
                if race_session:
                    race_res = db.query(Result).filter_by(session_id=race_session.session_id, driver_id=driver_db.driver_id).first()
                    if race_res: team_id = race_res.team_id
                
                if team_id:
                    # Insert result
                    r_db = db.query(Result).filter_by(session_id=session.session_id, driver_id=driver_db.driver_id).first()
                    if not r_db:
                        db.add(Result(
                            session_id=session.session_id,
                            driver_id=driver_db.driver_id,
                            team_id=team_id,
                            position=pos,
                            points=0.0,
                            status=f"{lap_time:.3f}"
                        ))
            pos += 1

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--season", type=int, help="Specific season to sync")
    parser.add_argument("--all", action="store_true", help="Full rebuild: sync all seasons from 2005 to present")
    parser.add_argument("--latest", action="store_true", help="Sync the current year's season (auto-detected)")
    args = parser.parse_args()
    
    db = SessionLocal()
    
    from database import Base, engine
    Base.metadata.create_all(bind=engine)
    
    sync_champions(db, 1950)
    
    current_year = datetime.now().year
    
    if args.season:
        sync_season(db, args.season)
    elif args.latest:
        print(f"Auto-detected current season: {current_year}")
        sync_season(db, current_year)
    elif args.all:
        for y in range(2005, current_year + 1):
            sync_season(db, y)
    else:
        print("Please specify --season YYYY, --latest, or --all")
        
if __name__ == "__main__":
    main()

