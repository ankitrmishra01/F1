import { useState, useEffect } from "react";
import { predictionAPI } from "../api/client";
import "./PredictionForm.css"; // We'll reuse the styling for now

export default function FavouriteToWin() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await predictionAPI.getFavourite();
      setFavourites(res.data.favourites || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load predictions. Is the model trained?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-container">
      <h2>🏆 Favourites to Win Next Race</h2>
      <p className="prediction-subtitle" style={{ color: '#888', marginBottom: '20px' }}>
        Based on our form-based ML model (recent results, qualifying, sprint pace, team trends).
        <br /><em>Note: This is a statistical probability, not a guarantee.</em>
      </p>

      {loading ? (
        <div className="loading">Analyzing form data...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : favourites.length === 0 ? (
        <div>No predictions available.</div>
      ) : (
        <div className="prediction-results show">
          <div className="winner-card">
            <h3>Predicted Winner</h3>
            <div className="winner-name">{favourites[0].driver}</div>
            <div className="confidence-meter">
              <div
                className="confidence-fill"
                style={{ width: `${(favourites[0].confidence * 100).toFixed(1)}%` }}
              ></div>
            </div>
            <div className="confidence-text">
              {(favourites[0].confidence * 100).toFixed(1)}% Win Probability
            </div>
          </div>

          <div className="top-teams">
            <h4>Top Contenders</h4>
            <ul className="contenders-list">
              {favourites.slice(1).map((fav, index) => (
                <li key={index} className="contender-item">
                  <span className="contender-name">{fav.driver}</span>
                  <span className="contender-prob">
                    {(fav.confidence * 100).toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
