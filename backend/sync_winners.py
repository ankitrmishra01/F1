import requests
import sqlite3
import os
import time

DB_PATHS = [
    os.path.join(os.path.dirname(__file__), "data", "f1.db"),
    os.path.join(os.path.dirname(__file__), "f1.db")
]

def sync_winners():
    print("Syncing real race winners and podiums for 2005-2026 into SQLite database...")
    for db_path in DB_PATHS:
        if not os.path.exists(db_path): continue
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        
        for year in range(2005, 2027):
            url = f"https://api.jolpi.ca/ergast/f1/{year}/results/1.json?limit=100"
            try:
                res = requests.get(url, timeout=10)
                if res.status_code == 200:
                    races = res.json().get("MRData", {}).get("RaceTable", {}).get("Races", [])
                    for r in races:
                        r_id = int(r["season"]) * 100 + int(r["round"])
                        r_date = r.get("date")
                        
                        # Ensure session
                        cur.execute("SELECT session_id FROM sessions WHERE race_id = ? AND session_name = 'Race'", (r_id,))
                        row = cur.fetchone()
                        if row:
                            s_id = row[0]
                        else:
                            cur.execute("INSERT INTO sessions (race_id, session_name, date) VALUES (?, 'Race', ?)", (r_id, r_date))
                            s_id = cur.lastrowid
                            
                        # Insert winner result (position 1)
                        results_list = r.get("Results", [])
                        if results_list:
                            winner = results_list[0]
                            d_item = winner.get("Driver", {})
                            t_item = winner.get("Constructor", {})
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
                                """, (s_id, d_id, t_id, winner.get("status")))
                                
                    print(f"Synced {year} winners: {len(races)} races.")
                time.sleep(0.15)
            except Exception as e:
                print(f"Error {year}: {e}")
                
        con.commit()
        con.close()

if __name__ == "__main__":
    sync_winners()
