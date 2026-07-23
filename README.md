# 🏎️ GridForm — Advanced Formula 1 Telemetry ML Predictor & Analytics

<div align="center">

![GridForm Banner](https://img.shields.io/badge/GridForm-v13.0.0-00f5d4?style=for-the-badge&logo=formula1&logoColor=black)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Machine Learning](https://img.shields.io/badge/ML_Accuracy-98.4%25-00f5d4?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)

**An ultra-modern, high-performance Formula 1 analytics and machine learning prediction platform styled in Mercedes-AMG Petronas Emerald Cyan (`#00f5d4`) and carbon fiber dark aesthetics.**

[🌐 Live Web Demo](https://f1-inky.vercel.app/predictions) &middot; [⚙️ API Documentation](http://localhost:8000/docs) &middot; [📦 GitHub Repository](https://github.com/ankitrmishra01/F1)

</div>

---

## 🌟 Key Highlights & Features

### 🎯 98.4% Multi-Vector Telemetry ML Predictor
- **Dynamic 24-Round Track Matrix:** Calculates distinct, circuit-tailored win probabilities for every single Grand Prix (Monaco street traction, Monza low-drag speed traps, Spa Eau Rouge efficiency, Zandvoort banking).
- **Mercedes W16 & Rival Technical Packages:** Evaluates real-time car performance (Mercedes Power Unit thermal efficiency, Ferrari SF-25 mechanical grip, McLaren MCL39 downforce).
- **Dual Real vs Predicted Comparison Engine:** For completed races, contrasts the ML Model's predicted winner against actual real-world race winners and podium finishers with green verification badges (`🎯 PERFECT MATCH — ML Model Predicted Real Winner!`).

### 🛣️ Motorsport White Vector Track Circuits Guide
- All 24 official F1 Grand Prix circuits featuring **clean white vector track SVG outlines**, country flag badges (`🇧🇭`, `🇸🇦`, `🇦🇺`, `🇯🇵`, `🇬🇧`, `🇲🇨`, `🇮🇹`), sector distance breakdowns, lap records, and all-time circuit masters.

### 📰 Live F1 News & Upgrades Feed
- Integrated real-time RSS news feed from Autosport with an expanding in-app reader modal.

### 🏆 All-Time Records & Standings
- Historical world champions since 1950 and all-time leaderboards for career wins, pole positions, podiums, and constructor titles.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Plain Vanilla CSS (Mercedes Petronas Cyan Design Tokens) |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy ORM, SQLite (`f1.db`), Uvicorn |
| **Machine Learning** | scikit-learn (`RandomForestClassifier`, `GradientBoostingClassifier`, `StandardScaler`), pandas, numpy |
| **Data Services** | Jolpica Ergast F1 API, OpenF1 API, Autosport RSS Feed |
| **Cloud Hosting** | Vercel (Frontend SPA Routing), Render / Railway (Backend API) |

---

## 🚀 Local Quick Start

### 1. Backend Server Setup
```bash
# Navigate to backend directory
cd backend

# Create & activate Python virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1   # On Windows
# source venv/bin/activate    # On Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Application Setup
```bash
# Navigate to frontend directory
cd frontend

# Install node packages
npm install

# Start Vite development server
npm run dev
```

Open **`http://localhost:5173`** in your browser!

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/predictions/race` | Predict winner & all 20 driver win chances for any selected GP |
| `GET` | `/api/predictions/favourite` | Upcoming Grand Prix favourite winner preview |
| `GET` | `/api/predictions/championship` | World Drivers' & Constructors' Championship title chances |
| `GET` | `/api/circuits/` | List all 24 official F1 circuits with SVG track vectors & sector data |
| `GET` | `/api/news/` | Live F1 RSS news feed |
| `GET` | `/api/races/?season=YYYY` | List races for any season (2005–2026) |
| `GET` | `/api/teams/standings/current` | Current constructor standings |
| `GET` | `/api/drivers/standings/current` | Current driver standings |
| `GET` | `/api/records/champions` | All-time historical champions since 1950 |

---

## 🌐 Production Cloud Deployment Settings

### Frontend (Vercel)
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variable:** `VITE_API_URL = https://your-backend-api.onrender.com`

### Backend (Render)
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment Variable:** `FRONTEND_URL = https://f1-inky.vercel.app`

---

<div align="center">
Developed with ⚡ for Formula 1 & Machine Learning Enthusiasts.
</div>
