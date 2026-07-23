import { useState, useEffect } from "react";
import { carsAPI } from "../api/client";
import "./CarSpecs.css";

export default function CarSpecs() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const res = await carsAPI.getCars();
      setData(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load car specifications");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading car configurations & aero data...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!data) return null;

  const { regulations, cars } = data;

  return (
    <div className="car-specs-container">
      <div className="car-specs-header">
        <h1>Car Configurations & Technical Upgrades</h1>
        <p className="subtitle">Detailed power unit architecture, chassis setups, aero packages & expected upgrades for all 10 F1 teams.</p>
      </div>

      {/* Regulations Overview */}
      <section className="tech-regs-card">
        <h2>F1 2025/2026 Technical Regulations Overview</h2>
        <div className="regs-grid">
          <div className="reg-item">
            <span className="reg-label">Engine Architecture</span>
            <span className="reg-val">{regulations.engine_architecture}</span>
          </div>
          <div className="reg-item">
            <span className="reg-label">Total Power Output</span>
            <span className="reg-val">{regulations.power_output}</span>
          </div>
          <div className="reg-item">
            <span className="reg-label">ERS Electrical Power</span>
            <span className="reg-val">{regulations.ers_power}</span>
          </div>
          <div className="reg-item">
            <span className="reg-label">Fuel Spec</span>
            <span className="reg-val">{regulations.fuel_specification}</span>
          </div>
          <div className="reg-item">
            <span className="reg-label">Active Aerodynamics</span>
            <span className="reg-val">{regulations.chassis_aerodynamics}</span>
          </div>
          <div className="reg-item">
            <span className="reg-label">Minimum Weight</span>
            <span className="reg-val">{regulations.min_weight}</span>
          </div>
        </div>
      </section>

      {/* Team Cars Showcase */}
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px' }}>Team Car Specifications</h2>
      <div className="cars-grid">
        {cars.map((car) => (
          <div key={car.team_id} className="car-card" style={{ borderTopColor: car.color || 'var(--accent-cyan)' }}>
            <div className="car-card-header">
              <div>
                <span className="car-team-name">{car.team_name}</span>
                <h3 className="car-model">{car.car_model}</h3>
              </div>
              <span className="engine-badge">{car.power_unit.split(' ')[0]}</span>
            </div>

            <div className="car-spec-row">
              <span className="spec-title">Power Unit</span>
              <span className="spec-detail">{car.power_unit}</span>
            </div>

            <div className="car-spec-row">
              <span className="spec-title">Chassis & Suspension</span>
              <span className="spec-detail">{car.chassis}</span>
            </div>

            <div className="car-spec-row">
              <span className="spec-title">Aero Architecture</span>
              <span className="spec-detail">{car.aero_package}</span>
            </div>

            <div className="upgrade-box">
              <span className="upgrade-title">⚡ Key Technical Upgrade</span>
              <p className="upgrade-text">{car.expected_upgrades}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
