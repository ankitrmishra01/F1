# F1 Race Winner Prediction System

A full-stack machine learning application that predicts Formula 1 race winners based on latest updates, historical data, and team performance.

## 🎯 Features

- **🏆 Race Winner Predictions** - ML-powered predictions for upcoming F1 races
- **📊 Championship Standings** - Real-time team standings and points
- **📅 Race Calendar** - Complete race schedule with circuit details
- **🎨 Modern UI** - Beautiful responsive interface with real-time updates
- **🤖 ML Model** - scikit-learn Random Forest classifier trained on historical F1 data
- **⚡ REST API** - FastAPI backend with comprehensive endpoints
- **🔄 Real-time Data** - Live team statistics and race information

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

#### 1. Clone/Extract the Project

```bash
cd F1
```

#### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Train the ML model (if not already trained)
cd ..
python train_model.py

# Start the FastAPI server
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be running at `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd frontend

# Install Node dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be running at `http://localhost:5173`

## 📁 Project Structure

```
F1/
├── frontend/                    # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js       # API client with axios
│   │   ├── components/
│   │   │   ├── PredictionForm.jsx    # Race prediction component
│   │   │   ├── Standings.jsx         # Championship standings
│   │   │   └── RaceCalendar.jsx      # Race schedule
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.local              # Environment variables
│
├── backend/                     # FastAPI application
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   ├── schemas.py          # Pydantic data models
│   │   ├── routes/
│   │   │   ├── predictions.py  # Prediction endpoints
│   │   │   ├── races.py        # Race data endpoints
│   │   │   └── teams.py        # Team data endpoints
│   │   └── ml/
│   │       ├── model.py        # ML model (Random Forest)
│   │       ├── data_processor.py
│   │       ├── train.py        # Training script
│   │       └── models/         # Trained model files
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Environment variables
│
├── data/                        # Sample F1 data
│   ├── teams.csv               # 10 F1 teams with stats
│   ├── races.csv               # 10 sample races
│   └── historical_results.csv  # Historical race results
│
├── train_model.py              # Model training script
└── README.md                   # This file
```

## 🔌 API Endpoints

### Health & Status

- `GET /` - API status and endpoints
- `GET /health` - Health check
- `GET /api/v1/status` - Detailed API status with model info

### Predictions

- `POST /api/predictions/predict` - Get race winner prediction
  ```json
  {
    "race_id": 1,
    "season": 2024,
    "location": "Bahrain International Circuit",
    "weather": "clear",
    "track_type": "permanent"
  }
  ```
- `GET /api/predictions/model-info` - Get ML model information

### Races

- `GET /api/races/` - Get all races
- `GET /api/races/{race_id}` - Get specific race
- `GET /api/races/upcoming` - Get upcoming races

### Teams

- `GET /api/teams/` - Get all teams
- `GET /api/teams/{team_id}` - Get specific team
- `GET /api/teams/standings/current` - Get championship standings

## 🤖 Machine Learning Model

### Model Type

- **Algorithm**: Random Forest Classifier
- **Training Data**: 10 historical races with 4 features per race
- **Features**:
  - Team points (normalized)
  - Circuit information (country name length)
  - Track distance
  - Circuit type (permanent vs street)
  - Historical wins

### Performance

- The model is trained on F1 historical data and provides confidence scores
- Predictions include top 3 contenders with probability distributions
- Can be retrained with new data using `train_model.py`

### Model Files

- `model.pkl` - Trained Random Forest model
- `scaler.pkl` - Feature scaler
- `team_map.pkl` - Team ID to name mapping

## 🎨 Frontend Components

### PredictionForm

- Interactive form to select race and conditions
- Real-time prediction display with confidence scores
- Top 3 contenders visualization
- Probability distribution chart

### Standings

- Championship standings table
- Team colors and badges
- Points and wins display
- Podium highlighting

### RaceCalendar

- Grid view of all races
- Race details (date, location, circuit type)
- Circuit characteristics
- Season information

## 🛠️ Technology Stack

### Frontend

- **React** - UI library
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **CSS3** - Styling with gradients and animations

### Backend

- **FastAPI** - Modern Python web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **scikit-learn** - Machine learning
- **Pandas** - Data processing
- **NumPy** - Numerical computing

## 📊 Sample Data

The project includes sample F1 data from 2024 season:

- **Teams**: Red Bull Racing, Mercedes, Ferrari, McLaren, and 6 others
- **Races**: 10 races across different circuits (permanent and street circuits)
- **Historical Results**: Race outcomes with winner, podium, and pole position data

## 🔧 Configuration

### Backend (.env)

```
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
DEBUG=True
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:8000
```

## 📝 Usage Examples

### 1. Get a Prediction

```bash
curl -X POST "http://localhost:8000/api/predictions/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "race_id": 1,
    "season": 2024,
    "location": "Bahrain International Circuit",
    "weather": "clear",
    "track_type": "permanent"
  }'
```

### 2. Get Championship Standings

```bash
curl "http://localhost:8000/api/teams/standings/current"
```

### 3. Get All Races

```bash
curl "http://localhost:8000/api/races/"
```

## 🚀 Deployment

### Docker Support

Add `Dockerfile` for both frontend and backend for containerized deployment.

### Heroku/Cloud Deployment

1. Ensure `Procfile` is configured for backend
2. Frontend can be built and served as static files
3. Set environment variables on deployment platform

## 🧪 Testing

### Manual Testing

1. Open http://localhost:5173 in browser
2. Navigate through Predictions, Standings, and Calendar tabs
3. Test making predictions with different race and weather conditions
4. Check API responses using curl or Postman

### Automated Testing

Add pytest test cases for backend routes and model functionality.

## 🔮 Future Enhancements

- [ ] Real F1 data integration (via official F1 API)
- [ ] WebSocket for real-time updates during races
- [ ] User authentication and saved predictions
- [ ] Historical prediction accuracy tracking
- [ ] Advanced ML model with more features
- [ ] Mobile app version
- [ ] Prediction explanations (SHAP values)
- [ ] Live race notifications
- [ ] Driver individual predictions

## 📄 License

This project is created for educational and entertainment purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this project!

## 👨‍💻 Developer Notes

- **Model Training**: Update `data/` CSV files and run `python train_model.py`
- **Adding Features**: Update `DataProcessor` and retrain model
- **API Changes**: Modify `app/routes/` and test with curl/Postman
- **UI Changes**: Edit React components in `frontend/src/components/`

## ❓ Troubleshooting

### API Connection Error

- Ensure backend is running: `python -m uvicorn app.main:app --reload`
- Check port 8000 is not in use
- Verify CORS settings in `app/main.py`

### Model Not Found

- Run training script: `python train_model.py`
- Check `backend/app/ml/models/` directory exists

### Frontend Build Issues

- Clear node_modules: `rm -rf node_modules && npm install`
- Clear npm cache: `npm cache clean --force`
- Restart dev server

## 📞 Support

For issues or questions, refer to the documentation or check the API endpoints at `http://localhost:8000/docs`

---

**🏁 Happy Predicting! May the best team win! 🏁**
