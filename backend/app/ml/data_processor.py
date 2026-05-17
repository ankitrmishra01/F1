import pandas as pd
import numpy as np
from pathlib import Path
import json
import os

class DataProcessor:
    def __init__(self, data_dir=None):
        if data_dir is None:
            current_dir = Path(__file__).resolve().parent.parent.parent.parent
            data_dir = current_dir / "data"

        self.data_dir = Path(data_dir)
        self.teams_df = None
        self.races_df = None
        self.results_df = None
        
    def load_data(self):
        """Load all F1 data files"""
        try:
            self.teams_df = pd.read_csv(self.data_dir / "teams.csv")
            self.races_df = pd.read_csv(self.data_dir / "races.csv")
            self.results_df = pd.read_csv(self.data_dir / "historical_results.csv")
            return True
        except Exception as e:
            print(f"Error loading data from {self.data_dir}: {e}")
            return False
    
    def create_features(self):
        """Create feature matrix from race and team data"""
        if self.results_df is None:
            self.load_data()
        
        features = []
        labels = []
        
        for idx, row in self.results_df.iterrows():
            race_id = row['race_id']
            winner_id = row['winner_id']
            
            # Get race features
            race = self.races_df[self.races_df['race_id'] == race_id]
            if race.empty:
                continue
            
            # Get team features
            winner_team = self.teams_df[self.teams_df['team_id'] == winner_id]
            if winner_team.empty:
                continue
            
            # Create feature vector
            feature_vector = [
                winner_team['points'].values[0] / 1000,  # Normalize points
                len(winner_team['country'].values[0]),  # Country name length
                race['lap_distance'].values[0],  # Track length
                1 if race['circuit_type'].values[0] == 'permanent' else 0,  # Circuit type
                winner_team['wins'].values[0] / 10,  # Historical wins
            ]
            
            features.append(feature_vector)
            labels.append(winner_id)
        
        return np.array(features), np.array(labels)
    
    def get_team_by_id(self, team_id):
        """Get team information by ID"""
        team = self.teams_df[self.teams_df['team_id'] == team_id]
        if not team.empty:
            return team.iloc[0].to_dict()
        return None
    
    def get_all_teams(self):
        """Get all teams"""
        return self.teams_df.to_dict('records')
    
    def get_race_by_id(self, race_id):
        """Get race information by ID"""
        race = self.races_df[self.races_df['race_id'] == race_id]
        if not race.empty:
            return race.iloc[0].to_dict()
        return None
    
    def get_all_races(self):
        """Get all races"""
        return self.races_df.to_dict('records')
