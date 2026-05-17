from pydantic import BaseModel
from typing import List, Optional

class Team(BaseModel):
    id: int
    name: str
    driver1: str
    driver2: str
    points: float

class Race(BaseModel):
    id: int
    name: str
    location: str
    date: str
    season: int

class PredictionInput(BaseModel):
    race_id: int
    season: int
    location: str
    weather: Optional[str] = "clear"
    track_type: Optional[str] = "permanent"

class PredictionOutput(BaseModel):
    race_id: int
    predicted_winner: str
    confidence: float
    top_3: List[tuple]
    probability_distribution: dict

class RaceResult(BaseModel):
    race_id: int
    winner: str
    second_place: str
    third_place: str
    pole_position: str
