import { useState, useEffect } from "react";
import { circuitsAPI } from "../api/client";
import "./Circuits.css";

// Motorsport Calendar White Vector Track SVG Paths
const TRACK_SVGS = {
  bahrain: "M 30,80 L 30,30 L 70,20 L 120,40 L 170,30 L 175,70 L 130,85 L 110,65 L 80,90 Z",
  jeddah: "M 20,60 C 40,20 160,20 180,60 C 160,100 40,100 20,60 Z",
  albert_park: "M 30,90 L 30,30 C 70,20 130,20 160,40 L 170,80 L 120,95 L 70,75 Z",
  suzuka: "M 30,70 Q 60,30 90,60 T 150,40 Q 170,80 130,90 T 50,80 Z",
  shanghai: "M 30,90 L 30,30 L 90,20 L 140,50 L 170,30 L 170,85 L 90,95 Z",
  miami: "M 30,80 L 40,30 L 110,25 L 170,45 L 160,85 L 100,95 Z",
  imola: "M 30,85 L 40,25 L 120,20 L 165,55 L 150,90 L 80,95 Z",
  monaco: "M 30,75 L 50,30 L 90,40 L 130,25 L 170,50 L 150,85 L 90,90 L 60,70 Z",
  villeneuve: "M 25,60 L 175,30 L 175,90 Z",
  catalunya: "M 30,80 L 30,30 L 100,20 L 170,40 L 150,85 L 90,90 Z",
  red_bull_ring: "M 30,80 L 40,30 L 160,25 L 170,60 L 110,85 Z",
  silverstone: "M 30,80 L 50,30 L 110,25 L 170,45 L 160,90 L 100,75 L 60,90 Z",
  hungaroring: "M 30,80 L 40,30 L 110,20 L 160,50 L 150,85 L 80,95 Z",
  spa: "M 30,85 L 30,35 L 70,20 L 130,45 L 175,25 L 165,75 L 110,95 L 70,75 Z",
  zandvoort: "M 30,80 L 40,30 L 120,25 L 165,60 L 140,90 L 80,90 Z",
  monza: "M 25,75 L 40,35 L 165,30 L 175,70 L 130,85 Z",
  baku: "M 30,90 L 30,25 L 170,25 L 170,90 Z",
  marina_bay: "M 30,80 L 30,30 L 90,25 L 140,40 L 170,30 L 160,85 L 100,95 Z",
  cota: "M 30,85 L 60,20 L 120,40 L 170,30 L 160,85 L 100,95 Z",
  mexico: "M 30,80 L 30,30 L 110,25 L 170,45 L 160,85 L 90,90 Z",
  interlagos: "M 30,75 Q 70,20 130,40 Q 170,80 120,95 Q 60,90 30,75 Z",
  las_vegas: "M 30,80 L 30,30 L 170,30 L 170,80 Z",
  losail: "M 30,80 L 40,30 L 120,20 L 170,50 L 150,85 L 80,90 Z",
  yas_marina: "M 30,80 L 40,30 L 120,25 L 170,45 L 160,85 L 90,95 Z"
};

const COUNTRY_FLAGS = {
  Bahrain: "🇧🇭",
  "Saudi Arabia": "🇸🇦",
  Australia: "🇦🇺",
  Japan: "🇯🇵",
  China: "🇨🇳",
  "United States": "🇺🇸",
  Italy: "🇮🇹",
  Monaco: "🇲🇨",
  Canada: "🇨🇦",
  Spain: "🇪🇸",
  Austria: "🇦🇹",
  "Great Britain": "🇬🇧",
  Hungary: "🇭🇺",
  Belgium: "🇧🇪",
  Netherlands: "🇳🇱",
  Azerbaijan: "🇦🇿",
  Singapore: "🇸🇬",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Qatar: "🇶🇦",
  "Abu Dhabi (UAE)": "🇦🇪"
};

