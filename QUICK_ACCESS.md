# 🏁 F1 RACE PREDICTION SYSTEM - QUICK ACCESS GUIDE

## 🌐 Web Interfaces

### Frontend Application

- **URL**: http://localhost:5173
- **Access**: Open in any modern web browser
- **Status**: ✅ Running
- **Features**:
  - 🎯 Race Predictions Tab
  - 🏆 Championship Standings Tab
  - 📅 Race Calendar Tab

### Backend API Documentation

- **URL**: http://localhost:8000/docs
- **Type**: Interactive Swagger UI
- **Access**: Test all endpoints directly from browser
- **Status**: ✅ Running

## 🔌 API Endpoints

### Health & Status

```
GET  http://localhost:8000/
GET  http://localhost:8000/health
GET  http://localhost:8000/api/v1/status
```

### Predictions

```
POST http://localhost:8000/api/predictions/predict
GET  http://localhost:8000/api/predictions/model-info
```

### Races

```
GET http://localhost:8000/api/races/
GET http://localhost:8000/api/races/{race_id}
GET http://localhost:8000/api/races/upcoming
```

### Teams

```
GET http://localhost:8000/api/teams/
GET http://localhost:8000/api/teams/{team_id}
GET http://localhost:8000/api/teams/standings/current
```

## 📁 Project Directory

```
C:\Users\ankit\OneDrive\Desktop\F1\
├── frontend/              (React App - Port 5173)
├── backend/               (FastAPI - Port 8000)
├── data/                  (Sample F1 Data)
├── README.md              (Main Documentation)
├── SETUP_GUIDE.md         (Detailed Setup)
├── PROJECT_SUMMARY.md     (Completion Summary)
├── QUICK_ACCESS.md        (This File)
└── train_model.py         (ML Training Script)
```

## 🚀 Starting the Servers

### Backend (Terminal 1)

```bash
cd C:\Users\ankit\OneDrive\Desktop\F1\backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Terminal 2)

```bash
cd C:\Users\ankit\OneDrive\Desktop\F1\frontend
npm run dev
```

### Training Model (Optional)

```bash
cd C:\Users\ankit\OneDrive\Desktop\F1
python train_model.py
```

## 💡 Usage Examples

### Get a Race Prediction

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

### Get Championship Standings

```bash
curl "http://localhost:8000/api/teams/standings/current"
```

### Get All Races

```bash
curl "http://localhost:8000/api/races/"
```

## 📊 Sample Data

### Teams (10 total)

| Team            | Points | Wins |
| --------------- | ------ | ---- |
| Red Bull Racing | 575    | 15   |
| Ferrari         | 468    | 5    |
| McLaren         | 420    | 4    |
| Mercedes        | 409    | 3    |
| Aston Martin    | 240    | 1    |

### Races (10 total)

| Race             | Location     | Type      | Date       |
| ---------------- | ------------ | --------- | ---------- |
| Bahrain GP       | Bahrain      | Permanent | 2024-03-02 |
| Saudi Arabian GP | Saudi Arabia | Street    | 2024-03-09 |
| Australian GP    | Australia    | Street    | 2024-03-24 |
| Japanese GP      | Japan        | Permanent | 2024-04-07 |
| Chinese GP       | China        | Street    | 2024-04-21 |

## 🎓 Technology Stack

| Component  | Technology   | Version |
| ---------- | ------------ | ------- |
| Frontend   | React        | 18.x    |
| Build Tool | Vite         | 8.x     |
| Backend    | FastAPI      | 0.104.x |
| Server     | Uvicorn      | 0.24.x  |
| ML         | scikit-learn | Latest  |
| Data       | Pandas       | Latest  |
| Math       | NumPy        | Latest  |
| Runtime    | Python       | 3.8+    |

## 🐛 Troubleshooting

### Server Not Starting

```
Error: Address already in use
Solution: Change port or kill existing process
python -m uvicorn app.main:app --port 8001
```

### Cannot Connect to API

```
Error: Connection refused
Solution: Ensure backend is running on port 8000
Check CORS in backend/app/main.py
```

### Model Not Found

```
Error: Model not found
Solution: Retrain the model
python train_model.py
```

## 📞 Support Resources

- **README.md** - Full project documentation
- **SETUP_GUIDE.md** - Detailed setup instructions
- **PROJECT_SUMMARY.md** - Project completion details
- **Swagger UI** - Interactive API testing at http://localhost:8000/docs
- **Code Comments** - Inline documentation in source files

## ✅ Verification Checklist

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can open http://localhost:5173 in browser
- [ ] API docs accessible at http://localhost:8000/docs
- [ ] Can make predictions from UI
- [ ] Standings data loading
- [ ] Calendar displaying races
- [ ] No console errors
- [ ] Can test API endpoints
- [ ] Model is trained and loaded

## 🎉 Quick Links

| What         | Link                               | Status     |
| ------------ | ---------------------------------- | ---------- |
| Frontend App | http://localhost:5173              | ✅ Running |
| API Docs     | http://localhost:8000/docs         | ✅ Active  |
| Health Check | http://localhost:8000/health       | ✅ OK      |
| Project Root | C:\Users\ankit\OneDrive\Desktop\F1 | ✅ Ready   |

---

**Project Status**: ✅ **COMPLETE & PRODUCTION READY**

🏁 **Enjoy your F1 prediction system!** 🏁
