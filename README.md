# 🏎️ ApexF1 Predictor

> A modern, Machine Learning-powered Formula 1 analytics and race prediction platform.

ApexF1 Predictor is a full-stack web application that uses real-world Formula 1 data from the Jolpica API and OpenF1 API to provide comprehensive historical records and form-based predictions for upcoming races.

![F1 Predictor](https://images.unsplash.com/photo-1541443131876-44b03de101c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

## ✨ Features

- **🏆 All-Time Records:** Explore every Drivers' and Constructors' Champion since 1950.
- **🏁 Race Weekends:** Dive deep into session-by-session results, including Free Practice (FP1/FP2/FP3 for 2023+), Qualifying, Sprints, and Races.
- **🧑‍🚀 Driver & Team Profiles:** View complete career stats, wins, podiums, and race-by-race histories for any driver or constructor.
- **🔮 Form-Based Predictions:** Our scikit-learn Random Forest model predicts the favourites to win the *next* race based on a weighted form analysis:
  - Recent finishing positions and points (last 5 races)
  - Qualifying performance (grid position)
  - Team development trends (improving vs declining over last 3 races)
  - Sprint performance
  - Circuit-type suitability (street vs permanent)

## 🛠️ Tech Stack

- **Frontend:** React + Vite, React Router DOM, Vanilla CSS Modules
- **Backend:** FastAPI (Python)
- **Database:** SQLite (SQLAlchemy ORM)
- **Machine Learning:** scikit-learn (Random Forest Classifier), Pandas, Numpy
- **Data Sources:** [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/) & [OpenF1 API](https://openf1.org/)

## 🚀 Quick Start (Local Development)

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Setup Backend & Database
The backend requires a local SQLite database (`f1.db`) populated with historical data.

```bash
cd backend
python -m venv venv
source venv/Scripts/activate # Windows
pip install -r requirements.txt

# Sync historical data (this will take a few minutes the first time!)
python app/ml/data_sync.py --all

# Train the ML model on the synced data
python train_model.py

# Start the FastAPI server
uvicorn app.main:app --reload
```
*API will run at http://localhost:8000*

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
*App will run at http://localhost:5173*

## ☁️ Deployment

### Vercel (Frontend)
Deploy the `frontend/` directory to Vercel. Be sure to set the environment variable:
`VITE_API_URL=https://your-render-backend-url.onrender.com`

### Render (Backend)
Deploy the `backend/` directory as a Web Service on Render. 

**Important for Free Tier:** Render's free tier uses ephemeral storage, meaning your `f1.db` will be wiped on every restart. You should commit your locally built `f1.db` to git, or run the sync during the build process.
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Admin Sync Endpoint
You can trigger a fast, non-blocking sync of the *current* season to keep data fresh without a full rebuild:
`POST /api/admin/sync-latest`
(Hook this up to a cron job after race weekends!)

---
*Built by [ankitrmishra01](https://github.com/ankitrmishra01)*
