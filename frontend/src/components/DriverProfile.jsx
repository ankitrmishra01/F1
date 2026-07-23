import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { driversAPI } from "../api/client";
import "./GridTable.css";

export default function DriverProfile() {
  const { driverId } = useParams();
  const [profile, setProfile] = useState(null);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState("all");

  useEffect(() => {
    fetchDriver();
  }, [driverId, season]);

  const fetchDriver = async () => {
    try {
      setLoading(true);
      const [profRes, raceRes] = await Promise.all([
        driversAPI.getDriverProfile(driverId),
        driversAPI.getDriverRaces(
          driverId,
          season === "all" ? null : season
        ),
      ]);
      setProfile(profRes.data);
      setRaces(raceRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load driver profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="grid-loading">Loading driver...</div>;
  if (error) return <div className="grid-error">{error}</div>;
  if (!profile) return null;

  const stats = profile.stats || {};
  const seasonKeys = profile.seasons
    ? Object.keys(profile.seasons).sort((a, b) => b - a)
    : [];

  return (
    <div className="grid-container">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "4px" }}>
          {profile.name}
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {profile.nationality}
          {profile.date_of_birth ? ` \u2022 Born: ${profile.date_of_birth}` : ""}
        </p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.wins ?? 0}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.podiums ?? 0}</div>
          <div className="stat-label">Podiums</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.poles ?? 0}</div>
          <div className="stat-label">Poles</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_points ?? 0}</div>
          <div className="stat-label">Total Points</div>
        </div>
      </div>

      <div className="grid-section">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h3 style={{ margin: 0, padding: 0, border: "none" }}>Race History</h3>
          <select
            className="season-select"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          >
            <option value="all">All Seasons</option>
            {seasonKeys.map((y) => (
              <option key={y} value={y}>
                {y} Season
              </option>
            ))}
          </select>
        </div>

        <table className="grid-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Race</th>
              <th>Position</th>
              <th>Points</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {races.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", color: "var(--text-muted)" }}>
                  No race history found.
                </td>
              </tr>
            ) : (
              races.map((r, i) => (
                <tr key={i} className={r.position && r.position <= 3 ? "podium" : ""}>
                  <td>{r.season}</td>
                  <td>{r.race_name}</td>
                  <td>{r.position || "-"}</td>
                  <td>{r.points}</td>
                  <td>{r.status || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
