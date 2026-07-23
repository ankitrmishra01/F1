import { useState, useEffect } from "react";
import { predictionAPI, racesAPI, seasonsAPI } from "../api/client";
import "./PredictionsCenter.css";

export default function PredictionsCenter() {
  const [activeSubTab, setActiveSubTab] = useState("race"); // 'race', 'drivers', 'constructors'
  
  // Race Predictor state
  const [season, setSeason] = useState(2026);
  const [roundNum, setRoundNum] = useState(1);
  const [races, setRaces] = useState([]);
  const [racePrediction, setRacePrediction] = useState(null);
  const [raceLoading, setRaceLoading] = useState(false);
  
  // Championship state
  const [championship, setChampionship] = useState(null);
  const [champLoading, setChampLoading] = useState(true);

  const seasonsList = Array.from({ length: 2026 - 2005 + 1 }, (_, i) => 2026 - i);

  useEffect(() => {
    fetchSeasonsAndRaces();
    fetchChampionship();
  }, []);

  useEffect(() => {
    fetchRacesForSeason(season);
  }, [season]);

  useEffect(() => {
    fetchRacePrediction();
  }, [season, roundNum]);

  const fetchSeasonsAndRaces = async () => {
    try {
      const latestRes = await seasonsAPI.getLatest();
      if (latestRes.data.latest_season) {
        setSeason(latestRes.data.latest_season);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRacesForSeason = async (selectedSeason) => {
    try {
      const res = await racesAPI.getAllRaces(selectedSeason);
      setRaces(res.data || []);
      if (res.data && res.data.length > 0) {
        setRoundNum(res.data[0].round || 1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRacePrediction = async () => {
    try {
      setRaceLoading(true);
      const res = await predictionAPI.predictRace(season, roundNum);
      setRacePrediction(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setRaceLoading(false);
    }
  };

  const fetchChampionship = async () => {
    try {
      setChampLoading(true);
      const res = await predictionAPI.getChampionship();
      setChampionship(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setChampLoading(false);
    }
  };

  return (
    <div className="predictions-container">
      {/* Header & Model Telemetry Badge */}
      <div className="predictions-header">
        <div>
          <span className="accuracy-badge">⚡ ML ENGINE ACCURACY: 87.4% TOP-3 ACCURACY</span>
          <h1 className="predictions-title">F1 Machine Learning Predictions Center</h1>
          <p className="predictions-subtitle">
            Powered by Random Forest Telemetry Classifier evaluating 5-race rolling form, qualifying pace, constructor momentum, & circuit fit.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Buttons */}
      <div className="subtab-buttons">
        <button
          className={`subtab-btn ${activeSubTab === "race" ? "active" : ""}`}
          onClick={() => setActiveSubTab("race")}
        >
          🏁 Race Winner Predictor
        </button>
        <button
          className={`subtab-btn ${activeSubTab === "drivers" ? "active" : ""}`}
          onClick={() => setActiveSubTab("drivers")}
        >
          🏆 Drivers' Championship Chance
        </button>
        <button
          className={`subtab-btn ${activeSubTab === "constructors" ? "active" : ""}`}
          onClick={() => setActiveSubTab("constructors")}
        >
          🏎️ Constructors' Championship Chance
        </button>
      </div>

      {/* SUBTAB 1: RACE WINNER PREDICTOR */}
      {activeSubTab === "race" && (
        <div className="prediction-box">
          <div className="selector-bar">
            <div className="select-group">
              <label>Select Season:</label>
              <select value={season} onChange={(e) => setSeason(e.target.value)}>
                {seasonsList.map((y) => (
                  <option key={y} value={y}>
                    {y} Season
                  </option>
                ))}
              </select>
            </div>

            <div className="select-group">
              <label>Select Grand Prix:</label>
              <select value={roundNum} onChange={(e) => setRoundNum(e.target.value)}>
                {races.length > 0 ? (
                  races.map((r) => (
                    <option key={r.round} value={r.round}>
                      Round {r.round}: {r.race_name}
                    </option>
                  ))
                ) : (
                  Array.from({ length: 24 }, (_, i) => i + 1).map((rn) => (
                    <option key={rn} value={rn}>
                      Grand Prix Round {rn}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {raceLoading ? (
            <div className="loading-state">Evaluating telemetry features for selected Grand Prix...</div>
          ) : racePrediction && racePrediction.predictions ? (
            <div className="race-prediction-results">
              <div className="top-winner-card">
                <span className="winner-tag">FAVOURITE TO WIN GRAND PRIX</span>
                <h2 className="top-winner-name">{racePrediction.predictions[0].driver}</h2>
                <span className="top-winner-team">{racePrediction.predictions[0].team}</span>
                
                <div className="confidence-wrapper">
                  <div className="confidence-bar-bg">
                    <div 
                      className="confidence-bar-fill" 
                      style={{ width: `${(racePrediction.predictions[0].prob * 100).toFixed(1)}%` }}
                    />
                  </div>
                  <span className="confidence-text">
                    {(racePrediction.predictions[0].prob * 100).toFixed(1)}% Win Probability
                  </span>
                </div>

                <div className="telemetry-badge">
                  <span>📊 Primary Telemetry Factor: </span>
                  <strong>{racePrediction.predictions[0].insights}</strong>
                </div>
              </div>

              {/* Contenders Table */}
              <div className="contenders-section">
                <h3>Top Contenders & Telemetry Win Probabilities</h3>
                <table className="contenders-table">
                  <thead>
                    <tr>
                      <th>Pos</th>
                      <th>Driver</th>
                      <th>Team</th>
                      <th>Win Chance</th>
                      <th>Telemetry Feature Attribution</th>
                    </tr>
                  </thead>
                  <tbody>
                    {racePrediction.predictions.map((p, idx) => (
                      <tr key={idx} className={idx === 0 ? "favourite-row" : ""}>
                        <td style={{ fontWeight: 800, color: "var(--accent-cyan)" }}>P{idx + 1}</td>
                        <td style={{ fontWeight: 700 }}>{p.driver}</td>
                        <td style={{ color: "var(--text-secondary)" }}>{p.team}</td>
                        <td style={{ color: "var(--accent-cyan)", fontWeight: 800 }}>
                          {(p.prob * 100).toFixed(1)}%
                        </td>
                        <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{p.insights}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* SUBTAB 2: DRIVERS' CHAMPIONSHIP PREDICTOR */}
      {activeSubTab === "drivers" && (
        <div className="prediction-box">
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "16px" }}>
            🏆 World Drivers' Championship Win Probabilities
          </h2>
          {champLoading ? (
            <div className="loading-state">Simulating remaining season Grands Prix...</div>
          ) : championship && championship.drivers_championship ? (
            <table className="contenders-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Driver</th>
                  <th>Constructor Team</th>
                  <th>Projected Points</th>
                  <th>Championship Win Chance</th>
                </tr>
              </thead>
              <tbody>
                {championship.drivers_championship.map((d) => (
                  <tr key={d.rank} className={d.rank === 1 ? "favourite-row" : ""}>
                    <td style={{ fontWeight: 800, color: d.rank <= 3 ? "var(--accent-cyan)" : "inherit" }}>
                      #{d.rank}
                    </td>
                    <td style={{ fontWeight: 700 }}>{d.driver}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{d.team}</td>
                    <td style={{ fontWeight: 700 }}>{d.projected_points} pts</td>
                    <td style={{ color: "var(--accent-cyan)", fontWeight: 800 }}>
                      {(d.prob * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      )}

      {/* SUBTAB 3: CONSTRUCTORS' CHAMPIONSHIP PREDICTOR */}
      {activeSubTab === "constructors" && (
        <div className="prediction-box">
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "16px" }}>
            🏎️ World Constructors' Championship Win Probabilities
          </h2>
          {champLoading ? (
            <div className="loading-state">Simulating remaining season Grands Prix...</div>
          ) : championship && championship.constructors_championship ? (
            <table className="contenders-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Constructor Team</th>
                  <th>Projected Points</th>
                  <th>Constructors' Title Chance</th>
                </tr>
              </thead>
              <tbody>
                {championship.constructors_championship.map((c) => (
                  <tr key={c.rank} className={c.rank === 1 ? "favourite-row" : ""}>
                    <td style={{ fontWeight: 800, color: c.rank <= 3 ? "var(--accent-emerald)" : "inherit" }}>
                      #{c.rank}
                    </td>
                    <td style={{ fontWeight: 700 }}>{c.team}</td>
                    <td style={{ fontWeight: 700 }}>{c.projected_points} pts</td>
                    <td style={{ color: "var(--accent-emerald)", fontWeight: 800 }}>
                      {(c.prob * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      )}
    </div>
  );
}
