import { useState } from "react";
import "./LiveDiagnosticWidget.css";

const MODES = {
  ats: {
    label: "ATS Machine Scan",
    score: 86,
    subtext: "11 fixes found",
    fixesBadge: "4 PRIORITY FIXES",
    summary:
      "Your resume shows strong foundational content, but lacks critical technical terminology that ATS systems and recruiters expect. Your experience is solid, but the impact isn't clearly quantified.",
    metrics: [
      { label: "ATS parse rate", status: "pass", value: "98%" },
      { label: "Keyword coverage", status: "pass", value: "78%" },
      { label: "Impact metrics", status: "warn", value: "54%" },
      { label: "Bullet clarity", status: "pass", value: "90%" }
    ],
    items: [
      { type: "success", text: "Strong action verbs detected across all roles" },
      { type: "warn", text: "Missing metrics and quantifiable business results" },
      { type: "warn", text: "Cloud/DevOps keywords underrepresented for target role" }
    ],
    clusterTitle: "Missing keyword cluster",
    keywords: ["Docker", "CI/CD", "cloud deployment", "Kubernetes"],
    progress: 86
  },
  recruiter: {
    label: "Recruiter 6-Sec Scan",
    score: 64,
    subtext: "3 eyeball traps flagged",
    fixesBadge: "2 IMMEDIATE RISKS",
    summary:
      "A human hiring manager scans for title relevance, recent metrics, and seniority proof within 6 seconds. Your top third is text-heavy and delays your strongest accomplishments.",
    metrics: [
      { label: "Above-the-fold punch", status: "warn", value: "60%" },
      { label: "Role title alignment", status: "pass", value: "92%" },
      { label: "Outcome density", status: "warn", value: "48%" },
      { label: "Readability rhythm", status: "pass", value: "85%" }
    ],
    items: [
      { type: "success", text: "Clear professional identity and contact links" },
      { type: "warn", text: "Recent experience lacks quantified outcomes ($ or %)" },
      { type: "warn", text: "Dense paragraph summary pushes projects below fold" }
    ],
    clusterTitle: "Recruiter attention focus",
    keywords: ["Lead developer", "35% faster latency", "AWS microservices"],
    progress: 64
  }
};

const LiveDiagnosticWidget = () => {
  const [activeTab, setActiveTab] = useState("ats");
  const data = MODES[activeTab];

  // SVG Gauge calculations (radius = 54, circumference = 2 * PI * 54 = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (data.score / 100) * circumference;

  return (
    <div className="live-widget-wrapper">
      {/* Interactive Mode Toggle */}
      <div className="widget-toggle-bar">
        <button
          type="button"
          className={`toggle-tab ${activeTab === "ats" ? "active" : ""}`}
          onClick={() => setActiveTab("ats")}
        >
          <span className="dot ats-dot" />
          ATS Parse Layer
        </button>
        <button
          type="button"
          className={`toggle-tab ${activeTab === "recruiter" ? "active" : ""}`}
          onClick={() => setActiveTab("recruiter")}
        >
          <span className="dot rec-dot" />
          Recruiter 6s Scan
        </button>
      </div>

      <div className="diagnostic-card">
        {/* Brand Header */}
        <div className="card-brand-header">
          <div className="brand-badge">
            <span className="rf-glyph">RF</span>
            <span className="rf-name">RoleFit AI</span>
          </div>
          <div className="live-status-pill">
            <span className="pulse-beacon" />
            LIVE DIAGNOSTIC
          </div>
        </div>

        {/* Two-Column Grid */}
        <div className="card-content-grid">
          {/* Left Column: Radial Score & Indicators */}
          <div className="gauge-column">
            <span className="column-kicker">Resume Score</span>

            <div className="gauge-container">
              <svg className="radial-gauge" viewBox="0 0 136 136">
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
                <circle
                  className="gauge-bg"
                  cx="68"
                  cy="68"
                  r={radius}
                  strokeWidth="11"
                />
                <circle
                  className="gauge-progress"
                  cx="68"
                  cy="68"
                  r={radius}
                  strokeWidth="11"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="gauge-center-text">
                <span className="score-val">{data.score}</span>
                <span className="score-denom">/100</span>
              </div>
            </div>

            <p className="fixes-subtext">{data.subtext}</p>

            <ul className="signal-list">
              {data.metrics.map((m, idx) => (
                <li key={idx} className="signal-item">
                  <span className={`signal-dot ${m.status}`} />
                  <span className="signal-label">{m.label}</span>
                  <span className="signal-value">{m.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Content Feedback & Fixes */}
          <div className="feedback-column">
            <div className="feedback-header">
              <span className="feedback-title">CONTENT</span>
              <span className="fixes-badge">{data.fixesBadge}</span>
            </div>

            <p className="feedback-summary">{data.summary}</p>

            <ul className="action-items-list">
              {data.items.map((item, idx) => (
                <li key={idx} className={`action-item ${item.type}`}>
                  <span className="action-icon">
                    {item.type === "success" ? "✓" : "!"}
                  </span>
                  <span className="action-text">{item.text}</span>
                </li>
              ))}
            </ul>

            {/* Keyword Cluster Highlight Box */}
            <div className="cluster-highlight-box">
              <div className="cluster-meta">
                <div className="cluster-icon-chip" />
                <div className="cluster-info">
                  <span className="cluster-title">{data.clusterTitle}</span>
                  <div className="keyword-tags">
                    {data.keywords.map((kw, idx) => (
                      <span key={idx} className="keyword-tag-pill">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="scan-progress-track">
              <div
                className="scan-progress-bar"
                style={{ width: `${data.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDiagnosticWidget;
