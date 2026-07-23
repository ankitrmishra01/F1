import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Standings from "./components/Standings";
import RaceCalendar from "./components/RaceCalendar";
import DriverProfile from "./components/DriverProfile";
import TeamProfile from "./components/TeamProfile";
import RaceWeekend from "./components/RaceWeekend";
import AllTimeRecords from "./components/AllTimeRecords";
import FavouriteToWin from "./components/FavouriteToWin";
import { healthAPI } from "./api/client";
import "./App.css";

function App() {
  const [apiStatus, setApiStatus] = useState("checking");
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    checkAPIHealth();
  }, []);

  const checkAPIHealth = async () => {
    try {
      await healthAPI.checkHealth();
      setApiStatus("online");
      setError(null);
    } catch (err) {
      setApiStatus("offline");
      setError(
        "Backend API is not responding. Make sure the server is running on http://localhost:8000"
      );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <h1>🏁 F1 Race Winner Predictor</h1>
          </Link>
          <p className="subtitle">ML-Powered Predictions for Formula 1 Races</p>

          <div className="status-bar">
            <span className={`status-indicator ${apiStatus}`}></span>
            <span className="status-text">
              API: {apiStatus === "online" ? "✓ Online" : "✗ Offline"}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={checkAPIHealth}>Retry Connection</button>
        </div>
      )}

      <nav className="navigation">
        <Link
          to="/"
          className={`nav-button ${location.pathname === "/" ? "active" : ""}`}
        >
          🎯 Predictions
        </Link>
        <Link
          to="/standings"
          className={`nav-button ${location.pathname.includes("/standings") || location.pathname.includes("/team") || location.pathname.includes("/driver") ? "active" : ""}`}
        >
          🏆 Standings & Profiles
        </Link>
        <Link
          to="/calendar"
          className={`nav-button ${location.pathname.includes("/calendar") || location.pathname.includes("/race") ? "active" : ""}`}
        >
          📅 Calendar
        </Link>
        <Link
          to="/records"
          className={`nav-button ${location.pathname === "/records" ? "active" : ""}`}
        >
          👑 All-Time Records
        </Link>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<FavouriteToWin />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/calendar" element={<RaceCalendar />} />
          <Route path="/driver/:driverId" element={<DriverProfile />} />
          <Route path="/team/:teamId" element={<TeamProfile />} />
          <Route path="/race/:raceId" element={<RaceWeekend />} />
          <Route path="/records" element={<AllTimeRecords />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>🏎️ F1 Analytics System | Powered by scikit-learn & Jolpica/OpenF1</p>
      </footer>
    </div>
  );
}

export default App;
