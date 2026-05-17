import React, { useState, useEffect } from "react";
import { predictionAPI, racesAPI } from "../api/client";
import "./PredictionForm.css";

export default function PredictionForm() {
  const [races, setRaces] = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [weather, setWeather] = useState("clear");
  const [trackType, setTrackType] = useState("permanent");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const response = await racesAPI.getAllRaces();
      setRaces(response.data);
      if (response.data.length > 0) {
        setSelectedRace(response.data[0].race_id);
      }
    } catch (err) {
      setError("Failed to load races");
      console.error(err);
    }
  };

  const handlePredict = async (e) => {
    e.preventDefault();
    if (!selectedRace) return;

    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const race = races.find((r) => r.race_id === selectedRace);
      const response = await predictionAPI.predictWinner(
        selectedRace,
        race.season,
        race.location,
        weather,
        trackType,
      );
      setPrediction(response.data);
    } catch (err) {
      setError("Failed to get prediction");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentRace = races.find((r) => r.race_id === selectedRace);

  return (
    <div className="prediction-form">
      <h2>🏎️ F1 Race Winner Prediction</h2>

      <form onSubmit={handlePredict}>
        <div className="form-group">
          <label htmlFor="race">Select Race:</label>
          <select
            id="race"
            value={selectedRace || ""}
            onChange={(e) => setSelectedRace(parseInt(e.target.value))}
          >
            <option value="">Choose a race...</option>
            {races.map((race) => (
              <option key={race.race_id} value={race.race_id}>
                {race.race_name} - {race.location}
              </option>
            ))}
          </select>
        </div>

        {currentRace && (
          <div className="race-info">
            <p>
              <strong>Date:</strong> {currentRace.date}
            </p>
            <p>
              <strong>Circuit:</strong> {currentRace.circuit_type}
            </p>
            <p>
              <strong>Track Length:</strong> {currentRace.lap_distance} km
            </p>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="weather">Weather Conditions:</label>
          <select
            id="weather"
            value={weather}
            onChange={(e) => setWeather(e.target.value)}
          >
            <option value="clear">Clear ☀️</option>
            <option value="rainy">Rainy 🌧️</option>
            <option value="cloudy">Cloudy ☁️</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="trackType">Track Type:</label>
          <select
            id="trackType"
            value={trackType}
            onChange={(e) => setTrackType(e.target.value)}
          >
            <option value="permanent">Permanent</option>
            <option value="street">Street</option>
          </select>
        </div>

        <button type="submit" disabled={loading || !selectedRace}>
          {loading ? "🔄 Predicting..." : "🎯 Get Prediction"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {prediction && (
        <div className="prediction-result">
          <h3>🏆 Prediction Result</h3>
          <div className="winner">
            <p className="winner-name">{prediction.predicted_winner}</p>
            <p className="confidence">
              Confidence: {(prediction.confidence * 100).toFixed(1)}%
            </p>
          </div>

          <div className="top-3">
            <h4>Top 3 Contenders:</h4>
            <ol>
              {prediction.top_3.map((team, idx) => (
                <li key={idx}>
                  {team[0]} - {(team[1] * 100).toFixed(1)}%
                </li>
              ))}
            </ol>
          </div>

          <div className="probability-dist">
            <h4>Probability Distribution:</h4>
            <div className="bars">
              {Object.entries(prediction.probability_distribution)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([team, prob], idx) => (
                  <div key={idx} className="bar">
                    <span className="team-name">{team}:</span>
                    <div className="progress">
                      <div
                        className="progress-fill"
                        style={{ width: `${prob * 100}%` }}
                      ></div>
                    </div>
                    <span className="percentage">
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
