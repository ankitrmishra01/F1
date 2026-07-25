import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { racesAPI, seasonsAPI } from "../api/client";
import "./RaceCalendar.css";

export default function RaceCalendar() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(2026);
  const [latestSeason, setLatestSeason] = useState(2026);

  useEffect(() => {
    seasonsAPI.getLatest().then((res) => {
      const s = res.data.season || 2026;
      setLatestSeason(s);
      setSeason(s);
    }).catch(() => {
      setLatestSeason(2026);
      setSeason(2026);
    });
  }, []);

  useEffect(() => {
    if (season) fetchRaces();
  }, [season]);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await racesAPI.getAllRaces(season);
      setRaces(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load races");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Full Historical Schedule Options: 2005 to Latest Season (2026)
  const DATA_START_YEAR = 2005;
  const seasonOptions = latestSeason
    ? Array.from({ length: latestSeason - DATA_START_YEAR + 1 }, (_, i) => latestSeason - i)
    : [2026, 2025, 2024];

  return (
    <div className="grid-container">
      <div className="calendar-header">
        <div>
          <span className="petronas-badge">📅 F1 CALENDAR TELEMETRY & LIVE SESSIONS</span>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 900, marginTop: "4px" }}>Race Schedule & Live Sessions</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem" }}>
            Explore full historical schedules (2005–2026), real Grand Prix winners, official podiums, and live practice session breakdowns.
          </p>
        </div>

        <select
          className="season-select"
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
        >
          {seasonOptions.map((y) => (
            <option key={y} value={y}>{y} Season Schedule</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading race schedule & session telemetry...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : races.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          No races found for {season} season.
        </div>
      ) : (
        <div className="calendar-grid">
          {races.map((race) => (
            <Link to={`/race/${race.race_id}`} key={race.race_id} className="calendar-card">
              <div className="calendar-card-header">
                <div>
                  <h3 className="race-card-title">{race.race_name}</h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: 700 }}>{race.country}</span>
                </div>
                <span className="round-badge">Round {race.round}</span>
              </div>

              <div className="calendar-card-body">
                <div className="calendar-detail">
                  <span>Date</span>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                    {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
                <div className="calendar-detail">
                  <span>Circuit</span>
                  <span>{race.circuit_name}</span>
                </div>
                <div className="calendar-detail">
                  <span>Type</span>
                  <span style={{ textTransform: "capitalize" }}>{race.circuit_type}</span>
                </div>

                {race.is_completed ? (
                  <div className="winner-box">
                    <span className="winner-badge">🏆 REAL RACE WINNER</span>
                    <span className="winner-name">{race.winner || "Completed"}</span>
                    {race.podium && race.podium.length > 0 && (
                      <div className="podium-mini">
                        <span>Podium: {race.podium.join(" • ")}</span>
                      </div>
                    )}
                  </div>
                ) : race.session_status ? (
                  <div className="session-status-box">
                    <span className="session-header-tag">🔴 LIVE WEEKEND TELEMETRY STATUS</span>
                    <div className="session-chip green">🟢 FP1: {race.session_status.fp1}</div>
                    <div className="session-chip green">🟢 FP2: {race.session_status.fp2}</div>
                    <div className="session-chip yellow">🟡 FP3: {race.session_status.fp3}</div>
                    <div className="session-chip cyan">⏱️ Quali: {race.session_status.quali}</div>
                  </div>
                ) : (
                  <div className="upcoming-box">
                    <span>⏳ Upcoming Race Weekend</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
