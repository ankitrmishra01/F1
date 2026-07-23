from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from app.routes import predictions, races, teams, drivers, records, admin, seasons, news, cars
from app.ml.model import F1PredictionModel

# Initialize FastAPI app
app = FastAPI(
    title="GridForm API",
    description="ML-powered F1 race predictions & analytics",
    version="3.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    os.getenv("FRONTEND_URL", "http://localhost:5173")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predictions.router)
app.include_router(races.router)
app.include_router(teams.router)
app.include_router(drivers.router)
app.include_router(records.router)
app.include_router(admin.router)
app.include_router(seasons.router)
app.include_router(news.router)
app.include_router(cars.router)

# Initialize ML model
model = F1PredictionModel()

@app.on_event("startup")
async def startup():
    """Initialize model on startup"""
    print("Starting GridForm API...")
    if not model.load_model():
        print("Model not found, training new model...")
        model.train()
    print("API ready!")

@app.get("/")
async def root():
    """API health check"""
    return {
        "status": "online",
        "service": "GridForm API",
        "version": "3.0.0",
        "endpoints": {
            "predictions": "/api/predictions",
            "races": "/api/races",
            "teams": "/api/teams",
            "drivers": "/api/drivers",
            "seasons": "/api/seasons",
            "news": "/api/news",
            "cars": "/api/cars",
            "docs": "/docs"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.get("/api/v1/status")
async def api_status():
    """Get API status and model info"""
    return {
        "api_status": "running",
        "model_info": model.get_model_info() if model.model else "Model not loaded"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
