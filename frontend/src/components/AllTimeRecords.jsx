import { useState, useEffect } from "react";
import { recordsAPI } from "../api/client";
import "./GridTable.css";

export default function AllTimeRecords() {
  const [activeCategory, setActiveCategory] = useState("wins");
  const [data, setData] = useState(null);
  const [champions, setChampions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [allTimeRes, champsRes] = await Promise.all([
        recordsAPI.getAllTime(),
        recordsAPI.getChampions()
      ]);
      setData(allTimeRes.data);
      setChampions(champsRes.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load all-time records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading official all-time F1 records (1950–Present)...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data || !champions) return null;

  const categories = [
    { id: "wins", label: "🥇 Most Race Wins" },
    { id: "poles", label: "⚡ Most Pole Positions" },
    { id: "podiums", label: "🪜 Most Podiums" },
    { id: "driver_champs", label: "🏆 Drivers' Champions" },
    { id: "constructor_champs", label: "🏎️ Constructors' Champions" },
    { id: "historical_champs", label: "📜 Champions by Season" }
  ];

  return (
    <div className="grid-container">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 800 }}>Official All-Time F1 Records</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          All-time statistical leaderboards and world championship winners since 1950.
        </p>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              background: activeCategory === cat.id ? "linear-gradient(135deg, var(--accent-cyan-bright), var(--accent-cyan))" : "var(--bg-card)",
              color: activeCategory === cat.id ? "#040914" : "var(--text-primary)",
              fontWeight: activeCategory === cat.id ? 800 : 600,
              boxShadow: activeCategory === cat.id ? "var(--glow-cyan)" : "none"
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Wins Tab */}
      {activeCategory === "wins" && (
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div className="grid-section" style={{ flex: 1, minWidth: "320px" }}>
            <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
              Most Race Wins (Drivers)
            </h2>
            <table className="grid-table">
              <thead>
                <tr><th style={{ width: "60px" }}>Rank</th><th>Driver</th><th style={{ textAlign: "right" }}>Wins</th></tr>
              </thead>
              <tbody>
                {data.wins.drivers.map((d, i) => (
                  <tr key={i} className={i < 3 ? "podium" : ""}>
                    <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{d.name}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{d.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid-section" style={{ flex: 1, minWidth: "320px" }}>
            <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
              Most Race Wins (Constructors)
            </h2>
            <table className="grid-table">
              <thead>
                <tr><th style={{ width: "60px" }}>Rank</th><th>Team</th><th style={{ textAlign: "right" }}>Wins</th></tr>
              </thead>
              <tbody>
                {data.wins.constructors.map((t, i) => (
                  <tr key={i} className={i < 3 ? "podium" : ""}>
                    <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Poles Tab */}
      {activeCategory === "poles" && (
        <div className="grid-section">
          <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
            Most Pole Positions (All-Time)
          </h2>
          <table className="grid-table">
            <thead>
              <tr><th style={{ width: "60px" }}>Rank</th><th>Driver</th><th style={{ textAlign: "right" }}>Poles</th></tr>
            </thead>
            <tbody>
              {data.poles.map((d, i) => (
                <tr key={i} className={i < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Podiums Tab */}
      {activeCategory === "podiums" && (
        <div className="grid-section">
          <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
            Most Podiums (All-Time)
          </h2>
          <table className="grid-table">
            <thead>
              <tr><th style={{ width: "60px" }}>Rank</th><th>Driver</th><th style={{ textAlign: "right" }}>Podiums</th></tr>
            </thead>
            <tbody>
              {data.podiums.map((d, i) => (
                <tr key={i} className={i < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Driver Champions Tab */}
      {activeCategory === "driver_champs" && (
        <div className="grid-section">
          <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
            Most Drivers' World Championships
          </h2>
          <table className="grid-table">
            <thead>
              <tr><th style={{ width: "60px" }}>Rank</th><th>Driver</th><th style={{ textAlign: "right" }}>Titles</th></tr>
            </thead>
            <tbody>
              {data.championships.drivers.map((d, i) => (
                <tr key={i} className={i < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{d.name}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{d.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Constructor Champions Tab */}
      {activeCategory === "constructor_champs" && (
        <div className="grid-section">
          <h2 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)" }}>
            Most Constructors' World Championships
          </h2>
          <table className="grid-table">
            <thead>
              <tr><th style={{ width: "60px" }}>Rank</th><th>Team</th><th style={{ textAlign: "right" }}>Titles</th></tr>
            </thead>
            <tbody>
              {data.championships.constructors.map((t, i) => (
                <tr key={i} className={i < 3 ? "podium" : ""}>
                  <td style={{ fontWeight: 800, color: i < 3 ? "var(--accent-cyan)" : "var(--text-primary)" }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-cyan)" }}>{t.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Historical Champions by Season */}
      {activeCategory === "historical_champs" && (
        <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
          <div className="grid-section" style={{ flex: 1, minWidth: "320px", maxHeight: "600px", overflowY: "auto" }}>
            <h3 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)", position: "sticky", top: 0, background: "var(--bg-card)" }}>
              Drivers' Champions By Season
            </h3>
            <table className="grid-table">
              <thead><tr><th>Season</th><th>Champion</th></tr></thead>
              <tbody>
                {champions.drivers.map((c, i) => (
                  <tr key={i}><td style={{ fontWeight: 700 }}>{c.season}</td><td>{c.champion}</td></tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid-section" style={{ flex: 1, minWidth: "320px", maxHeight: "600px", overflowY: "auto" }}>
            <h3 style={{ padding: "1rem 1.5rem", margin: 0, borderBottom: "1px solid var(--border-color)", position: "sticky", top: 0, background: "var(--bg-card)" }}>
              Constructors' Champions By Season
            </h3>
            <table className="grid-table">
              <thead><tr><th>Season</th><th>Champion</th></tr></thead>
              <tbody>
                {champions.constructors.map((c, i) => (
                  <tr key={i}><td style={{ fontWeight: 700 }}>{c.season}</td><td>{c.champion}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
