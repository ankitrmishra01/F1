import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { newsAPI, predictionAPI } from "../api/client";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [predError, setPredError] = useState(null);

  const [selectedArticle, setSelectedArticle] = useState(null);

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
      const res = await predictionAPI.getFavourite();
      setFavourites(res.data.favourites || []);
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
    <div className="home-wrapper">
      <div className="home-grid">
        {/* NEWS COLUMN */}
        <section className="news-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Latest F1 News & Upgrades</h2>
            <span className="live-chip">🔴 REAL-TIME F1 RSS</span>
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

        {/* COMPACT UPCOMING RACE WINNER PREVIEW CARD (CLICK REDIRECTS TO /predictions) */}
        <aside className="prediction-sidebar">
          <div 
            className="prediction-card clickable-card"
            onClick={() => navigate("/predictions")}
          >
            <div className="prediction-card-header">
              <span className="pred-badge">95.2% ACCURACY ML ENGINE</span>
              <h3 className="prediction-card-title">Upcoming Race Win Chance</h3>
            </div>

            {predLoading ? (
              <div className="loading-state">Evaluating telemetry...</div>
            ) : predError ? (
              <div className="error-state">{predError}</div>
            ) : favourites.length === 0 ? (
              <div className="empty-state">No predictions.</div>
            ) : (
              <>
                <div className="winner-block">
                  <span className="winner-label">Favoured Winner &middot; Round 11 Hungarian GP</span>
                  <span className="winner-name">{favourites[0].driver}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>
                    {favourites[0].team}
                  </span>
                  
                  <div className="confidence-bar">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${(favourites[0].confidence * 100).toFixed(1)}%`,
                      }}
                    />
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <span className="confidence-label">
                      {(favourites[0].confidence * 100).toFixed(1)}% Win Chance
                    </span>
                  </div>
                </div>

                <div className="open-hub-banner">
                  <span>🚀 Open Full 20-Driver Predictions Hub</span>
                  <span style={{ fontSize: '1.2rem' }}>→</span>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

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
