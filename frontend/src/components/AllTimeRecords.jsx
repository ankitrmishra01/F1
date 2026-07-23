import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { recordsAPI } from "../api/client";
import "./Standings.css"; // Reuse table styling

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

  return (
    <div className="standings-container">
      <h2>👑 All-Time F1 Records</h2>
      <p style={{ color: '#888', marginBottom: '20px' }}>Every champion since 1950 & all-time leaderboards.</p>

      <div className="standings-layout" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div className="standings-table-container" style={{ flex: 1, minWidth: '300px' }}>
          <h3>Most Championships (Drivers)</h3>
          <table className="standings-table">
            <thead>
              <tr><th>Driver</th><th>Titles</th></tr>
            </thead>
            <tbody>
              {data.championships.drivers.map((d, i) => (
                <tr key={i}><td>{d.name}</td><td>{d.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="standings-table-container" style={{ flex: 1, minWidth: '300px' }}>
          <h3>Most Championships (Constructors)</h3>
          <table className="standings-table">
            <thead>
              <tr><th>Team</th><th>Titles</th></tr>
            </thead>
            <tbody>
              {data.championships.constructors.map((t, i) => (
                <tr key={i}><td>{t.name}</td><td>{t.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="standings-layout" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
        
        <div className="standings-table-container" style={{ flex: 1, minWidth: '200px' }}>
          <h3>Most Race Wins</h3>
          <table className="standings-table">
            <thead>
              <tr><th>Driver</th><th>Wins</th></tr>
            </thead>
            <tbody>
              {data.wins.drivers.map((d, i) => (
                <tr key={i}><td>{d.name}</td><td>{d.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="standings-table-container" style={{ flex: 1, minWidth: '200px' }}>
          <h3>Most Pole Positions</h3>
          <table className="standings-table">
            <thead>
              <tr><th>Driver</th><th>Poles</th></tr>
            </thead>
            <tbody>
              {data.poles.map((d, i) => (
                <tr key={i}><td>{d.name}</td><td>{d.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="standings-table-container" style={{ flex: 1, minWidth: '200px' }}>
          <h3>Most Podiums</h3>
          <table className="standings-table">
            <thead>
              <tr><th>Driver</th><th>Podiums</th></tr>
            </thead>
            <tbody>
              {data.podiums.map((d, i) => (
                <tr key={i}><td>{d.name}</td><td>{d.total}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <h3 style={{ marginTop: '40px' }}>Historical Champions By Season</h3>
      <div className="standings-layout" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        <div className="standings-table-container" style={{ flex: 1, minWidth: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <h4>Drivers' Champions</h4>
          <table className="standings-table">
            <thead>
              <tr><th>Season</th><th>Champion</th></tr>
            </thead>
            <tbody>
              {champions.drivers.map((c, i) => (
                <tr key={i}><td>{c.season}</td><td>{c.champion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="standings-table-container" style={{ flex: 1, minWidth: '300px', maxHeight: '500px', overflowY: 'auto' }}>
          <h4>Constructors' Champions</h4>
          <table className="standings-table">
            <thead>
              <tr><th>Season</th><th>Champion</th></tr>
            </thead>
            <tbody>
              {champions.constructors.map((c, i) => (
                <tr key={i}><td>{c.season}</td><td>{c.champion}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
