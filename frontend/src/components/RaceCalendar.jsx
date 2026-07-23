import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { racesAPI, seasonsAPI } from "../api/client";
import "./RaceCalendar.css";

export default function RaceCalendar() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(null);
  const [latestSeason, setLatestSeason] = useState(null);

  useEffect(() => {
    seasonsAPI.getLatest().then((res) => {
      const s = res.data.season;
      setLatestSeason(s);
      setSeason(s);
    }).catch(() => {
      const fallback = new Date().getFullYear();
      setLatestSeason(fallback);
      setSeason(fallback);
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

  const DATA_START_YEAR = 2005;
  const seasonOptions = latestSeason
    ? Array.from({ length: latestSeason - DATA_START_YEAR + 1 }, (_, i) => latestSeason - i)
    : [];

  if (!season) return <div className="loading">Loading schedule...</div>;

  return (
    <div className="grid-container">
      <div className="calendar-header">
        <div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Race Schedule & Results</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Circuit details, race dates, completed winners & podium summaries.</p>
        </div>

        <select
          className="season-select"
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
        >
          {seasonOptions.map((y) => (
            <option key={y} value={y}>{y} Season</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="loading">Loading races for {season}...</div>
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
                  <h3>{race.race_name}</h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{race.country}</span>
                </div>
                <span className="round-badge">Round {race.round}</span>
              </div>

              <div className="calendar-card-body">
                <div className="calendar-detail">
                  <span>Date</span>
                  <span>{new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
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
                    <span className="winner-badge">🏆 Race Winner</span>
                    <span className="winner-name">{race.winner || "Completed"}</span>
                    {race.podium && race.podium.length > 0 && (
                      <div className="podium-mini">
                        <span>Podium: {race.podium.join(" • ")}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="upcoming-box">
                    <span>⏳ Upcoming Race</span>
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
