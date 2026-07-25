import requests
import sqlite3
import os

DB_PATHS = [
    os.path.join(os.path.dirname(__file__), "data", "f1.db"),
    os.path.join(os.path.dirname(__file__), "f1.db")
]

def sync_all():
    print("Syncing 2005-2026 race schedule into databases...")
    for db_path in DB_PATHS:
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        
        # Create races table if not exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS races (
                race_id INTEGER PRIMARY KEY,
                season INTEGER,
                round INTEGER,
                race_name TEXT,
                date TEXT,
                circuit_id TEXT,
                circuit_name TEXT,
                locality TEXT,
                country TEXT,
                circuit_type TEXT DEFAULT 'permanent'
            )
        """)
        
        for year in range(2005, 2027):
            try:
                url = f"https://api.jolpi.ca/ergast/f1/{year}.json?limit=100"
                res = requests.get(url, timeout=10)
                if res.status_code == 200:
                    races = res.json().get("MRData", {}).get("RaceTable", {}).get("Races", [])
                    for r in races:
                        r_id = int(r["season"]) * 100 + int(r["round"])
                        r_name = r.get("raceName")
                        r_date = r.get("date")
                        c_id = r.get("Circuit", {}).get("circuitId", "")
                        c_name = r.get("Circuit", {}).get("circuitName", "")
                        locality = r.get("Circuit", {}).get("Location", {}).get("locality", "")
                        country = r.get("Circuit", {}).get("Location", {}).get("country", "")
                        c_type = "street" if "street" in c_name.lower() or "city" in c_name.lower() else "permanent"
                        
                        cur.execute("""
                            INSERT OR REPLACE INTO races (race_id, season, round, race_name, date, circuit_id, circuit_name, locality, country, circuit_type)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (r_id, int(r["season"]), int(r["round"]), r_name, r_date, c_id, c_name, locality, country, c_type))
                    print(f"Synced {year}: {len(races)} races.")
            except Exception as e:
                print(f"Error season {year}: {e}")
                
        con.commit()
        con.close()

if __name__ == "__main__":
    sync_all()
