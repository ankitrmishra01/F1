import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recordsAPI, seasonsAPI } from "../api/client";
import "./GridTable.css";

export default function AllTimeRecords() {
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
      setError("Failed to load records");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading F1 history...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data || !champions) return null;

  const renderTable = (title, items, col1, col2) => (
    <div className="grid-section" style={{ flex: 1, minWidth: '280px' }}>
      <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', margin: 0 }}>{title}</h3>
      <table className="grid-table">
        <thead>
          <tr><th>{col1}</th><th style={{textAlign:'right'}}>{col2}</th></tr>
        </thead>
        <tbody>
          {items.map((d, i) => (
            <tr key={i} className={i < 3 ? "podium" : ""}>
              <td>{d.name}</td>
              <td style={{textAlign:'right', fontWeight: 700}}>{d.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="grid-container">
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>All-Time Records</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Every champion since 1950 and all-time leaderboards.</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {renderTable("Most Championships (Drivers)", data.championships.drivers, "Driver", "Titles")}
        {renderTable("Most Championships (Constructors)", data.championships.constructors, "Team", "Titles")}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {renderTable("Most Race Wins", data.wins.drivers, "Driver", "Wins")}
        {renderTable("Most Pole Positions", data.poles, "Driver", "Poles")}
        {renderTable("Most Podiums", data.podiums, "Driver", "Podiums")}
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '16px' }}>Historical Champions By Season</h2>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="grid-section" style={{ flex: 1, minWidth: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', margin: 0, position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Drivers' Champions</h3>
          <table className="grid-table">
            <thead><tr><th>Season</th><th>Champion</th></tr></thead>
            <tbody>
              {champions.drivers.map((c, i) => (
                <tr key={i}><td style={{fontWeight: 600}}>{c.season}</td><td>{c.champion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid-section" style={{ flex: 1, minWidth: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <h3 style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', margin: 0, position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>Constructors' Champions</h3>
          <table className="grid-table">
            <thead><tr><th>Season</th><th>Champion</th></tr></thead>
            <tbody>
              {champions.constructors.map((c, i) => (
                <tr key={i}><td style={{fontWeight: 600}}>{c.season}</td><td>{c.champion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
