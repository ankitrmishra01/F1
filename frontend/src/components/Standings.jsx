import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { teamsAPI, driversAPI } from "../api/client";
import "./Standings.css";

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

  if (loading) return <div className="standings loading">🔄 Loading...</div>;
  if (error) return <div className="standings error">{error}</div>;

  return (
    <div className="standings" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>🏆 Current Team Standings</h2>
        <div className="standings-table">
          <div className="standings-header">
            <div className="col-pos">Pos</div>
            <div className="col-team">Team</div>
            <div className="col-points">Points</div>
          </div>
          {teamStandings.map((team, idx) => (
            <div
              key={team.team}
              className={`standings-row ${idx < 3 ? "podium" : ""}`}
            >
              <div className="col-pos">{idx + 1}</div>
              <div className="col-team">
                <Link to={`/team/${team.team}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {team.team}
                </Link>
              </div>
              <div className="col-points">{team.points}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2>🏎️ All Drivers (2005+)</h2>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <div className="standings-table">
            <div className="standings-header">
              <div className="col-team">Driver Name</div>
              <div className="col-points">Nationality</div>
            </div>
            {drivers.map((driver) => (
              <div key={driver.driver_id} className="standings-row">
                <div className="col-team">
                  <Link to={`/driver/${driver.driver_id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {driver.name}
                  </Link>
                </div>
                <div className="col-points">{driver.nationality}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
