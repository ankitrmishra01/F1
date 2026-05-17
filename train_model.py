"""
Train the F1 prediction model
Run from project root: python train_model.py
"""
import sys
from pathlib import Path
from backend.app.ml.model import F1PredictionModel

if __name__ == "__main__":
    print("🏋️ Training F1 Prediction Model...")
    model = F1PredictionModel()
    model.train()
    print("✓ Model trained and saved successfully!")
