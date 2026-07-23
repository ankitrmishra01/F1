import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { racesAPI } from "../api/client";
import "./GridTable.css";

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
  const OPENF1_PRACTICE_START_YEAR = 2023;
  const isOldWithoutPractice = data.season < OPENF1_PRACTICE_START_YEAR;

  return (
    <div className="grid-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{data.race_name}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{data.country} &middot; {data.season} Season &middot; Round {raceId % 100}</p>
      </div>

      {isOldWithoutPractice && (
        <div style={{ padding: '12px 16px', background: 'rgba(255, 193, 7, 0.08)', border: '1px solid rgba(255, 193, 7, 0.2)', color: 'var(--accent-gold)', borderRadius: '6px', marginBottom: '20px', fontSize: '0.85rem' }}>
          Practice session data (FP1/FP2/FP3) is only available from {OPENF1_PRACTICE_START_YEAR} onward.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {availableSessions.map(s => (
          <button 
            key={s} 
            onClick={() => setActiveSession(s)}
            style={{ 
              padding: '8px 20px', 
              background: activeSession === s ? 'var(--accent-red)' : 'var(--bg-card)',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: activeSession === s ? '700' : '500',
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.2s ease'
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid-section">
        {data.sessions[activeSession] && data.sessions[activeSession].length > 0 ? (
          <table className="grid-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                {(activeSession === "Race" || activeSession === "Sprint") && <th>Grid</th>}
                {(activeSession === "Race" || activeSession === "Sprint") && <th>Points</th>}
                <th>Time/Status</th>
              </tr>
            </thead>
            <tbody>
              {data.sessions[activeSession].map((r, i) => (
                <tr key={i} className={i < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 700 }}>{r.position || '-'}</td>
                  <td><Link to={`/driver/${r.driver_id}`}>{r.driver_name}</Link></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.team_name}</td>
                  {(activeSession === "Race" || activeSession === "Sprint") && <td>{r.grid || '-'}</td>}
                  {(activeSession === "Race" || activeSession === "Sprint") && <td>{r.points}</td>}
                  <td style={{ color: 'var(--text-muted)' }}>{r.status || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No data available for this session.</p>
        )}
      </div>
    </div>
  );
}
