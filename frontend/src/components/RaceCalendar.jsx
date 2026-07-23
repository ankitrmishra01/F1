import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { racesAPI, seasonsAPI } from "../api/client";
import "./RaceCalendar.css";

export default function RaceCalendar() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [season, setSeason] = useState(null);
  const [latestSeason, setLatestSeason] = useState(null);

  useEffect(() => {
    fetchLatestSeason();
  }, []);

  useEffect(() => {
    if (season !== null) {
      fetchRaces();
    }
  }, [season]);

  const fetchLatestSeason = async () => {
    try {
      const res = await seasonsAPI.getLatest();
      const latest = res.data.season || res.data;
      setLatestSeason(latest);
      setSeason(latest);
    } catch (err) {
      console.error(err);
      const fallback = new Date().getFullYear();
      setLatestSeason(fallback);
      setSeason(fallback);
    }
  };

  const fetchRaces = async () => {
    try {
      setLoading(true);
      const response = await racesAPI.getAllRaces(season);
      setRaces(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load races.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const seasonOptions = () => {
    if (!latestSeason) return [];
    const years = [];
    for (let y = latestSeason; y >= 2005; y--) {
      years.push(y);
    }
    return years;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!season) {
    return <div className="calendar-loading">Loading...</div>;
  }

  return (
    <div className="race-calendar">
      <div className="calendar-header">
        <h2>Race Calendar</h2>
        <select
          className="calendar-season-select"
          value={season}
          onChange={(e) => setSeason(Number(e.target.value))}
        >
          {seasonOptions().map((y) => (
            <option key={y} value={y}>
              {y} Season
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="calendar-loading">Loading races...</div>
      ) : error ? (
        <div className="calendar-error">{error}</div>
      ) : races.length === 0 ? (
        <div className="calendar-loading">No races found for {season}.</div>
      ) : (
        <div className="calendar-grid">
          {races.map((race) => (
            <Link
              to={`/race/${race.race_id}`}
              key={race.race_id}
              className="calendar-card"
            >
              <div className="calendar-card-header">
                <h3 className="calendar-race-name">{race.race_name}</h3>
                <span className="round-badge">R{race.round}</span>
              </div>
              <div className="calendar-card-body">
                <div className="calendar-detail">
                  <span className="detail-label">Country</span>
                  <span className="detail-value">{race.country}</span>
                </div>
                <div className="calendar-detail">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(race.date)}</span>
                </div>
                <div className="calendar-detail">
                  <span className="detail-label">Circuit</span>
                  <span className="detail-value">{race.circuit_name}</span>
                </div>
                <div className="calendar-detail">
                  <span className="detail-label">Type</span>
                  <span className="detail-value">{race.circuit_type}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
