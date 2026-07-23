import { useState, useEffect } from "react";
import { newsAPI, predictionAPI } from "../api/client";
import "./Home.css";

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [predLoading, setPredLoading] = useState(true);
  const [newsError, setNewsError] = useState(null);
  const [predError, setPredError] = useState(null);

  useEffect(() => {
    fetchNews();
    fetchPrediction();
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

  const fetchPrediction = async () => {
    try {
      setPredLoading(true);
      const res = await predictionAPI.getFavourite();
      setFavourites(res.data.favourites || []);
      setPredError(null);
    } catch (err) {
      console.error(err);
      setPredError("Prediction model unavailable.");
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
      <section className="news-section">
        <h2 className="section-title">Latest News</h2>

        {newsLoading ? (
          <div className="loading-state">Loading news...</div>
        ) : newsError ? (
          <div className="error-state">{newsError}</div>
        ) : articles.length === 0 ? (
          <div className="empty-state">No articles available.</div>
        ) : (
          <div className="news-grid">
            {articles.map((article, idx) => (
              <a
                key={idx}
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
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
                  <h3 className="news-card-title">{article.title}</h3>
                  {article.published && (
                    <span className="news-card-date">
                      {formatDate(article.published)}
                    </span>
                  )}
                  {article.description && (
                    <p className="news-card-desc">{article.description}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <aside className="prediction-sidebar">
        <div className="prediction-card">
          <h3 className="prediction-card-title">Predicted Winner</h3>

          {predLoading ? (
            <div className="loading-state">Analyzing form data...</div>
          ) : predError ? (
            <div className="error-state">{predError}</div>
          ) : favourites.length === 0 ? (
            <div className="empty-state">No predictions available.</div>
          ) : (
            <>
              <div className="winner-block">
                <span className="winner-name">{favourites[0].driver}</span>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{
                      width: `${(favourites[0].confidence * 100).toFixed(1)}%`,
                    }}
                  />
                </div>
                <span className="confidence-label">
                  {(favourites[0].confidence * 100).toFixed(1)}% Win Probability
                </span>
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
      </aside>
    </div>
  );
}
