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
        else if (Object.keys(res.data.sessions).length > 0) setActiveSession(Object.keys(res.data.sessions)[0]);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load race data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading race weekend data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return null;

  const sessionOrder = ["FP1", "FP2", "FP3", "Qualifying", "Sprint", "Race"];
  const availableSessions = sessionOrder.filter(s => data.sessions && data.sessions[s]);
  const OPENF1_PRACTICE_START_YEAR = 2023;
  const isOldWithoutPractice = data.season < OPENF1_PRACTICE_START_YEAR;

  return (
    <div className="grid-container">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>{data.race_name}</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {data.country} &middot; {data.season} Season &middot; {data.circuit_name || "Grand Prix Circuit"}
        </p>
      </div>

      {/* Upcoming Race Timetable */}
      {data.is_upcoming ? (
        <div className="grid-section">
          <div style={{ padding: "1rem 1.5rem", borderBottom: "1px solid var(--border-color)", background: "rgba(56, 189, 248, 0.05)" }}>
            <h3 style={{ margin: 0, color: "var(--accent-cyan)", fontSize: "1.2rem", fontWeight: 800 }}>
              ⏳ Upcoming Race Weekend Schedule
            </h3>
            <p style={{ color: "var(--text-secondary)", margin: "4px 0 0 0", fontSize: "0.85rem" }}>
              Official weekend track timetable & session start times.
            </p>
          </div>

          <table className="grid-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Scheduled Date</th>
                <th>Track Time</th>
              </tr>
            </thead>
            <tbody>
              {data.timetable && data.timetable.map((item, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: item.session.includes("Race") ? "var(--accent-cyan)" : "inherit" }}>
                    {item.session}
                  </td>
                  <td>{item.date}</td>
                  <td style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {isOldWithoutPractice && (
            <div style={{ padding: "12px 16px", background: "rgba(245, 158, 11, 0.08)", border: "1px solid rgba(245, 158, 11, 0.2)", color: "var(--accent-gold)", borderRadius: "8px", marginBottom: "20px", fontSize: "0.85rem" }}>
              Practice session telemetry (FP1/FP2/FP3) is supported from {OPENF1_PRACTICE_START_YEAR} onward.
            </div>
          )}

          <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
            {availableSessions.map(s => (
              <button 
                key={s} 
                onClick={() => setActiveSession(s)}
                style={{ 
                  padding: "8px 20px", 
                  background: activeSession === s ? "linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-cyan))" : "var(--bg-card)",
                  color: activeSession === s ? "#040914" : "var(--text-primary)",
                  border: "none",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontWeight: activeSession === s ? "800" : "600",
                  fontSize: "0.85rem",
                  boxShadow: activeSession === s ? "var(--glow-cyan)" : "none"
                }}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="grid-section">
            {data.sessions && data.sessions[activeSession] && data.sessions[activeSession].length > 0 ? (
              <table className="grid-table">
                <thead>
                  <tr>
                    <th style={{ width: "60px" }}>Pos</th>
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
                      <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{r.position || "-"}</td>
                      <td>
                        <Link to={`/driver/${r.driver_id}`} style={{ fontWeight: 600 }}>{r.driver_name}</Link>
                      </td>
                      <td style={{ color: "var(--text-secondary)" }}>{r.team_name}</td>
                      {(activeSession === "Race" || activeSession === "Sprint") && <td>{r.grid || "-"}</td>}
                      {(activeSession === "Race" || activeSession === "Sprint") && <td style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{r.points}</td>}
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{r.status || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                No session telemetry available for this session.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
