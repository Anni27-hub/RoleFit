import { useState } from "react";
import "./HeroBentoGrid.css";

const SKILLS = [
  { name: "React 18", score: "98%", status: "match" },
  { name: "Node.js", score: "96%", status: "match" },
  { name: "Express", score: "94%", status: "match" },
  { name: "MongoDB", score: "92%", status: "match" },
  { name: "REST APIs", score: "96%", status: "match" },
  { name: "JWT Auth", score: "95%", status: "match" },
  { name: "Docker", score: "88%", status: "match" },
  { name: "CI/CD", score: "86%", status: "match" }
];

const HeroBentoGrid = () => {
  const [activeTab, setActiveTab] = useState("after");
  const [activeSkill, setActiveSkill] = useState(null);

  return (
    <div className="bento-container">
      {/* CARD 1: Shortlist Percentile & Match Predictor */}
      <div className="bento-card bento-card-score">
        <div className="card-glass-glow" />
        <div className="bento-card-header">
          <span className="bento-pill pill-cyan">
            <span className="bento-pulse-dot" />
            TOP 6% APPLICANT
          </span>
          <span className="bento-role-tag">SDE I / II</span>
        </div>

        <div className="bento-stat-block">
          <div className="bento-number-wrap">
            <span className="bento-big-stat">94</span>
            <span className="bento-stat-unit">%</span>
          </div>
          <p className="bento-stat-desc">
            Shortlist Probability across modern ATS filters
          </p>
        </div>

        <div className="bento-mini-checks">
          <div className="mini-check-item">
            <span className="check-ico">✓</span>
            <span>Single-column ATS flow</span>
          </div>
          <div className="mini-check-item">
            <span className="check-ico">✓</span>
            <span>0 Parsing conflicts</span>
          </div>
        </div>
      </div>

      {/* CARD 2: Live AI Bullet Optimizer (Google X-Y-Z Method) */}
      <div className="bento-card bento-card-rewrite">
        <div className="card-glass-glow" />
        <div className="bento-card-header">
          <span className="bento-pill pill-violet">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "4px" }}>
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            GROQ LLM ENHANCER
          </span>
          <div className="rewrite-toggle-mini">
            <button
              type="button"
              className={activeTab === "before" ? "active" : ""}
              onClick={() => setActiveTab("before")}
            >
              Weak
            </button>
            <button
              type="button"
              className={activeTab === "after" ? "active" : ""}
              onClick={() => setActiveTab("after")}
            >
              Optimized
            </button>
          </div>
        </div>

        <div className="bullet-rewrite-display">
          {activeTab === "before" ? (
            <div className="bullet-box box-before animate-fade">
              <span className="bullet-tag tag-weak">ORIGINAL CANDIDATE BULLET</span>
              <p className="bullet-text">
                "Built web application features using React and Node.js and helped teammates fix database bugs."
              </p>
              <div className="flaw-pills">
                <span>Missing measurable metrics</span>
                <span>Passive action verb</span>
              </div>
            </div>
          ) : (
            <div className="bullet-box box-after animate-fade">
              <span className="bullet-tag tag-strong">GOOGLE X-Y-Z REWRITE</span>
              <p className="bullet-text">
                "Architected React &amp; Node.js microservices handling <strong>120k+</strong> daily requests, cutting database latency by <strong>45%</strong> using Redis caching."
              </p>
              <div className="gain-pills">
                <span className="gain-chip">+45% Speed</span>
                <span className="gain-chip">120k req/day</span>
                <span className="gain-chip">Redis</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CARD 3: Deep Technical Alignment & Keyword Cloud (Full Width Bottom) */}
      <div className="bento-card bento-card-skills">
        <div className="card-glass-glow" />
        <div className="bento-card-header">
          <span className="bento-pill pill-emerald">
            <span className="matrix-ico">◈</span>
            SEMANTIC KEYWORD MATRIX
          </span>
          <span className="bento-accuracy-note">16 Core Signals Matched</span>
        </div>

        <p className="skills-sublabel">
          Hover over detected hard skills to inspect ATS parsing confidence:
        </p>

        <div className="bento-skills-cloud">
          {SKILLS.map((s, idx) => (
            <div
              key={idx}
              className={`bento-skill-chip ${activeSkill === s.name ? "hovered" : ""}`}
              onMouseEnter={() => setActiveSkill(s.name)}
              onMouseLeave={() => setActiveSkill(null)}
            >
              <span className="chip-bullet">✓</span>
              <span className="chip-name">{s.name}</span>
              <span className="chip-score">{s.score}</span>
            </div>
          ))}
        </div>

        <div className="bento-bottom-bar">
          <div className="verdict-status">
            <span className="status-indicator-dot" />
            <strong>ATS Status:</strong>
            <span>Interview Shortlist Candidate</span>
          </div>
          <div className="engine-meta">
            <span>Powered by Groq Llama 3.3 &bull; Sub-5ms Local Fallback</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBentoGrid;
