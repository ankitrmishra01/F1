import requests
import sqlite3
import os
import time

def sync_clean():
    db_path = os.path.join(os.path.dirname(__file__), "data", "f1.db")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    con = sqlite3.connect(db_path, timeout=30)
    cur = con.cursor()
    
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
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id INTEGER PRIMARY KEY AUTOINCREMENT,
            race_id INTEGER,
            session_name TEXT,
            date TEXT,
            time TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS drivers (
            driver_id TEXT PRIMARY KEY,
            given_name TEXT,
            family_name TEXT,
            nationality TEXT,
            date_of_birth TEXT,
            url TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS teams (
            team_id TEXT PRIMARY KEY,
            name TEXT,
            nationality TEXT,
            url TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS results (
            result_id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            driver_id TEXT,
            team_id TEXT,
            position INTEGER,
            points REAL,
            grid INTEGER,
            status TEXT
        )
    """)

    cur.execute("INSERT OR REPLACE INTO drivers (driver_id, given_name, family_name, nationality) VALUES ('antonelli', 'Andrea Kimi', 'Antonelli', 'Italian')")
    cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('mercedes', 'Mercedes-AMG Petronas', 'German')")
    cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('ferrari', 'Scuderia Ferrari', 'Italian')")
    cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('mclaren', 'McLaren F1 Team', 'British')")

    for year in range(2005, 2027):
        try:
            url = f"https://api.jolpi.ca/ergast/f1/{year}/results/1.json?limit=100"
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

                    cur.execute("SELECT session_id FROM sessions WHERE race_id = ? AND session_name = 'Race'", (r_id,))
                    row = cur.fetchone()
                    if row:
                        s_id = row[0]
                    else:
                        cur.execute("INSERT INTO sessions (race_id, session_name, date) VALUES (?, 'Race', ?)", (r_id, r_date))
                        s_id = cur.lastrowid

                    results_list = r.get("Results", [])
                    if results_list:
                        w = results_list[0]
                        d_item = w.get("Driver", {})
                        t_item = w.get("Constructor", {})
                        d_id = d_item.get("driverId")
                        t_id = t_item.get("constructorId")
                        
                        if d_id and t_id:
                            cur.execute("INSERT OR REPLACE INTO drivers (driver_id, given_name, family_name, nationality) VALUES (?, ?, ?, ?)",
                                        (d_id, d_item.get("givenName"), d_item.get("familyName"), d_item.get("nationality")))
                            cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES (?, ?, ?)",
                                        (t_id, t_item.get("name"), t_item.get("nationality")))
                            cur.execute("""
                                INSERT OR REPLACE INTO results (session_id, driver_id, team_id, position, points, grid, status)
                                VALUES (?, ?, ?, 1, 25.0, 1, ?)
                            """, (s_id, d_id, t_id, w.get("status")))
                print(f"Synced {year}: {len(races)} races & winners.")
            con.commit()
            time.sleep(0.1)
        except Exception as e:
            print(f"Error {year}: {e}")
            
    con.close()
    print("Database sync finished cleanly.")

if __name__ == "__main__":
    sync_clean()
