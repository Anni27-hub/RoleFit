import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHistory } from "../api/resume.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import "./History.css";

const History = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    getHistory()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const scores = items.map((item) => Number(item.matchScore) || 0);
  const averageScore = scores.length
    ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
    : 0;
  const bestReport = items.reduce(
    (best, item) => ((Number(item.matchScore) || 0) > (Number(best?.matchScore) || 0) ? item : best),
    null,
  );
  const remainingCredits = Math.max(0, 5 - items.length);

  return (
    <main className="history-page">
      <nav className="history-nav">
        <Link className="brand" to="/"><span className="brand-mark">RF</span>RoleFit AI</Link>
        <div>
          <Link to="/resume-builder" className="nav-workspace-link">AI Workspace</Link>
          <Link to="/premium">Premium</Link>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <header className="history-hero animate-rise">
        <p className="section-kicker">Saved reports</p>
        <h1>Your career dashboard</h1>
        <p>Track every analysis, compare progress, and keep your strongest resume version ready.</p>
      </header>

      <section className="dashboard-grid">
        <article>
          <span>Total analyses</span>
          <strong>{items.length}</strong>
          <p>Reports saved to your account.</p>
        </article>
        <article>
          <span>Average ATS fit</span>
          <strong>{averageScore || "--"}</strong>
          <p>Average score across all uploaded resumes.</p>
        </article>
        <article>
          <span>Best resume</span>
          <strong>{bestReport ? `${bestReport.matchScore}` : "--"}</strong>
          <p>{bestReport?.jobTitle || "Analyze a resume to unlock this."}</p>
        </article>
        <article className="premium-card">
          <span>Available credits</span>
          <strong>{user?.analysisCredits ?? remainingCredits}</strong>
          <p>{user?.plan === "premium" ? "Premium is active." : "Upgrade with Razorpay to add more credits."}</p>
        </article>
      </section>

      <section className="history-list">
        {loading && <p>Loading history...</p>}
        {!loading && items.length === 0 && (
          <div className="empty-history">
            <h2>No reports yet</h2>
            <p>Run your first resume analysis to see it here.</p>
            <Link to="/">Analyze resume</Link>
          </div>
        )}
        {items.map((item) => (
          <Link className="history-card animate-rise" to={`/results/${item._id}`} key={item._id}>
            <div>
              <span>{item.jobTitle || "Target role"}</span>
              <h2>{item.resumeName || "Resume analysis"}</h2>
              <p>{new Date(item.createdAt).toLocaleString()}</p>
            </div>
            <strong>{item.matchScore}/100</strong>
          </Link>
        ))}
      </section>
    </main>
  );
};

export default History;
