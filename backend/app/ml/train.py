from app.ml.model import F1PredictionModel

def main():
    print("Training F1 Prediction Model...")
    model = F1PredictionModel()
    model.train()
    print("Training complete.")

if __name__ == "__main__":
    main()
