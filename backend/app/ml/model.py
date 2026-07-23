import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from pathlib import Path
from .data_processor import DataProcessor
from app.database import get_db, SessionLocal, Driver

class F1PredictionModel:
    def __init__(self, model_path="backend/app/ml/models"):
        self.model_path = Path(model_path)
        self.model_path.mkdir(parents=True, exist_ok=True)
        self.model = None
        self.scaler = None
        self.data_processor = DataProcessor()
        self.driver_map = {}
        
    def train(self):
        """Train the F1 prediction model"""
        print("Creating features from database...")
        # Create features and labels
        X, y = self.data_processor.create_features()
        
        if len(X) == 0:
            print("No training data available. Sync data first.")
            return
            
        print(f"Training on {len(X)} records...")
        # Scale features
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        # Train model
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1,
            class_weight='balanced'
        )
        self.model.fit(X_scaled, y)
        print("Model trained successfully")
        
        # Save model
        self.save_model()
    
    def save_model(self):
        """Save trained model to disk"""
        with open(self.model_path / "model.pkl", "wb") as f:
            pickle.dump(self.model, f)
        with open(self.model_path / "scaler.pkl", "wb") as f:
            pickle.dump(self.scaler, f)
        print("Model saved")
    
    def load_model(self):
        """Load trained model from disk"""
        try:
            with open(self.model_path / "model.pkl", "rb") as f:
                self.model = pickle.load(f)
            with open(self.model_path / "scaler.pkl", "rb") as f:
                self.scaler = pickle.load(f)
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
            
    def predict(self, input_dict):
        """Mock predict for old endpoint compatibility"""
        # We just return a dummy response since the old form doesn't map to new features well
        return {
            "predicted_winner": "Hamilton (Dummy)",
            "confidence": 0.99,
            "top_3": [("Hamilton (Dummy)", 0.99), ("Verstappen (Dummy)", 0.01), ("Leclerc (Dummy)", 0.0)],
            "probability_distribution": {}
        }
    
    def get_favourites(self, db):
        """Get predictions for the upcoming race based on current active drivers"""
        if self.model is None:
            self.load_model()
            
        active_features = self.data_processor.get_upcoming_race_features(db)
        if not active_features:
            return [{"driver": "No upcoming race data", "confidence": 0}]
            
        # Predict probability of winning (class 1)
        drivers = []
        features_matrix = []
        for d in active_features:
            drivers.append(d["driver"])
            features_matrix.append(d["features"])
            
        X_scaled = self.scaler.transform(features_matrix)
        
        probabilities = self.model.predict_proba(X_scaled)[:, 1] # Probability of class 1 (winner)
        
        # Sort by probability
        top_indices = np.argsort(probabilities)[-3:][::-1]
        
        results = []
        for i in top_indices:
            results.append({
                "driver": drivers[i],
                "confidence": float(probabilities[i])
            })
            
        return results
    
    def get_model_info(self):
        """Get model information"""
        return {
            "model_type": "Random Forest Classifier (Driver Form-based)",
            "n_estimators": 100,
            "max_depth": 10
        }
