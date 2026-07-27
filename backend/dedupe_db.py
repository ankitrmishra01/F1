import sqlite3
import os

DB_PATHS = [
    os.path.join(os.path.dirname(__file__), "data", "f1.db"),
    os.path.join(os.path.dirname(__file__), "f1.db")
]

def dedupe():
    for p in DB_PATHS:
        if not os.path.exists(p): continue
        con = sqlite3.connect(p)
        cur = con.cursor()
        try:
            cur.execute("""
                DELETE FROM results 
                WHERE result_id NOT IN (
                    SELECT MIN(result_id) 
                    FROM results 
                    GROUP BY session_id, driver_id
                )
            """)
            con.commit()
            print(f"Successfully deduplicated results in {p}")
        except Exception as e:
            print(f"Error deduplicating {p}: {e}")
        finally:
            con.close()

if __name__ == "__main__":
    dedupe()
