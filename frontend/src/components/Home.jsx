import { useState, useEffect } from "react";
import { newsAPI, predictionAPI } from "../api/client";
import "./Home.css";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [championship, setChampionship] = useState(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [predError, setPredError] = useState(null);

  // Selected article for In-App Expanding Reader
  const [selectedArticle, setSelectedArticle] = useState(null);
  // Show feature insights toggle
  const [showInsights, setShowInsights] = useState(false);

  useEffect(() => {
    fetchNews();
    fetchPredictions();
  }, []);

  const fetchNews = async () => {
    try {
      setNewsLoading(true);
      const res = await newsAPI.getNews();
      setArticles(res.data.articles || res.data || []);
      setNewsError(null);
    } catch (err) {
      console.error(err);
      setNewsError("Failed to load news.");
    } finally {
      setNewsLoading(false);
    }
  };

  const fetchPredictions = async () => {
    try {
      setPredLoading(true);
      const [favRes, champRes] = await Promise.all([
        predictionAPI.getFavourite(),
        predictionAPI.getChampionship()
      ]);
      setFavourites(favRes.data.favourites || []);
      setChampionship(champRes.data);
      setPredError(null);
    } catch (err) {
      console.error(err);
      setPredError("Prediction models loading...");
    } finally {
      setPredLoading(false);
    }
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

  return (
    <div className="home-grid">
      {/* LEFT COLUMN: News Feed */}
      <section className="news-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="section-title">Latest F1 News & Upgrades</h2>
          <span className="live-chip">🔴 REAL-TIME RSS</span>
        </div>

        {newsLoading ? (
          <div className="loading-state">Loading live news feed...</div>
        ) : newsError ? (
          <div className="error-state">{newsError}</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">No articles available.</div>
        ) : (
          <div className="news-grid">
            {articles.map((article, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedArticle(article)}
                className="news-card"
              >
                {article.image && (
                  <img
                    src={article.image}
                    alt={article.title}
                    className="news-card-image"
                  />
                )}
                <div className="news-card-content">
                  <span className="news-card-date">
                    {formatDate(article.published) || "Latest News"}
                  </span>
                  <h3 className="news-card-title">{article.title}</h3>
                  {article.description && (
                    <p className="news-card-desc">{article.description}</p>
                  )}
                  <div className="read-more-btn">
                    <span>Read Article</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* RIGHT SIDEBAR: ML Race & Championship Predictors */}
      <aside className="prediction-sidebar">
        {/* Race Winner Predictor */}
        <div className="prediction-card">
          <div className="prediction-card-header">
            <span className="pred-badge">ML WINNER PREDICTOR</span>
            <h3 className="prediction-card-title">Race Winner Probability</h3>
          </div>

          {predLoading ? (
            <div className="loading-state">Analyzing 5-race rolling form & telemetry...</div>
          ) : predError ? (
            <div className="error-state">{predError}</div>
          ) : favourites.length === 0 ? (
            <div className="empty-state">No predictions available.</div>
          ) : (
            <>
              <div className="winner-block">
                <span className="winner-label">Predicted Winner</span>
                <span className="winner-name">{favourites[0].driver}</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${(favourites[0].confidence * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span className="confidence-label">
                    {(favourites[0].confidence * 100).toFixed(1)}% Win Probability
                  </span>
                  <button 
                    className="why-btn"
                    onClick={() => setShowInsights(!showInsights)}
                  >
                    {showInsights ? "Hide Telemetry" : "Why this winner?"}
                  </button>
                </div>

                {/* Telemetry Feature Insights */}
                {showInsights && favourites[0].insights && (
                  <div className="insights-drawer">
                    <div className="insight-row">
                      <span className="insight-name">🏎️ 5-Race Finish Form</span>
                      <span className="insight-val">{favourites[0].insights.recent_form}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-name">⚡ Qualifying Pace Rating</span>
                      <span className="insight-val">{favourites[0].insights.quali_pace}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-name">📈 Constructor Trajectory</span>
                      <span className="insight-val">{favourites[0].insights.team_momentum}</span>
                    </div>
                    <div className="insight-row">
                      <span className="insight-name">🛣️ Circuit Fit Score</span>
                      <span className="insight-val">{favourites[0].insights.circuit_suitability}</span>
                    </div>
                  </div>
                )}
              </div>

              {favourites.length > 1 && (
                <div className="contenders-block">
                  <h4 className="contenders-title">Top Contenders</h4>
                  <ul className="contenders-list">
                    {favourites.slice(1).map((fav, index) => (
                      <li key={index} className="contender-item">
                        <span className="contender-name">{fav.driver}</span>
                        <span className="contender-pct">
                          {(fav.confidence * 100).toFixed(1)}%
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* World Championship Predictor */}
        {championship && (
          <div className="prediction-card" style={{ marginTop: '24px', borderTopColor: 'var(--accent-indigo)' }}>
            <div className="prediction-card-header">
              <span className="pred-badge" style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', color: '#fff' }}>
                SEASON PREDICTOR
              </span>
              <h3 className="prediction-card-title">World Champions Projections</h3>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span className="winner-label">🏆 Drivers' Champion Prediction</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{championship.drivers_championship[0].driver}</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {(championship.drivers_championship[0].prob * 100).toFixed(0)}% Proj. Win
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {championship.drivers_championship[0].team} &middot; Proj. Points: {championship.drivers_championship[0].projected_points} pts
              </span>
            </div>

            <div>
              <span className="winner-label">🏎️ Constructors' Champion Prediction</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{championship.constructors_championship[0].team}</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {(championship.constructors_championship[0].prob * 100).toFixed(0)}% Proj. Win
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Proj. Points: {championship.constructors_championship[0].projected_points} pts
              </span>
            </div>
          </div>
        )}
      </aside>

      {/* IN-APP EXPANDING NEWS READER MODAL */}
      {selectedArticle && (
        <div className="news-modal-overlay" onClick={() => setSelectedArticle(null)}>
          <div className="news-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="news-modal-close" onClick={() => setSelectedArticle(null)}>✕ Close</button>
            
            {selectedArticle.image && (
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="news-modal-image"
              />
            )}
            
            <div className="news-modal-body">
              <span className="news-card-date">
                {formatDate(selectedArticle.published) || "Latest News"} &middot; Autosport F1 Feed
              </span>
              <h2 className="news-modal-title">{selectedArticle.title}</h2>
              <p className="news-modal-text">{selectedArticle.description}</p>
              
              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Expanded In-App Reader</span>
                <a
                  href={selectedArticle.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  View Original Source ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
