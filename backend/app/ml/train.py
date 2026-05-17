"""
Script to train the F1 prediction model
Run with: python train_model.py from backend directory
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from backend.app.ml.model import F1PredictionModel

if __name__ == "__main__":
    model = F1PredictionModel()
    model.train()
    print("Training complete!")
