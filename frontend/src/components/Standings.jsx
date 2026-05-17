import React, { useState, useEffect } from "react";
import { teamsAPI } from "../api/client";
import "./Standings.css";

export default function Standings() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      setLoading(true);
      const response = await teamsAPI.getStandings();
      setStandings(response.data);
    } catch (err) {
      setError("Failed to load standings");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="standings loading">🔄 Loading standings...</div>;
  }

  if (error) {
    return <div className="standings error">{error}</div>;
  }

  return (
    <div className="standings">
      <h2>🏆 Championship Standings</h2>
      <div className="standings-table">
        <div className="standings-header">
          <div className="col-pos">Pos</div>
          <div className="col-team">Team</div>
          <div className="col-points">Points</div>
          <div className="col-wins">Wins</div>
        </div>
        {standings.map((team, idx) => (
          <div
            key={team.team_id}
            className={`standings-row ${idx < 3 ? "podium" : ""}`}
          >
            <div className="col-pos">
              {idx === 0 && "🥇"}
              {idx === 1 && "🥈"}
              {idx === 2 && "🥉"}
              {idx >= 3 && idx + 1}
            </div>
            <div className="col-team">
              <span
                className="team-badge"
                style={{ background: getTeamColor(team.team_name) }}
              ></span>
              {team.team_name}
            </div>
            <div className="col-points">{team.points}</div>
            <div className="col-wins">{team.wins}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getTeamColor(teamName) {
  const colors = {
    "Red Bull Racing": "#0082FA",
    Mercedes: "#00D2BE",
    Ferrari: "#DC0000",
    McLaren: "#FF8700",
    "Aston Martin": "#006C5C",
    Alfaromeo: "#900000",
    Haas: "#FFFFFF",
    "Kick Sauber": "#52B4F7",
    RB: "#5E72E4",
    Williams: "#0082FA",
  };
  return colors[teamName] || "#999";
}
