import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { racesAPI } from "../api/client";
import "./Standings.css";

export default function RaceWeekend() {
  const { raceId } = useParams();
  const [data, setData] = useState(null);
  const [activeSession, setActiveSession] = useState("Race");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRace();
  }, [raceId]);

  const fetchRace = async () => {
    try {
      setLoading(true);
      const res = await racesAPI.getRaceSessions(raceId);
      setData(res.data);
      // Determine default active session (prefer Race, then Qualifying, etc)
      if (res.data.sessions) {
        if (res.data.sessions["Race"]) setActiveSession("Race");
        else if (res.data.sessions["Qualifying"]) setActiveSession("Qualifying");
        else setActiveSession(Object.keys(res.data.sessions)[0]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load race data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading race weekend...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return null;

  const sessionOrder = ["FP1", "FP2", "FP3", "Qualifying", "Sprint", "Race"];
  const availableSessions = sessionOrder.filter(s => data.sessions[s]);

  // Display a note if older than 2023 without practice data
  const isOldWithoutPractice = data.season < 2023;

  return (
    <div className="standings-container">
      <h2>{data.season} {data.race_name}</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>{data.country} • Round {raceId % 100}</p>

      {isOldWithoutPractice && (
        <div style={{ padding: '10px', background: '#332b00', border: '1px solid #cca100', color: '#ffcc00', borderRadius: '4px', marginBottom: '20px' }}>
          <strong>Note:</strong> Practice session data (FP1/FP2/FP3) is only available from 2023 onward.
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {availableSessions.map(s => (
          <button 
            key={s} 
            onClick={() => setActiveSession(s)}
            style={{ 
              padding: '10px 20px', 
              background: activeSession === s ? 'var(--primary-color)' : '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeSession === s ? 'bold' : 'normal'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="standings-table-container">
        {data.sessions[activeSession] && data.sessions[activeSession].length > 0 ? (
          <table className="standings-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                {activeSession === "Race" || activeSession === "Sprint" ? <th>Grid</th> : null}
                {activeSession === "Race" || activeSession === "Sprint" ? <th>Points</th> : null}
                <th>Time/Status</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions[activeSession].map((r, i) => (
                <tr key={i}>
                  <td>{r.position || '-'}</td>
                  <td><Link to={`/driver/${r.driver_id}`} style={{color: 'inherit'}}>{r.driver_name}</Link></td>
                  <td><Link to={`/team/${r.team_name}`} style={{color: 'inherit'}}>{r.team_name}</Link></td>
                  {activeSession === "Race" || activeSession === "Sprint" ? <td>{r.grid || '-'}</td> : null}
                  {activeSession === "Race" || activeSession === "Sprint" ? <td>{r.points}</td> : null}
                  <td>{r.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data available for this session.</p>
        )}
      </div>
    </div>
  );
}
