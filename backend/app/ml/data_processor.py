import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal, Race, Session as F1Session, Result, Driver, Team

class DataProcessor:
    def __init__(self):
        self.db = SessionLocal()

    def __del__(self):
        self.db.close()
        
    def get_driver_form(self, driver_id, current_race_season, current_race_round, n=5):
        """Average finish pos and points over last n races"""
        # Find the last n races before this one
        past_races = self.db.query(Result.position, Result.points)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Race")\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(n).all()
            
        if not past_races:
            return 10.0, 0.0 # Defaults
            
        positions = [r[0] for r in past_races if r[0] is not None]
        points = [r[1] for r in past_races if r[1] is not None]
        
        avg_pos = sum(positions) / len(positions) if positions else 10.0
        avg_pts = sum(points) / len(points) if points else 0.0
        return avg_pos, avg_pts
        
    def get_driver_quali_form(self, driver_id, current_race_season, current_race_round, n=5):
        """Average grid position over last n races"""
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
        
    def get_team_trend(self, team_id, current_race_season, current_race_round):
        """Improving or declining avg finishing pos: (last 1-3) - (last 4-6)"""
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
        # If recent < older, they are improving (lower pos is better)
        return older - recent # Positive means improving
        
    def get_sprint_points(self, driver_id, current_race_season, current_race_round):
        """Points in the sprint at this round (if any)"""
        sprint = self.db.query(Result.points)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Sprint")\
            .filter(Race.season == current_race_season, Race.round == current_race_round)\
            .first()
        return sprint[0] if sprint and sprint[0] else 0.0
        
    def get_circuit_fit(self, driver_id, circuit_type, current_race_season, current_race_round):
        """Average finish pos at this circuit type historically"""
        past = self.db.query(Result.position)\
            .join(F1Session).join(Race)\
            .filter(Result.driver_id == driver_id, F1Session.session_name == "Race", Race.circuit_type == circuit_type)\
            .filter((Race.season < current_race_season) | ((Race.season == current_race_season) & (Race.round < current_race_round)))\
            .order_by(Race.season.desc(), Race.round.desc())\
            .limit(5).all()
            
        positions = [r[0] for r in past if r[0] is not None]
        return sum(positions) / len(positions) if positions else 10.0

    def create_features(self):
        """Create feature matrix from DB"""
        print("Creating features... This may take a moment.")
        # Only use recent seasons for training to save time/memory, e.g., 2020+
        races = self.db.query(Race).filter(Race.season >= 2020).all()
        
        features = []
        labels = []
        
        for race in races:
            # Find the winner
            winner = self.db.query(Result.driver_id)\
                .join(F1Session)\
                .filter(F1Session.race_id == race.race_id, F1Session.session_name == "Race", Result.position == 1)\
                .first()
            if not winner: continue
            
            # For each driver in this race, create features
            results = self.db.query(Result)\
                .join(F1Session)\
                .filter(F1Session.race_id == race.race_id, F1Session.session_name == "Race").all()
                
            for res in results:
                d_id = res.driver_id
                t_id = res.team_id
                
                recent_pos, recent_pts = self.get_driver_form(d_id, race.season, race.round)
                quali_pos = self.get_driver_quali_form(d_id, race.season, race.round)
                team_trend = self.get_team_trend(t_id, race.season, race.round)
                sprint_pts = self.get_sprint_points(d_id, race.season, race.round)
                circ_fit = self.get_circuit_fit(d_id, race.circuit_type, race.season, race.round)
                
                # We want a multi-class classification or a binary classification?
                # Actually, standard approach for race prediction is to predict probabilities for all drivers and pick highest.
                # So binary classification: Did this driver win? 1 : 0
                is_winner = 1 if d_id == winner[0] else 0
                
                feature_vector = [
                    recent_pos,
                    recent_pts,
                    quali_pos,
                    sprint_pts,
                    team_trend,
                    circ_fit,
                    1 if race.circuit_type == "street" else 0
                ]
                
                features.append(feature_vector)
                labels.append(is_winner)
                
        return np.array(features), np.array(labels)
        
    def get_upcoming_race_features(self, db):
        """Generate features for active drivers based on the most recent completed race"""
        # Find the latest race session that actually has results in the database
        latest_res = db.query(Result.session_id, Race.season, Race.round)\
            .select_from(Result)\
            .join(F1Session, Result.session_id == F1Session.session_id)\
            .join(Race, F1Session.race_id == Race.race_id)\
            .filter(F1Session.session_name == "Race")\
            .order_by(Race.season.desc(), Race.round.desc())\
            .first()
            
        if not latest_res:
            # Fallback: pick any drivers from drivers table
            drivers = db.query(Driver).limit(10).all()
            return [{"driver": f"{d.given_name} {d.family_name}", "features": [10.0, 0.0, 10.0, 0.0, 0.0, 10.0, 0]} for d in drivers]
            
        session_id, season, round_num = latest_res
        
        active_drivers = db.query(Result.driver_id, Result.team_id)\
            .filter(Result.session_id == session_id).all()
            
        features = []
        for d_id, t_id in active_drivers:
            recent_pos, recent_pts = self.get_driver_form(d_id, season, round_num + 1)
            quali_pos = self.get_driver_quali_form(d_id, season, round_num + 1)
            team_trend = self.get_team_trend(t_id, season, round_num + 1)
            sprint_pts = self.get_sprint_points(d_id, season, round_num + 1)
            circ_fit = self.get_circuit_fit(d_id, "permanent", season, round_num + 1)
            
            feature_vector = [
                recent_pos,
                recent_pts,
                quali_pos,
                sprint_pts,
                team_trend,
                circ_fit,
                0
            ]
            
            driver_name = db.query(Driver).filter_by(driver_id=d_id).first()
            name = f"{driver_name.given_name} {driver_name.family_name}" if driver_name else d_id
            
            features.append({"driver": name, "features": feature_vector})
            
        return features

