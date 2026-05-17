import React, { useState, useEffect } from "react";
import { racesAPI } from "../api/client";
import "./RaceCalendar.css";

export default function RaceCalendar() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await racesAPI.getAllRaces();
      setRaces(response.data);
    } catch (err) {
      setError("Failed to load races");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="race-calendar loading">🔄 Loading races...</div>;
  }

  if (error) {
    return <div className="race-calendar error">{error}</div>;
  }

  return (
    <div className="race-calendar">
      <h2>📅 Race Calendar</h2>
      <div className="races-grid">
        {races.map((race) => (
          <div key={race.race_id} className="race-card">
            <div className="race-header">
              <h3>{race.race_name}</h3>
              <span className="season">Season {race.season}</span>
            </div>
            <div className="race-details">
              <p>
                <strong>📍 Location:</strong> {race.location}
              </p>
              <p>
                <strong>🌍 Country:</strong> {race.country}
              </p>
              <p>
                <strong>📅 Date:</strong>{" "}
                {new Date(race.date).toLocaleDateString()}
              </p>
              <p>
                <strong>🏁 Circuit:</strong> {race.location}
              </p>
              <p>
                <strong>🛣️ Type:</strong> {race.circuit_type}
              </p>
              <p>
                <strong>🔄 Laps:</strong> {race.total_laps}
              </p>
              <p>
                <strong>📏 Distance/Lap:</strong> {race.lap_distance} km
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
