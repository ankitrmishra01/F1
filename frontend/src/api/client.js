import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const predictionAPI = {
  predictWinner: (
    raceId,
    season,
    location,
    weather = "clear",
    trackType = "permanent",
  ) =>
    api.post("/api/predictions/predict", {
      race_id: raceId,
      season,
      location,
      weather,
      track_type: trackType,
    }),

  getModelInfo: () => api.get("/api/predictions/model-info"),
};

export const racesAPI = {
  getAllRaces: () => api.get("/api/races/"),
  getRace: (raceId) => api.get(`/api/races/${raceId}`),
  getUpcomingRaces: () => api.get("/api/races/upcoming"),
};

export const teamsAPI = {
  getAllTeams: () => api.get("/api/teams/"),
  getTeam: (teamId) => api.get(`/api/teams/${teamId}`),
  getStandings: () => api.get("/api/teams/standings/current"),
};

export const healthAPI = {
  checkHealth: () => api.get("/health"),
  getStatus: () => api.get("/api/v1/status"),
};

export default api;
