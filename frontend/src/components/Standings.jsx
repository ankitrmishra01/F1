import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { teamsAPI, driversAPI, seasonsAPI } from "../api/client";
import "./GridTable.css";

const TEAM_COLORS = {
  "red_bull": "#3671C6",
  "ferrari": "#E80020",
  "mclaren": "#FF8000",
  "mercedes": "#27F4D2",
  "aston_martin": "#229971",
  "alpine": "#0093CC",
  "williams": "#64C4FF",
  "rb": "#6692FF",
  "haas": "#B6BABD",
  "audi": "#52E252",
  "sauber": "#52E252"
};

export default function Standings() {
  const [activeTab, setActiveTab] = useState("drivers"); // 'drivers' or 'constructors'
  const [driverStandings, setDriverStandings] = useState([]);
  const [teamStandings, setTeamStandings] = useState([]);
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
    if (season) fetchData();
  }, [season]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dRes, tRes] = await Promise.all([
        driversAPI.getStandings(season),
        teamsAPI.getStandings(season)
      ]);
      setDriverStandings(dRes.data || []);
      setTeamStandings(tRes.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load standings data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const DATA_START_YEAR = 2005;
  const seasonOptions = latestSeason
    ? Array.from({ length: latestSeason - DATA_START_YEAR + 1 }, (_, i) => latestSeason - i)
    : [];

  if (!season) return <div className="loading">Loading standings...</div>;

  return (
    <div className="grid-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Championship Standings</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Official F1 points table by season.</p>
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

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab("drivers")}
          style={{
            background: activeTab === "drivers" ? "linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-cyan))" : "var(--bg-card)",
            color: activeTab === "drivers" ? "#040914" : "var(--text-primary)",
            fontWeight: activeTab === "drivers" ? 800 : 600,
            boxShadow: activeTab === "drivers" ? "var(--glow-cyan)" : "none"
          }}
        >
          🏎️ Driver Standings
        </button>
        <button
          onClick={() => setActiveTab("constructors")}
          style={{
            background: activeTab === "constructors" ? "linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-cyan))" : "var(--bg-card)",
            color: activeTab === "constructors" ? "#040914" : "var(--text-primary)",
            fontWeight: activeTab === "constructors" ? 800 : 600,
            boxShadow: activeTab === "constructors" ? "var(--glow-cyan)" : "none"
          }}
        >
          🏆 Constructor Standings
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading standings for {season}...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : activeTab === "drivers" ? (
        <div className="grid-section">
          <h2 style={{ padding: '1rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
            {season} Driver Championship
          </h2>
          <table className="grid-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Nationality</th>
                <th style={{ textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {driverStandings.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No driver standings found for {season}.</td></tr>
              ) : (
                driverStandings.map((driver, idx) => (
                  <tr key={driver.driver_id} className={idx < 3 ? "podium" : ""}>
                    <td style={{ fontWeight: 800, color: idx < 3 ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {driver.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        <Link to={`/driver/${driver.driver_id}`} style={{ fontWeight: 600 }}>{driver.name}</Link>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{driver.team_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{driver.nationality}</td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-cyan)' }}>{driver.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid-section">
          <h2 style={{ padding: '1rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>
            {season} Constructor Championship
          </h2>
          <table className="grid-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Pos</th>
                <th>Team</th>
                <th style={{ textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {teamStandings.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No constructor standings found for {season}.</td></tr>
              ) : (
                teamStandings.map((team, idx) => (
                  <tr key={team.team} className={idx < 3 ? "podium" : ""}>
                    <td style={{ fontWeight: 800, color: idx < 3 ? 'var(--accent-cyan)' : 'var(--text-primary)' }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%', 
                            backgroundColor: TEAM_COLORS[team.team_id] || 'var(--accent-cyan)',
                            display: 'inline-block' 
                          }}
                        />
                        <Link to={`/team/${team.team_id || team.team}`} style={{ fontWeight: 600 }}>
                          {team.team}
                        </Link>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--accent-cyan)' }}>{team.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
