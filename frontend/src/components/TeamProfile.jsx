import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { teamsAPI } from "../api/client";
import "./GridTable.css";

export default function TeamProfile() {
  const { teamId } = useParams();
  const [profile, setProfile] = useState(null);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState("all");

  useEffect(() => {
    fetchTeam();
  }, [teamId, season]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const [profRes, raceRes] = await Promise.all([
        teamsAPI.getTeamProfile(teamId),
        teamsAPI.getTeamRaces(teamId, season === "all" ? null : season)
      ]);
      setProfile(profRes.data);
      setRaces(raceRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load team profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading team...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return null;

  return (
    <div className="grid-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{profile.name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{profile.nationality} Constructor</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{profile.stats.wins}</div>
          <div className="stat-label">Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{profile.stats.podiums}</div>
          <div className="stat-label">Podiums</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(profile.stats.total_points)}</div>
          <div className="stat-label">Total Points</div>
        </div>
      </div>

      <div className="grid-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ margin: 0 }}>Race History</h3>
          <select className="season-select" value={season} onChange={(e) => setSeason(e.target.value)}>
            <option value="all">All Seasons</option>
            {Object.keys(profile.seasons).sort((a,b) => b-a).map(y => (
              <option key={y} value={y}>{y} Season</option>
            ))}
          </select>
        </div>
        <table className="grid-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Race</th>
              <th>Best Finish</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {races.length === 0 ? (
              <tr><td colSpan="4" style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No race history found.</td></tr>
            ) : (
              races.map((r, i) => (
                <tr key={i}>
                  <td>{r.season}</td>
                  <td>{r.race_name}</td>
                  <td>{r.best_position || '-'}</td>
                  <td>{r.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
