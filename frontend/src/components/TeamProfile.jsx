import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { teamsAPI } from "../api/client";
import "./Standings.css";

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
    <div className="standings-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <div style={{ width: '100px', height: '100px', backgroundColor: '#333', borderRadius: '10%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
          🏎️
        </div>
        <div>
          <h2>{profile.name}</h2>
          <p style={{ color: '#888' }}>{profile.nationality} Constructor</p>
        </div>
      </div>

      <div className="standings-layout" style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
        <div className="standings-table-container" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <h3>Wins</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{profile.stats.wins}</div>
        </div>
        <div className="standings-table-container" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <h3>Podiums</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{profile.stats.podiums}</div>
        </div>
        <div className="standings-table-container" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <h3>Total Points</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-color)' }}>{profile.stats.total_points}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Race History</h3>
        <select value={season} onChange={(e) => setSeason(e.target.value)} style={{ padding: '8px', borderRadius: '4px', background: '#333', color: '#fff', border: '1px solid #444' }}>
          <option value="all">All Seasons (2005+)</option>
          {Object.keys(profile.seasons).sort((a,b) => b-a).map(y => (
            <option key={y} value={y}>{y} Season</option>
          ))}
        </select>
      </div>

      <div className="standings-table-container" style={{ marginTop: '10px' }}>
        <table className="standings-table">
          <thead>
            <tr>
              <th>Season</th>
              <th>Race</th>
              <th>Best Finish</th>
              <th>Points Scored</th>
            </tr>
          </thead>
          <tbody>
            {races.length === 0 ? (
              <tr><td colSpan="4">No race history found.</td></tr>
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
