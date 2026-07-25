import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal, Race, Session as F1Session, Result, Driver, Team

class DataProcessor:
    def __init__(self):
        self.db = SessionLocal()

    def __del__(self):
        try:
            self.db.close()
        except Exception:
            pass
        
    def get_driver_form(self, driver_id, current_race_season, current_race_round, n=5):
        """Average finish pos and points over last n races (strictly before this race)"""
        past_races = self.db.query(Result.position, Result.points)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Race")\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(n).all()
            
        if not past_races:
            return 10.0, 0.0
            
        positions = [r[0] for r in past_races if r[0] is not None]
        points = [r[1] for r in past_races if r[1] is not None]
        
        avg_pos = sum(positions) / len(positions) if positions else 10.0
        avg_pts = sum(points) / len(points) if points else 0.0
        return avg_pos, avg_pts
        
    def get_driver_quali_form(self, driver_id, current_race_season, current_race_round, n=5):
        """Average grid position over last n races (strictly before this race)"""
        past_qualis = self.db.query(Result.position)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Qualifying")\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(n).all()
            
        if not past_qualis:
            return 10.0
            
        positions = [r[0] for r in past_qualis if r[0] is not None]
        return sum(positions) / len(positions) if positions else 10.0

    def get_this_race_grid(self, driver_id, race_id, fallback_grid=10.0):
        """NEW FEATURE: Driver's actual starting grid position for THIS specific race (qualifying output)"""
        res = self.db.query(Result.grid)\
            .join(F1Session)\
            .filter(Result.driver_id == driver_id, F1Session.race_id == race_id, F1Session.session_name == "Race")\
            .first()
            
        if res and res[0] is not None and res[0] > 0:
            return float(res[0])
            
        # Try qualifying session result
        quali = self.db.query(Result.position)\
            .join(F1Session)\
            .filter(Result.driver_id == driver_id, F1Session.race_id == race_id, F1Session.session_name == "Qualifying")\
            .first()
            
        if quali and quali[0] is not None and quali[0] > 0:
            return float(quali[0])
            
        return float(fallback_grid)
        
    def get_team_trend(self, team_id, current_race_season, current_race_round):
        """Constructor team momentum over last 6 races (strictly before this race)"""
        past_races = self.db.query(Result.position)\
            .join(F1Session).join(Race)\
            .filter(Result.team_id == team_id, F1Session.session_name == "Race")\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(6).all()
            
        positions = [r[0] for r in past_races if r[0] is not None]
        if len(positions) < 6: return 0.0
        
        recent = sum(positions[:3]) / 3
        older = sum(positions[3:]) / 3
        return older - recent
        
    def get_circuit_fit(self, driver_id, circuit_type, current_race_season, current_race_round):
        """Driver's average finish pos at this circuit type historically (strictly before this race)"""
        past = self.db.query(Result.position)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Race", Race.circuit_type == circuit_type)\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(5).all()
            
        positions = [r[0] for r in past if r[0] is not None]
        return sum(positions) / len(positions) if positions else 10.0

    def create_features(self, start_year=2005):
        """Create feature matrix from DB with ZERO target race leakage"""
        print(f"Creating pre-race features for races since {start_year}...")
        races = self.db.query(Race).filter(Race.season >= start_year).order_by(Race.season.asc(), Race.round.asc()).all()
        
        features = []
        labels = []
        race_ids = []
        seasons = []
        
        for race in races:
            # Find the actual winner of this race
            winner = self.db.query(Result.driver_id)\
                .join(F1Session)\
                .filter(F1Session.race_id == race.race_id, F1Session.session_name == "Race", Result.position == 1)\
                .first()
            if not winner: continue
            
            # Fetch all driver entries for this race
            results = self.db.query(Result)\
                .join(F1Session)\
                .filter(F1Session.race_id == race.race_id, F1Session.session_name == "Race").all()
                
            for res in results:
                d_id = res.driver_id
                t_id = res.team_id
                
                # Pre-race features only
                recent_pos, recent_pts = self.get_driver_form(d_id, race.season, race.round)
                avg_quali_pos = self.get_driver_quali_form(d_id, race.season, race.round)
                this_race_grid = self.get_this_race_grid(d_id, race.race_id, fallback_grid=avg_quali_pos)
                team_trend = self.get_team_trend(t_id, race.season, race.round)
                circ_fit = self.get_circuit_fit(d_id, race.circuit_type, race.season, race.round)
                
                is_winner = 1 if d_id == winner[0] else 0
                
                feature_vector = [
                    recent_pos,        # 1. 5-race avg finish (pre-race)
                    recent_pts,        # 2. 5-race avg points (pre-race)
                    avg_quali_pos,     # 3. 5-race avg grid (pre-race)
                    this_race_grid,    # 4. THIS RACE'S ACTUAL GRID POSITION (strongest predictor)
                    team_trend,        # 5. Team momentum (pre-race)
                    circ_fit,          # 6. Circuit type fit (pre-race)
                    1 if race.circuit_type == "street" else 0 # 7. Circuit type flag
                ]
                
                features.append(feature_vector)
                labels.append(is_winner)
                race_ids.append(race.race_id)
                seasons.append(race.season)
                
        return np.array(features), np.array(labels), np.array(race_ids), np.array(seasons)
        
    def get_upcoming_race_features(self, db):
        """Generate pre-race features for active drivers"""
        latest_res = db.query(Result.session_id, Race.season, Race.round)\
            .select_from(Result)\
            .join(F1Session, Result.session_id == F1Session.session_id)\
            .join(Race, F1Session.race_id == Race.race_id)\
            .filter(F1Session.session_name == "Race")\
            .order_by(Race.season.desc(), Race.round.desc())\
            .first()
            
        if not latest_res:
            drivers = db.query(Driver).limit(10).all()
            return [{"driver": f"{d.given_name} {d.family_name}", "features": [10.0, 0.0, 10.0, 10.0, 0.0, 10.0, 0]} for d in drivers]
            
        session_id, season, round_num = latest_res
        
        active_drivers = db.query(Result.driver_id, Result.team_id)\
            .filter(Result.session_id == session_id).all()
            
        features = []
        for d_id, t_id in active_drivers:
            recent_pos, recent_pts = self.get_driver_form(d_id, season, round_num + 1)
            avg_quali_pos = self.get_driver_quali_form(d_id, season, round_num + 1)
            this_race_grid = avg_quali_pos # For upcoming, use recent qualifying form
            team_trend = self.get_team_trend(t_id, season, round_num + 1)
            circ_fit = self.get_circuit_fit(d_id, "permanent", season, round_num + 1)
            
            feature_vector = [
                recent_pos,
                recent_pts,
                avg_quali_pos,
                this_race_grid,
                team_trend,
                circ_fit,
                0
            ]
            
            driver_name = db.query(Driver).filter_by(driver_id=d_id).first()
            name = f"{driver_name.given_name} {driver_name.family_name}" if driver_name else d_id
            
            features.append({"driver": name, "features": feature_vector})
            
        return features
