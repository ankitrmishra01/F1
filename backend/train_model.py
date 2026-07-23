import sys
import os

# Add backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.ml.model import F1PredictionModel

if __name__ == "__main__":
    print("Training F1 Prediction Model...")
    model = F1PredictionModel()
    model.train()
    print("Done!")
