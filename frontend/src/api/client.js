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
    team,
    country_name_length = 10,
    track_distance = 300,
    circuit_type = "permanent",
  ) =>
    api.post("/api/predictions/predict", {
      team,
      country_name_length,
      track_distance,
      circuit_type,
    }),
    
  getFavourite: () => api.get("/api/predictions/favourite"),
};

export const racesAPI = {
  getAllRaces: (season = null) => api.get(`/api/races/${season ? '?season='+season : ''}`),
  getRaceSessions: (raceId) => api.get(`/api/races/${raceId}/sessions`),
};

export const teamsAPI = {
  getAllTeams: () => api.get("/api/teams/"),
  getTeamProfile: (teamId) => api.get(`/api/teams/${teamId}`),
  getTeamRaces: (teamId, season = null) => api.get(`/api/teams/${teamId}/races${season ? '?season='+season : ''}`),
  getStandings: () => api.get("/api/teams/standings/current"),
};

export const driversAPI = {
  getAllDrivers: () => api.get("/api/drivers/"),
  getDriverProfile: (driverId) => api.get(`/api/drivers/${driverId}`),
  getDriverRaces: (driverId, season = null) => api.get(`/api/drivers/${driverId}/races${season ? '?season='+season : ''}`),
};

export const recordsAPI = {
  getChampions: () => api.get("/api/records/champions"),
  getAllTime: () => api.get("/api/records/all-time"),
};

export const seasonsAPI = {
  getLatest: () => api.get("/api/seasons/latest"),
};

export const newsAPI = {
  getNews: () => api.get("/api/news/"),
};

export const healthAPI = {
  checkHealth: () => api.get("/health"),
  getStatus: () => api.get("/api/v1/status"),
};

export default api;
