import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from pathlib import Path
from .data_processor import DataProcessor

class F1PredictionModel:
    def __init__(self, model_path="backend/app/ml/models", data_dir=None):
        self.model_path = Path(model_path)
        self.model_path.mkdir(parents=True, exist_ok=True)
        self.model = None
        self.scaler = None
        if data_dir is None:
            # Find data directory from project root
            project_root = Path(__file__).parent.parent.parent.parent
            data_dir = project_root / "data"
        self.data_processor = DataProcessor(data_dir=str(data_dir))
        self.team_map = {}
        
    def train(self):
        """Train the F1 prediction model"""
        print("Loading data...")
        self.data_processor.load_data()
        
        # Create features and labels
        X, y = self.data_processor.create_features()
        
        # Map team IDs
        unique_teams = np.unique(y)
        self.team_map = {tid: self.data_processor.get_team_by_id(tid)['team_name'] 
                        for tid in unique_teams if self.data_processor.get_team_by_id(tid)}
        
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_scaled, y)
        print("✓ Model trained successfully")
        
        # Save model
        self.save_model()
    
    def save_model(self):
        """Save trained model to disk"""
        with open(self.model_path / "model.pkl", "wb") as f:
            pickle.dump(self.model, f)
        with open(self.model_path / "scaler.pkl", "wb") as f:
            pickle.dump(self.scaler, f)
        with open(self.model_path / "team_map.pkl", "wb") as f:
            pickle.dump(self.team_map, f)
        print("✓ Model saved")
    
    def load_model(self):
        """Load trained model from disk"""
        try:
            with open(self.model_path / "model.pkl", "rb") as f:
                self.model = pickle.load(f)
            with open(self.model_path / "scaler.pkl", "rb") as f:
                self.scaler = pickle.load(f)
            with open(self.model_path / "team_map.pkl", "rb") as f:
                self.team_map = pickle.load(f)
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    
    def predict(self, race_id, season, location, weather="clear", track_type="permanent"):
        """Predict winner for a race"""
        if self.model is None:
            self.load_model()
        
        # Create feature vector
        # Using synthetic features based on input
        track_length = 5.5  # Average track length
        circuit_permanent = 1 if track_type == "permanent" else 0
        team_points = 500  # Average team points
        team_wins = 3
        
        feature_vector = np.array([[
            team_points / 1000,
            len(location),
            track_length,
            circuit_permanent,
            team_wins / 10,
        ]])
        
        # Scale features
        X_scaled = self.scaler.transform(feature_vector)
        
        # Get prediction and probabilities
        prediction = self.model.predict(X_scaled)[0]
        probabilities = self.model.predict_proba(X_scaled)[0]
        
        # Get top 3 predictions
        top_indices = np.argsort(probabilities)[-3:][::-1]
        top_teams = [(self.team_map.get(self.model.classes_[i], "Unknown"), 
                      float(probabilities[i])) for i in top_indices]
        
        predicted_team = self.team_map.get(prediction, "Unknown")
        confidence = float(max(probabilities))
        
        # Create probability distribution
        prob_dist = {
            self.team_map.get(self.model.classes_[i], "Unknown"): float(probabilities[i])
            for i in range(len(self.model.classes_))
        }
        
        return {
            "predicted_winner": predicted_team,
            "confidence": confidence,
            "top_3": top_teams,
            "probability_distribution": prob_dist
        }
    
    def get_model_info(self):
        """Get model information"""
        return {
            "model_type": "Random Forest Classifier",
            "n_estimators": 100,
            "max_depth": 10,
            "teams": len(self.team_map),
            "training_races": 10
        }
