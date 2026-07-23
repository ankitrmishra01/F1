import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { racesAPI } from "../api/client";
import "./RaceCalendar.css";

export default function RaceCalendar() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(new Date().getFullYear()); // Default to current year

  useEffect(() => {
    fetchRaces();
  }, [season]);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await racesAPI.getAllRaces(season);
      setRaces(response.data);
    } catch (err) {
      setError("Failed to load races");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="race-calendar">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>📅 Race Calendar</h2>
        <select 
          value={season} 
          onChange={(e) => setSeason(e.target.value)}
          style={{ padding: '8px', background: '#333', color: '#fff', border: '1px solid #555' }}
        >
          {Array.from({length: new Date().getFullYear() - 2004}, (_, i) => 2005 + i).reverse().map(y => (
            <option key={y} value={y}>{y} Season</option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <div className="race-calendar loading">🔄 Loading races...</div>
      ) : error ? (
        <div className="race-calendar error">{error}</div>
      ) : (
        <div className="races-grid">
          {races.map((race) => (
            <Link to={`/race/${race.race_id}`} key={race.race_id} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="race-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.02)' } }}>
                <div className="race-header">
                  <h3>{race.race_name}</h3>
                  <span className="season">Round {race.round}</span>
                </div>
                <div className="race-details">
                  <p>
                    <strong>🌍 Country:</strong> {race.country}
                  </p>
                  <p>
                    <strong>📅 Date:</strong>{" "}
                    {new Date(race.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>🏁 Circuit:</strong> {race.circuit_name}
                  </p>
                  <p>
                    <strong>🛣️ Type:</strong> {race.circuit_type}
                  </p>
                </div>
                <div style={{ marginTop: '15px', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  View Full Results &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
