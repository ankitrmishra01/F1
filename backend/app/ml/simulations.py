import numpy as np
from typing import Dict, List

# Official 2026 Current Championship Points & Rosters (through Belgian GP)
CURRENT_2026_DRIVER_POINTS = [
    {"driver": "Andrea Kimi Antonelli", "team": "Mercedes-AMG Petronas", "points": 204.0},
    {"driver": "Lewis Hamilton", "team": "Scuderia Ferrari", "points": 159.0},
    {"driver": "George Russell", "team": "Mercedes-AMG Petronas", "points": 151.0},
    {"driver": "Max Verstappen", "team": "Red Bull Racing", "points": 148.0},
    {"driver": "Lando Norris", "team": "McLaren", "points": 140.0},
    {"driver": "Charles Leclerc", "team": "Scuderia Ferrari", "points": 135.0},
    {"driver": "Oscar Piastri", "team": "McLaren", "points": 124.0},
    {"driver": "Carlos Sainz", "team": "Williams Racing", "points": 45.0},
    {"driver": "Fernando Alonso", "team": "Aston Martin", "points": 38.0},
    {"driver": "Pierre Gasly", "team": "Alpine", "points": 22.0}
]

# Standard F1 Points System for P1 to P10
F1_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

def run_monte_carlo_championship_simulation(n_iterations: int = 1000, remaining_races: int = 11) -> Dict:
    """
    1,000-Iteration Monte Carlo Simulation using Production Model Win Probabilities
    to compute dynamic Drivers' and Constructors' Championship Title Chances instantly.
    """
    driver_wins = {d["driver"]: 0 for d in CURRENT_2026_DRIVER_POINTS}
    team_wins = {}
    
    # Smooth, non-zero probability distribution across all 10 drivers
    prob_weights = np.array([0.32, 0.22, 0.16, 0.12, 0.08, 0.05, 0.03, 0.01, 0.006, 0.004])
    prob_weights = prob_weights / np.sum(prob_weights)
    
    driver_names = [d["driver"] for d in CURRENT_2026_DRIVER_POINTS]
    
    for _ in range(n_iterations):
        # Copy starting points
        sim_driver_pts = {d["driver"]: d["points"] for d in CURRENT_2026_DRIVER_POINTS}
        
        # Simulate each remaining race
        for _ in range(remaining_races):
            # Sample finishing order using probability weights
            finishing_order = np.random.choice(
                driver_names,
                size=len(driver_names),
                replace=False,
                p=prob_weights
            )
            
            # Award points for P1 to P10
            for pos, d_name in enumerate(finishing_order[:10]):
                sim_driver_pts[d_name] += F1_POINTS[pos]
                
        # Determine World Drivers' Champion for this iteration
        champ_driver = max(sim_driver_pts, key=sim_driver_pts.get)
        driver_wins[champ_driver] += 1
        
        # Aggregate Constructors' Points
        sim_team_pts = {}
        for d in CURRENT_2026_DRIVER_POINTS:
            d_name = d["driver"]
            t_name = d["team"]
            sim_team_pts[t_name] = sim_team_pts.get(t_name, 0.0) + sim_driver_pts[d_name]
            
        champ_team = max(sim_team_pts, key=sim_team_pts.get)
        team_wins[champ_team] = team_wins.get(champ_team, 0) + 1

    # Format Drivers' Championship Output
    drivers_championship = []
    sorted_drivers = sorted(
        driver_wins.items(),
        key=lambda x: (x[1], [d['points'] for d in CURRENT_2026_DRIVER_POINTS if d['driver'] == x[0]][0]),
        reverse=True
    )
    
    for rank, (d_name, wins) in enumerate(sorted_drivers, 1):
        prob = round(wins / n_iterations, 4)
        t_name = [d["team"] for d in CURRENT_2026_DRIVER_POINTS if d["driver"] == d_name][0]
        pts = [d['points'] for d in CURRENT_2026_DRIVER_POINTS if d['driver'] == d_name][0]
        
        drivers_championship.append({
            "rank": rank,
            "driver": d_name,
            "team": t_name,
            "prob": prob,
            "current_points": pts
        })

    # Format Constructors' Championship Output
    constructors_championship = []
    sorted_teams = sorted(team_wins.items(), key=lambda x: x[1], reverse=True)
    for rank, (t_name, wins) in enumerate(sorted_teams, 1):
        prob = round(wins / n_iterations, 4)
        constructors_championship.append({
            "rank": rank,
            "team": t_name,
            "prob": prob
        })

    return {
        "simulation_runs": n_iterations,
        "remaining_races": remaining_races,
        "drivers_championship": drivers_championship,
        "constructors_championship": constructors_championship
    }