export default function Circuits() {
  const [circuits, setCircuits] = useState([]);
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCircuits();
  }, []);

  const fetchCircuits = async () => {
    try {
      setLoading(true);
      const res = await circuitsAPI.getCircuits();
      setCircuits(res.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load circuit guides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="circuits-container">
      {/* Header */}
      <div className="circuits-header">
        <span className="petronas-badge">🛣️ F1 2026 CALENDAR & TRACK SPECIFICATIONS</span>
        <h1 className="circuits-title">World Formula 1 Circuits Guide</h1>
        <p className="circuits-subtitle">
          Official white vector track outlines, country flags, sector distance breakdowns, lap records, & all-time circuit masters. Click any circuit card to view full telemetry.
        </p>
      </div>

      {loading ? (
        <div className="loading-state">Loading circuit vector layouts & telemetry...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : (
        <div className="circuits-grid">
          {circuits.map((c) => {
            const svgPath = TRACK_SVGS[c.circuit_id] || TRACK_SVGS.silverstone;
            const flag = COUNTRY_FLAGS[c.country] || "🏁";

            return (
              <div
                key={c.circuit_id}
                className="circuit-card"
                onClick={() => setSelectedCircuit(c)}
              >
                {/* Motorsport Vector Track Layout Header */}
                <div className="circuit-card-media-vector">
                  <div className="circuit-flag-badge">
                    <span className="flag-icon">{flag}</span>
                    <span className="flag-country">{c.country}</span>
                  </div>

                  <svg viewBox="0 0 200 120" className="track-vector-svg">
                    <path
                      d={svgPath}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={svgPath}
                      fill="none"
                      stroke="var(--accent-cyan)"
                      strokeWidth="1"
                      strokeDasharray="4,4"
                    />
                  </svg>
                </div>

                <div className="circuit-card-body">
                  <h3 className="circuit-card-name">{c.name}</h3>
                  <p className="circuit-card-loc">{c.location}</p>

                  <div className="circuit-card-specs">
                    <div className="spec-item">
                      <span className="spec-label">Length</span>
                      <span className="spec-val">{c.length_km} km</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Laps</span>
                      <span className="spec-val">{c.laps}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Turns</span>
                      <span className="spec-val">{c.turns}</span>
                    </div>
                  </div>

                  <div className="circuit-card-master">
                    <span>🏆 Most Track Wins: </span>
                    <strong>{c.track_masters.most_wins.driver} ({c.track_masters.most_wins.count} Wins)</strong>
                  </div>

                  <div className="inspect-btn">
                    <span>Inspect Sectors & Record</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAILED CIRCUIT MODAL */}
      {selectedCircuit && (
        <div className="circuit-modal-overlay" onClick={() => setSelectedCircuit(null)}>
          <div className="circuit-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="circuit-modal-close" onClick={() => setSelectedCircuit(null)}>✕ Close</button>

            <div className="circuit-modal-header">
              <span className="petronas-badge">
                {COUNTRY_FLAGS[selectedCircuit.country] || "🏁"} {selectedCircuit.country} &middot; {selectedCircuit.location}
              </span>
              <h2>{selectedCircuit.name}</h2>
            </div>

            <div className="circuit-modal-grid">
              {/* Left Column: Track Layout & Image */}
              <div className="modal-left">
                <div className="map-wrapper-vector">
                  <svg viewBox="0 0 200 120" className="modal-track-svg">
                    <path
                      d={TRACK_SVGS[selectedCircuit.circuit_id] || TRACK_SVGS.silverstone}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d={TRACK_SVGS[selectedCircuit.circuit_id] || TRACK_SVGS.silverstone}
                      fill="none"
                      stroke="var(--accent-cyan)"
                      strokeWidth="1.5"
                      strokeDasharray="5,5"
                    />
                  </svg>
                </div>
                
                <div className="specs-box">
                  <h4>Track Technical Package</h4>
                  <div className="spec-row">
                    <span>Circuit Distance:</span>
                    <strong>{selectedCircuit.length_km} km per lap</strong>
                  </div>
                  <div className="spec-row">
                    <span>Total Laps:</span>
                    <strong>{selectedCircuit.laps} Laps</strong>
                  </div>
                  <div className="spec-row">
                    <span>Total Race Distance:</span>
                    <strong>{selectedCircuit.race_distance_km} km</strong>
                  </div>
                  <div className="spec-row">
                    <span>Number of Turns:</span>
                    <strong>{selectedCircuit.turns} Corners</strong>
                  </div>
                  <div className="spec-row">
                    <span>DRS Acceleration Zones:</span>
                    <strong>{selectedCircuit.drs_zones} DRS Zones</strong>
                  </div>
                </div>
              </div>

              {/* Right Column: Sectors, Lap Record & Masters */}
              <div className="modal-right">
                {/* Sector Distances */}
                <div className="modal-section">
                  <h4 style={{ color: "var(--accent-cyan)", marginBottom: "12px" }}>⏱️ Sector Distance Breakdowns</h4>
                  <div className="sector-list">
                    <div className="sector-card">
                      <span className="sector-title">SECTOR 1</span>
                      <span className="sector-desc">{selectedCircuit.sectors.sector_1}</span>
                    </div>
                    <div className="sector-card">
                      <span className="sector-title">SECTOR 2</span>
                      <span className="sector-desc">{selectedCircuit.sectors.sector_2}</span>
                    </div>
                    <div className="sector-card">
                      <span className="sector-title">SECTOR 3</span>
                      <span className="sector-desc">{selectedCircuit.sectors.sector_3}</span>
                    </div>
                  </div>
                </div>

                {/* Lap Record */}
                <div className="modal-section">
                  <h4 style={{ color: "var(--accent-cyan)", marginBottom: "8px" }}>⚡ Official Lap Record</h4>
                  <div className="record-banner">
                    <span className="record-time">{selectedCircuit.lap_record.time}</span>
                    <span className="record-holder">
                      {selectedCircuit.lap_record.driver} ({selectedCircuit.lap_record.year})
                    </span>
                  </div>
                </div>

                {/* All-Time Track Masters */}
                <div className="modal-section">
                  <h4 style={{ color: "var(--accent-cyan)", marginBottom: "8px" }}>👑 All-Time Circuit Masters</h4>
                  <div className="masters-box">
                    <div className="master-row">
                      <span>Most Grand Prix Wins:</span>
                      <strong>{selectedCircuit.track_masters.most_wins.driver} ({selectedCircuit.track_masters.most_wins.count} Wins)</strong>
                    </div>
                    <div className="master-row">
                      <span>Most Podiums:</span>
                      <strong>{selectedCircuit.track_masters.most_podiums.driver} ({selectedCircuit.track_masters.most_podiums.count} Podiums)</strong>
                    </div>
                    <div className="master-row">
                      <span>Most Career Points:</span>
                      <strong>{selectedCircuit.track_masters.most_points.driver} ({selectedCircuit.track_masters.most_points.count} pts)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
