import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAnalysis } from "../api/resume.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import ScoreCard from "../components/ScoreCard.jsx";
import KeywordBox from "../components/KeywordBox.jsx";
import BulletComparison from "../components/BulletComparison.jsx";
import "./Results.css";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalysis(id)
      .then(setAnalysis)
      .catch((err) => setError(err.response?.data?.message || "Failed to load analysis."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="results-page"><p className="state-message">Loading report...</p></div>;
  }

  if (error) {
    return <div className="results-page"><p className="state-message error">{error}</p></div>;
  }

  if (!analysis) {
    return <div className="results-page"><p className="state-message">No analysis found.</p></div>;
  }

  return (
    <main className="results-page">
      <nav className="results-nav">
        <Link className="brand" to="/"><span className="brand-mark">RF</span>RoleFit AI</Link>
        <div>
          <Link to="/history">History</Link>
          <Link to="/premium">Premium</Link>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header className="results-hero">
        <div className="report-actions">
          <button className="back-btn" onClick={() => navigate("/")}>Back to checker</button>
          <button className="download-btn" onClick={() => window.print()}>Download PDF report</button>
        </div>
        <p className="section-kicker">Resume report</p>
        <h1>{analysis.jobTitle || "Role-fit analysis"}</h1>
        <p>
          {analysis.resumeName || "Uploaded resume"} scored against the job description on
          ATS readability, keyword alignment, experience fit, and measurable impact.
        </p>
      </header>

      <section className="score-section-results">
        <div className="overall-score">
          <span>Overall fit</span>
          <strong>{analysis.matchScore}</strong>
          <small>/100</small>
        </div>
        <div className="score-grid">
          {(analysis.sectionScores || []).map((sec) => (
            <ScoreCard key={sec.section} score={sec.score} label={sec.section} />
          ))}
        </div>
      </section>

      <section className="results-two-col">
        <article className="report-panel">
          <h2>Strengths</h2>
          <List items={analysis.strengths} empty="No strengths returned." />
        </article>
        <article className="report-panel">
          <h2>Weaknesses</h2>
          <List items={analysis.weaknesses} empty="No weaknesses returned." />
        </article>
      </section>

      <section className="report-panel">
        <h2>ATS Keywords</h2>
        <div className="keywords-grid">
          <KeywordBox title="Matched" keywords={analysis.matchedKeywords || []} type="matched" />
          <KeywordBox title="Missing" keywords={analysis.missingKeywords || []} type="missing" />
        </div>
      </section>

      <section className="report-panel">
        <h2>Improved Summary</h2>
        <div className="improved-summary">{analysis.improvedSummary || "No summary returned."}</div>
      </section>

      <section className="report-panel">
        <h2>Better Bullet Points</h2>
        <div className="bullets-container">
          {(analysis.bulletRewrites || []).length === 0 && <p className="empty">No bullet rewrites returned.</p>}
          {(analysis.bulletRewrites || []).map((bullet, index) => (
            <BulletComparison
              key={index}
              original={bullet.original}
              improved={bullet.improved}
              reason={bullet.reason}
            />
          ))}
        </div>
      </section>

      <section className="report-panel">
        <h2>Skill Gap Roadmap</h2>
        <ol className="roadmap-list">
          {(analysis.skillGapRoadmap || []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ol>
      </section>
    </main>
  );
};

const List = ({ items = [], empty }) => {
  if (!items.length) return <p className="empty">{empty}</p>;
  return (
    <ul className="insight-list">
      {items.map((item, index) => <li key={index}>{item}</li>)}
    </ul>
  );
};

export default Results;
