import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Standings from "./components/Standings";
import RaceCalendar from "./components/RaceCalendar";
import DriverProfile from "./components/DriverProfile";
import TeamProfile from "./components/TeamProfile";
import RaceWeekend from "./components/RaceWeekend";
import AllTimeRecords from "./components/AllTimeRecords";
import CarSpecs from "./components/CarSpecs";
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

  const navItems = [
    { path: "/", label: "Home", match: (p) => p === "/" },
    { path: "/standings", label: "Standings", match: (p) => p.includes("/standings") || p.includes("/driver") || p.includes("/team") },
    { path: "/calendar", label: "Schedule", match: (p) => p.includes("/calendar") || p.includes("/race") },
    { path: "/records", label: "Records", match: (p) => p === "/records" },
    { path: "/cars", label: "Car Specs", match: (p) => p === "/cars" },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="topbar-brand">
          <span className="brand-badge">F1</span>
          <span className="logo-text">
            Grid<span className="logo-accent">Form</span>
          </span>
        </Link>
        <div className="topbar-status">
          <span className={`status-dot ${apiStatus}`}></span>
          <span>{apiStatus === "online" ? "LIVE ENGINE" : "OFFLINE"}</span>
        </div>
      </header>

      <nav className="navbar">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-link ${item.match(location.pathname) ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {error && (
        <div className="error-banner">
          <p>{error}</p>
          <button onClick={checkAPIHealth}>Retry</button>
        </div>
      )}

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/standings" element={<Standings />} />
          <Route path="/calendar" element={<RaceCalendar />} />
          <Route path="/driver/:driverId" element={<DriverProfile />} />
          <Route path="/team/:teamId" element={<TeamProfile />} />
          <Route path="/race/:raceId" element={<RaceWeekend />} />
          <Route path="/records" element={<AllTimeRecords />} />
          <Route path="/cars" element={<CarSpecs />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>GridForm Analytics & ML Predictor | Powered by scikit-learn, Jolpica & OpenF1</p>
      </footer>
    </div>
  );
}

export default App;
