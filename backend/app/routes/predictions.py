from fastapi import APIRouter, HTTPException
from app.schemas import PredictionInput, PredictionOutput, Team, Race
from app.ml.model import F1PredictionModel
from app.ml.data_processor import DataProcessor

router = APIRouter(prefix="/api/predictions", tags=["predictions"])
model = F1PredictionModel()
data_processor = DataProcessor()

@router.post("/predict", response_model=PredictionOutput)
async def predict_race_winner(prediction_input: PredictionInput):
    """Predict the winner of an F1 race"""
    try:
        result = model.predict(
            race_id=prediction_input.race_id,
            season=prediction_input.season,
            location=prediction_input.location,
            weather=prediction_input.weather,
            track_type=prediction_input.track_type
        )
        
        return PredictionOutput(
            race_id=prediction_input.race_id,
            predicted_winner=result["predicted_winner"],
            confidence=result["confidence"],
            top_3=result["top_3"],
            probability_distribution=result["probability_distribution"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
async def get_model_info():
    """Get information about the prediction model"""
    return model.get_model_info()
