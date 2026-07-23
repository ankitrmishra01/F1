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
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchDriver();
    setImageError(false);
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

  if (loading) return <div className="loading">Loading driver profile & telemetry...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!profile) return null;

  const stats = profile.stats || {};
  const seasonKeys = profile.seasons
    ? Object.keys(profile.seasons).sort((a, b) => b - a)
    : [];

  const driverInitials = profile.name ? profile.name.split(' ').map(n=>n[0]).join('') : "F1";

  return (
    <div className="grid-container">
      {/* Driver Header Card */}
      <div 
        style={{ 
          background: 'var(--bg-card)', 
          borderRadius: '16px', 
          padding: '28px', 
          border: '1px solid var(--border-color)', 
          marginBottom: '28px',
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {/* Driver Photo Avatar or Custom F1 Helmet Badge */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          {profile.image && !imageError ? (
            <img
              src={profile.image}
              alt={profile.name}
              onError={() => setImageError(true)}
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '16px',
                objectFit: 'cover',
                background: 'var(--bg-secondary)',
                border: '2px solid var(--accent-cyan)',
                boxShadow: 'var(--glow-cyan)'
              }}
            />
          ) : (
            <div
              style={{
                width: '130px',
                height: '130px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: '2px solid var(--accent-cyan)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--glow-cyan)',
                color: 'var(--accent-cyan)'
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a9 9 0 0 1 9 9v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-7a9 9 0 0 1 9-9z"></path>
                <path d="M7 13h10v3H7z"></path>
              </svg>
              <span style={{ fontSize: '1rem', fontWeight: 900, marginTop: '4px', letterSpacing: '1px' }}>
                {driverInitials}
              </span>
            </div>
          )}

          {profile.number && (
            <span
              style={{
                position: 'absolute',
                bottom: '-6px',
                right: '-6px',
                background: 'linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-blue))',
                color: '#040914',
                fontWeight: 900,
                fontSize: '0.88rem',
                padding: '2px 9px',
                borderRadius: '10px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)'
              }}
            >
              #{profile.number}
            </span>
          )}
        </div>

        {/* Bio Information */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: 0 }}>{profile.name}</h1>
            <span style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-cyan)', padding: '3px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 700 }}>
              {profile.nationality}
            </span>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '12px' }}>
            Born: {profile.date_of_birth || 'N/A'} {profile.age !== 'N/A' ? `(${profile.age} years old)` : ''}
          </p>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '14px' }}>
            {profile.bio}
          </p>

          {profile.url && (
            <a
              href={profile.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Official Wikipedia Profile ↗
            </a>
          )}
        </div>
      </div>

      {/* Driver Statistics Cards */}
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-value">{stats.wins ?? 0}</div>
          <div className="stat-label">Grand Prix Wins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.podiums ?? 0}</div>
          <div className="stat-label">Podiums</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.poles ?? 0}</div>
          <div className="stat-label">Pole Positions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.total_points ?? 0}</div>
          <div className="stat-label">Total Points</div>
        </div>
      </div>

      {/* Race History Table */}
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
          <h3 style={{ margin: 0 }}>Race History</h3>
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
                  No race history found for this selection.
                </td>
              </tr>
            ) : (
              races.map((r, i) => (
                <tr key={i} className={r.position && r.position <= 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 600 }}>{r.season}</td>
                  <td>{r.race_name}</td>
                  <td style={{ fontWeight: 700, color: r.position === 1 ? "var(--accent-emerald)" : "inherit" }}>
                    {r.position ? `P${r.position}` : "-"}
                  </td>
                  <td style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>{r.points}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{r.status || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
