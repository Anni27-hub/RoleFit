import { Link, useLocation } from "react-router-dom";
import "./FeatureShell.css";

const WORKSPACE_TOOLS = [
  {
    name: "Resume Builder",
    to: "/resume-builder",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    ),
  },
  {
    name: "Cover Letter",
    to: "/cover-letter",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
  },
  {
    name: "Job Tracker",
    to: "/job-tracker",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
  },
  {
    name: "Interview Prep",
    to: "/interview-prep",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
  },
  {
    name: "Skill Roadmap",
    to: "/skill-roadmap",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
  },
];

const FeatureShell = ({ title, subtitle, children, currentPath }) => {
  const location = useLocation();
  const activePath = currentPath || location.pathname;

  return (
    <main className="feature-page">
      {/* Top ambient glow bar */}
      <div className="feature-ambient-glow" aria-hidden="true" />

      <header className="feature-navbar">
        <div className="feature-nav-left">
          <Link to="/" className="logo">
            <span className="logo-mark">RF</span>
            <div className="logo-text">
              <span className="logo-title">RoleFit AI</span>
              <span className="logo-badge">WORKSPACE</span>
            </div>
          </Link>
          <div className="nav-breadcrumb">
            <span className="crumb-sep">/</span>
            <Link to="/" className="crumb-link">Home</Link>
            <span className="crumb-sep">/</span>
            <span className="crumb-active">{title}</span>
          </div>
        </div>

        <div className="feature-nav-right">
          <Link to="/" className="back-home-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Feature Switcher Pills */}
      <nav className="feature-switcher-bar" aria-label="Workspace Tools">
        <div className="feature-switcher-inner">
          {WORKSPACE_TOOLS.map((tool) => {
            const isActive = activePath === tool.to;
            return (
              <Link
                key={tool.to}
                to={tool.to}
                className={`switcher-pill ${isActive ? "active" : ""}`}
              >
                <span className="pill-icon">{tool.icon}</span>
                <span className="pill-name">{tool.name}</span>
                {isActive && <span className="pill-indicator" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <section className="feature-hero">
        <div className="hero-kicker-badge">
          <span className="kicker-beacon" />
          <span>AI SUITE 2.0</span>
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </section>

      <div className="feature-content-wrapper">
        {children}
      </div>
    </main>
  );
};

export default FeatureShell;
