import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { teamsAPI, driversAPI } from "../api/client";
import "./GridTable.css";

export default function Standings() {
  const [teamStandings, setTeamStandings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, dRes] = await Promise.all([
        teamsAPI.getStandings(),
        driversAPI.getAllDrivers()
      ]);
      setTeamStandings(tRes.data);
      setDrivers(dRes.data);
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading standings...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="grid-container" style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      
      <div style={{ flex: 1, minWidth: '360px' }}>
        <div className="grid-section">
          <h2 style={{ padding: '1rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>Constructor Standings</h2>
          <table className="grid-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Pos</th>
                <th>Team</th>
                <th style={{ textAlign: 'right' }}>Points</th>
              </tr>
            </thead>
            <tbody>
              {teamStandings.map((team, idx) => (
                <tr key={team.team} className={idx < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 700 }}>{idx + 1}</td>
                  <td>
                    <Link to={`/team/${team.team}`}>{team.team}</Link>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--accent-red)' }}>{team.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '360px' }}>
        <div className="grid-section">
          <h2 style={{ padding: '1rem 1.5rem', margin: 0, borderBottom: '1px solid var(--border-color)' }}>All Drivers</h2>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="grid-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Nationality</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((driver) => (
                  <tr key={driver.driver_id}>
                    <td>
                      <Link to={`/driver/${driver.driver_id}`}>{driver.name}</Link>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{driver.nationality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
