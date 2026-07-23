# 🏎️ GridForm — Formula 1 Analytics & Race Predictor

> **GridForm** is a modern, high-performance Formula 1 analytics and machine learning prediction platform styled after official F1 broadcasts and formula1.com. Powered by real-world data from the Jolpica and OpenF1 APIs, GridForm delivers dynamic race predictions, live RSS news feeds, complete historical records, and season-by-season driver and constructor telemetry.

---

## ✨ Features

- 🎯 **ML Winner Predictions:** Form-based Random Forest classifier evaluating driver & constructor performance over rolling 5-race windows (finishing position, qualifying grid, sprint pace, team trends, circuit fit).
- 📰 **Live F1 News:** Integrated real-time RSS news feed from Autosport featuring headlines, images, and descriptions.
- 🏆 **Dynamic Season & Standings:** Single source-of-truth backend endpoint (`GET /api/seasons/latest`) ensuring the UI dynamically resolves current seasons without hardcoded year logic.
- 📅 **Race Schedule & Weekends:** Session-by-session breakdowns for FP1, FP2, FP3, Qualifying, Sprint, and Race sessions.
- 🏎️ **Driver & Team Profiles:** Complete historical career statistics, wins, podiums, poles, total points, and per-season race logs.
- 👑 **All-Time Records:** Historical champions since 1950 and all-time leaderboards for wins, poles, podiums, and titles.
- 🎨 **Formula 1 Inspired Aesthetic:** Deep dark mode UI (`#15151e`), high-contrast typography, and racing red (`#e10600`) broadcast accents.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, React Router 6, Plain CSS Design System (Zero UI frameworks)
- **Backend:** FastAPI, Python 3.10+, SQLAlchemy ORM, SQLite (`f1.db`)
- **Machine Learning:** scikit-learn (RandomForestClassifier, StandardScaler)
- **Data Pipeline:** Jolpica Ergast API, OpenF1 API, Autosport RSS

---

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
# source venv/bin/activate    # On Linux/macOS

pip install -r requirements.txt
python app/ml/data_sync.py --latest  # Populate current season data
python train_model.py                 # Train ML prediction model
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/seasons/latest` | Returns max season present in DB (Dynamic Season Source of Truth) |
| `GET` | `/api/news/` | Returns 12 latest live F1 news articles |
| `GET` | `/api/predictions/favourite` | ML predictions & win probabilities for upcoming race |
| `GET` | `/api/races/?season=YYYY` | List races for a season |
| `GET` | `/api/races/{id}/sessions` | Complete session results for a race weekend |
| `GET` | `/api/teams/standings/current` | Current constructor standings |
| `GET` | `/api/drivers/` | List all drivers |
| `GET` | `/api/drivers/{id}` | Driver profile & statistics |
| `GET` | `/api/records/champions` | All-time historical champions since 1950 |

---

## 🔒 Production & Cold-Start Design

To eliminate cold-start lag on Render free-tier deployments:
1. `f1.db` is pre-populated and committed to the repository.
2. Render start command boots uvicorn directly without running full data syncs on startup:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Scheduled cron syncs invoke `POST /api/admin/sync-latest` to update current season data out-of-band.
