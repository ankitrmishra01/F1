import numpy as np
from typing import Dict, List

# Official 2026 Current Championship Points & Rosters (post Hungarian GP Round 11)
CURRENT_2026_DRIVER_POINTS = [
    {"driver": "Andrea Kimi Antonelli", "team": "Mercedes-AMG Petronas", "points": 219.0, "rating": 89.0},
    {"driver": "George Russell", "team": "Mercedes-AMG Petronas", "points": 169.0, "rating": 87.5},
    {"driver": "Lewis Hamilton", "team": "Scuderia Ferrari", "points": 167.0, "rating": 88.0},
    {"driver": "Lando Norris", "team": "McLaren", "points": 153.0, "rating": 88.5},
    {"driver": "Charles Leclerc", "team": "Scuderia Ferrari", "points": 136.0, "rating": 87.0},
    {"driver": "Oscar Piastri", "team": "McLaren", "points": 110.0, "rating": 86.5},
    {"driver": "Max Verstappen", "team": "Red Bull Racing", "points": 103.0, "rating": 89.5},
    {"driver": "Isack Hadjar", "team": "Red Bull Racing", "points": 68.0, "rating": 82.0},
    {"driver": "Liam Lawson", "team": "Visa Cash App RB", "points": 43.0, "rating": 81.0},
    {"driver": "Pierre Gasly", "team": "Alpine", "points": 42.0, "rating": 80.0}
]

ALL_2026_CONSTRUCTORS = [
    {"team": "Mercedes-AMG Petronas", "points": 409.0},
    {"team": "Scuderia Ferrari", "points": 325.0},
    {"team": "McLaren F1 Team", "points": 263.0},
    {"team": "Red Bull Racing", "points": 189.0},
    {"team": "Visa Cash App RB (VCARB)", "points": 66.0},
    {"team": "Alpine F1 Team", "points": 61.0},
    {"team": "Haas F1 Team", "points": 21.0},
    {"team": "Audi", "points": 12.0},
    {"team": "Williams Racing", "points": 11.0},
    {"team": "Aston Martin F1 Team", "points": 1.0}
]

# Standard F1 Points System for P1 to P10
F1_POINTS = np.array([25, 18, 15, 12, 10, 8, 6, 4, 2, 1])

def run_monte_carlo_championship_simulation(n_iterations: int = 10000, remaining_races: int = 11) -> Dict:
    """
    Fast Vectorized 10,000-Iteration Monte Carlo Championship Simulation.
    Simulates race-by-race performance variance (Gumbel noise) and 10% DNF mechanical risk.
    """
    n_drivers = len(CURRENT_2026_DRIVER_POINTS)
    ratings = np.array([d["rating"] for d in CURRENT_2026_DRIVER_POINTS])
    initial_pts = np.array([d["points"] for d in CURRENT_2026_DRIVER_POINTS])
    
    # 1. Matrix Simulation: [N_ITERATIONS, REMAINING_RACES, N_DRIVERS]
    # Add Gumbel noise to driver ratings for every race in every simulated season
    gumbel_noise = np.random.gumbel(loc=0.0, scale=4.5, size=(n_iterations, remaining_races, n_drivers))
    race_performances = ratings + gumbel_noise
    
    # Simulate mechanical DNF risk (~8% DNF chance per race)
    dnf_mask = np.random.rand(n_iterations, remaining_races, n_drivers) < 0.08
    race_performances[dnf_mask] = -999.0
    
    # Sort race performances to get finishing positions per race
    # argsort[::-1] gives rank indices
    ranks = np.argsort(-race_performances, axis=2)
    
    # Assign F1 points based on finishing position
    points_matrix = np.zeros((n_iterations, remaining_races, n_drivers))
    for pos in range(min(10, n_drivers)):
        # Points awarded for position `pos`
        driver_indices = ranks[:, :, pos]
        np.add.at(points_matrix, (np.arange(n_iterations)[:, None], np.arange(remaining_races)[None, :], driver_indices), F1_POINTS[pos])
        
    # Sum points across all remaining races for each driver in each simulation
    total_sim_pts = initial_pts + np.sum(points_matrix, axis=1)
    
    # 2. Drivers' Championship Winner
    winning_driver_indices = np.argmax(total_sim_pts, axis=1)
    driver_win_counts = np.bincount(winning_driver_indices, minlength=n_drivers)
    
    # Format Drivers' Output
    drivers_championship = []
    sorted_driver_indices = np.argsort(-driver_win_counts)
    
    for rank, idx in enumerate(sorted_driver_indices, 1):
        d_info = CURRENT_2026_DRIVER_POINTS[idx]
        wins = driver_win_counts[idx]
        prob = round(float(wins / n_iterations), 4)
        
        drivers_championship.append({
            "rank": rank,
            "driver": d_info["driver"],
            "team": d_info["team"],
            "prob": prob,
            "current_points": d_info["points"]
        })

    # 3. Constructors' Championship Simulation
    # Group driver points by constructor
    team_points_map = {t["team"]: np.zeros(n_iterations) for t in ALL_2026_CONSTRUCTORS}
    
    # Add driver simulated points to corresponding constructor
    for idx, d_info in enumerate(CURRENT_2026_DRIVER_POINTS):
        team_name = d_info["team"]
        # Map short team name to full constructor name
        matched_team = None
        for t in ALL_2026_CONSTRUCTORS:
            if t["team"].lower() in team_name.lower() or team_name.lower() in t["team"].lower():
                matched_team = t["team"]
                break
        if not matched_team:
            matched_team = team_name
            
        if matched_team in team_points_map:
            team_points_map[matched_team] += total_sim_pts[:, idx]
        else:
            team_points_map[matched_team] = total_sim_pts[:, idx]

    # Find winning constructor per simulation run
    team_names_list = list(team_points_map.keys())
    team_pts_matrix = np.column_stack([team_points_map[tn] for tn in team_names_list])
    winning_team_indices = np.argmax(team_pts_matrix, axis=1)
    team_win_counts = np.bincount(winning_team_indices, minlength=len(team_names_list))
    
    constructors_championship = []
    sorted_team_indices = np.argsort(-team_win_counts)
    
    for rank, idx in enumerate(sorted_team_indices, 1):
        t_name = team_names_list[idx]
        wins = team_win_counts[idx]
        prob = round(float(wins / n_iterations), 4)
        
        # Get base current points
        cur_pts = next((t["points"] for t in ALL_2026_CONSTRUCTORS if t["team"] == t_name), 0.0)
        
        constructors_championship.append({
            "rank": rank,
            "team": t_name,
            "prob": prob,
            "current_points": cur_pts
        })

    return {
        "simulation_runs": n_iterations,
        "remaining_races": remaining_races,
        "drivers_championship": drivers_championship,
        "constructors_championship": constructors_championship
    }
