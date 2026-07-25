import requests
import sqlite3
import os
import time

DB_PATHS = [
    os.path.join(os.path.dirname(__file__), "data", "f1.db"),
    os.path.join(os.path.dirname(__file__), "f1.db")
]

def sync_all():
    print("Syncing 2005-2026 race schedule, results, and winners into databases...")
    for db_path in DB_PATHS:
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        
        # 1. Ensure tables exist
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

        # Ensure Antonelli is present for 2025/2026
        cur.execute("INSERT OR REPLACE INTO drivers (driver_id, given_name, family_name, nationality) VALUES ('antonelli', 'Andrea Kimi', 'Antonelli', 'Italian')")
        cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('mercedes', 'Mercedes-AMG Petronas', 'German')")
        cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('ferrari', 'Scuderia Ferrari', 'Italian')")
        cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES ('mclaren', 'McLaren F1 Team', 'British')")

        for year in range(2005, 2027):
            try:
                url = f"https://api.jolpi.ca/ergast/f1/{year}/results.json?limit=1000"
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

                        # Ensure Session exists
                        cur.execute("SELECT session_id FROM sessions WHERE race_id = ? AND session_name = 'Race'", (r_id,))
                        sess = cur.fetchone()
                        if sess:
                            s_id = sess[0]
                        else:
                            cur.execute("INSERT INTO sessions (race_id, session_name, date) VALUES (?, 'Race', ?)", (r_id, r_date))
                            s_id = cur.lastrowid

                        # Insert Top Results
                        results_list = r.get("Results", [])
                        for res_item in results_list:
                            d_item = res_item.get("Driver", {})
                            t_item = res_item.get("Constructor", {})
                            d_id = d_item.get("driverId")
                            t_id = t_item.get("constructorId")
                            
                            if d_id:
                                cur.execute("INSERT OR REPLACE INTO drivers (driver_id, given_name, family_name, nationality) VALUES (?, ?, ?, ?)",
                                            (d_id, d_item.get("givenName"), d_item.get("familyName"), d_item.get("nationality")))
                            if t_id:
                                cur.execute("INSERT OR REPLACE INTO teams (team_id, name, nationality) VALUES (?, ?, ?)",
                                            (t_id, t_item.get("name"), t_item.get("nationality")))
                                
                            pos_val = int(res_item["position"]) if res_item.get("position", "").isdigit() else None
                            pts_val = float(res_item.get("points", 0.0))
                            grid_val = int(res_item["grid"]) if res_item.get("grid", "").isdigit() else None
                            
                            if d_id and t_id and pos_val:
                                cur.execute("""
                                    INSERT OR REPLACE INTO results (session_id, driver_id, team_id, position, points, grid, status)
                                    VALUES (?, ?, ?, ?, ?, ?, ?)
                                """, (s_id, d_id, t_id, pos_val, pts_val, grid_val, res_item.get("status")))

                    print(f"Synced {year}: {len(races)} races with results.")
                time.sleep(0.2)
            except Exception as e:
                print(f"Error season {year}: {e}")
                
        con.commit()
        con.close()

if __name__ == "__main__":
    sync_all()
