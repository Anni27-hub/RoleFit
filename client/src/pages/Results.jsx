import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  downloadTailoredDocx,
  emailAnalysisReport,
  getAnalysis
} from "../api/resume.js";
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

  // New features state: Tailored Word DOCX & Email
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null);

  useEffect(() => {
    getAnalysis(id)
      .then((data) => {
        setAnalysis(data);
        if (user?.email) setEmailInput(user.email);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load analysis."))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      await downloadTailoredDocx(id, analysis.jobTitle);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to download tailored Word resume.");
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      setSendingEmail(true);
      setEmailStatus(null);
      const res = await emailAnalysisReport(id, emailInput.trim());
      setEmailStatus({
        type: "success",
        message: res.message || "Report sent successfully!",
        previewUrl: res.previewUrl
      });
    } catch (err) {
      setEmailStatus({
        type: "error",
        message: err.response?.data?.message || "Failed to send email report."
      });
    } finally {
      setSendingEmail(false);
    }
  };

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
          <Link to="/resume-builder" className="nav-workspace-link">AI Workspace</Link>
          <Link to="/history">History</Link>
          <Link to="/premium">Premium</Link>
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          <span>{user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>

      <div className="print-header-banner">
        <div className="print-logo-text">RoleFit AI <span>Resume & ATS Report</span></div>
        <div className="print-meta-text">Generated: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</div>
      </div>

      <header className="results-hero">
        <div className="report-actions">
          <button className="back-btn" onClick={() => navigate("/")}>&larr; Back to checker</button>
          <button className="download-btn" onClick={() => window.print()}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Download PDF Report
          </button>
          <button
            className="action-btn-secondary"
            onClick={handleDownloadDocx}
            disabled={downloadingDocx}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            {downloadingDocx ? "Generating Word..." : "Download Tailored Word (.docx)"}
          </button>
          <button
            className="action-btn-secondary"
            onClick={() => { setEmailModalOpen(true); setEmailStatus(null); }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}>
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            Email Report
          </button>
        </div>

        <p className="section-kicker">Resume report</p>
        <h1>{analysis.jobTitle || "Role-fit analysis"}</h1>
        <p>
          {analysis.resumeName || "Uploaded resume"} scored against the job description on
          ATS readability, keyword alignment, experience fit, and measurable impact.
        </p>
      </header>

      {/* Email Report Modal */}
      {emailModalOpen && (
        <div className="email-modal-overlay" onClick={() => setEmailModalOpen(false)}>
          <div className="email-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="email-modal-header">
              <h3>Email Executive Report</h3>
              <button
                className="email-close-btn"
                type="button"
                onClick={() => setEmailModalOpen(false)}
              >
                &times;
              </button>
            </div>
            <p className="email-modal-desc">
              We'll send an executive diagnostic summary including your match score, strengths, missing keywords, and top bullet rewrites.
            </p>

            <form onSubmit={handleSendEmail} className="email-modal-form">
              <label>
                <span>Recipient Email Address</span>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </label>

              {emailStatus && (
                <div className={`email-status-box ${emailStatus.type}`}>
                  <p>{emailStatus.message}</p>
                  {emailStatus.previewUrl && (
                    <a
                      href={emailStatus.previewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="email-preview-link"
                    >
                      View Sent Email in Ethereal &rarr;
                    </a>
                  )}
                </div>
              )}

              <div className="email-modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setEmailModalOpen(false)}
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn-send"
                  disabled={sendingEmail}
                >
                  {sendingEmail ? "Sending..." : "Send Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="score-section-results">
        <div className="overall-score">
          <span>Overall fit</span>
          <strong>{analysis.matchScore}</strong>
          <small>/100</small>
        </div>

        <div className="score-grid sub-scores">
          {(analysis.sectionScores || []).map((item, idx) => (
            <ScoreCard
              key={item.section || item.label || idx}
              label={item.section || item.label || item.title || item.name || "Score"}
              title={item.section || item.label || item.title || item.name || "Score"}
              score={item.score}
            />
          ))}
        </div>
      </section>

      <section className="results-two-col">
        <div className="report-panel">
          <h2>Strengths</h2>
          <List items={analysis.strengths} empty="No strengths generated." />
        </div>
        <div className="report-panel">
          <h2>Weaknesses</h2>
          <List items={analysis.weaknesses} empty="No weaknesses generated." />
        </div>
      </section>

      <section className="results-two-col">
        <div className="report-panel">
          <h2>Matched Keywords</h2>
          <KeywordBox keywords={analysis.matchedKeywords} type="matched" />
        </div>
        <div className="report-panel">
          <h2>Missing Keywords</h2>
          <KeywordBox keywords={analysis.missingKeywords} type="missing" />
        </div>
      </section>

      {analysis.improvedSummary && (
        <section className="report-panel summary-panel">
          <h2>Improved Professional Summary</h2>
          <p className="summary-text">{analysis.improvedSummary}</p>
        </section>
      )}

      <section className="report-panel">
        <h2>Bullet Point Comparison</h2>
        <div className="bullet-list">
          {(analysis.bulletRewrites || []).map((item, index) => (
            <BulletComparison
              key={index}
              original={item.original}
              improved={item.improved}
              reason={item.reason}
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
