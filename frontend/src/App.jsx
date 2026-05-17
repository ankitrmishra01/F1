import { useState, useEffect } from "react";
import PredictionForm from "./components/PredictionForm";
import Standings from "./components/Standings";
import RaceCalendar from "./components/RaceCalendar";
import { healthAPI } from "./api/client";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState("predictions");
  const [apiStatus, setApiStatus] = useState("checking");
  const [error, setError] = useState(null);

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
        "Backend API is not responding. Make sure the server is running on http://localhost:8000",
      );
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🏁 F1 Race Winner Predictor</h1>
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
        <button
          className={`nav-button ${
            activeTab === "predictions" ? "active" : ""
          }`}
          onClick={() => setActiveTab("predictions")}
        >
          🎯 Predictions
        </button>

        <button
          className={`nav-button ${activeTab === "standings" ? "active" : ""}`}
          onClick={() => setActiveTab("standings")}
        >
          🏆 Standings
        </button>

        <button
          className={`nav-button ${activeTab === "calendar" ? "active" : ""}`}
          onClick={() => setActiveTab("calendar")}
        >
          📅 Calendar
        </button>
      </nav>

      <main className="main-content">
        {activeTab === "predictions" && (
          <div className="tab-content">
            <PredictionForm />
          </div>
        )}

        {activeTab === "standings" && (
          <div className="tab-content">
            <Standings />
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="tab-content">
            <RaceCalendar />
          </div>
        )}
      </main>

      <footer className="footer">
        <p>🏎️ F1 Race Prediction System v1.0 | Powered by Machine Learning</p>
        <p>Built with React • FastAPI • scikit-learn</p>
      </footer>
    </div>
  );
}

export default App;
