import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateSkillRoadmap } from "../api/feature.js";
import "./SkillRoadmap.css";

const ROADMAP_PRESETS = [
  {
    role: "Full Stack Developer (MERN)",
    skills: "Docker, CI/CD with GitHub Actions, Redis Caching, System Design, JWT Refresh Tokens"
  },
  {
    role: "Cloud & DevOps Engineer",
    skills: "Kubernetes, Terraform, AWS ECS/EKS, Prometheus, Grafana, Linux internals"
  },
  {
    role: "AI & GenAI Solutions Engineer",
    skills: "LangChain, Vector Databases (Pinecone/Chroma), RAG Architecture, Groq API, Model Evaluation"
  }
];

const SkillRoadmap = () => {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const generate = async (overrideRole, overrideSkills) => {
    const targetRole = overrideRole || role;
    const targetSkills = overrideSkills || skills;
    if (!targetRole.trim()) {
      setError("Please specify a target role or choose a preset.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await generateSkillRoadmap({ role: targetRole, skills: targetSkills });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate skill roadmap.");
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setRole(preset.role);
    setSkills(preset.skills);
    generate(preset.role, preset.skills);
  };

  const handleOpenResource = (resource, skill) => {
    const query = encodeURIComponent(`${skill} ${resource} tutorial documentation`);
    window.open(`https://www.google.com/search?q=${query}`, "_blank");
  };

  return (
    <FeatureShell
      title="Skill Roadmap & Growth Path"
      subtitle="Bridge the missing keyword gap with structured learning milestones and project proof."
    >
      <div className="roadmap-wrapper">
        {/* KPI Metrics Row */}
        <section className="roadmap-kpi-grid">
          <div className="kpi-card milestones">
            <div className="kpi-top">
              <span className="kpi-label">Milestones Identified</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{result?.milestones?.length || (result ? 0 : "--")}</div>
            <div className="kpi-sub">Prioritized learning steps</div>
          </div>

          <div className="kpi-card role-target">
            <div className="kpi-top">
              <span className="kpi-label">Target Career Track</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </span>
            </div>
            <div className="kpi-target-text">{result?.title || role || "Software Engineer"}</div>
            <div className="kpi-sub">Role alignment level</div>
          </div>

          <div className="kpi-card capstone">
            <div className="kpi-top">
              <span className="kpi-label">Portfolio Capstone</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{result?.nextProject ? "Ready" : "--"}</div>
            <div className="kpi-sub">Resume-worthy proof project</div>
          </div>
        </section>

        {/* Controls Card */}
        <section className="roadmap-controls-panel">
          <div className="controls-header">
            <div>
              <h3>Roadmap Generator</h3>
              <p>Enter the missing skills or pick a preset career path</p>
            </div>
            <span className="controls-badge">AI PATHFINDER</span>
          </div>

          <div className="roadmap-presets-bar">
            <span className="preset-label">Career Presets:</span>
            {ROADMAP_PRESETS.map((preset) => (
              <button
                key={preset.role}
                type="button"
                className={`preset-pill ${role === preset.role ? "active" : ""}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset.role}
              </button>
            ))}
          </div>

          <form
            className="roadmap-inputs-grid"
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
          >
            <div className="input-field-wrap">
              <label>
                <span className="field-lbl">Target Role</span>
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="modern-input"
                />
              </label>
            </div>

            <div className="input-field-wrap">
              <label>
                <span className="field-lbl">Missing Skills / Job Keywords</span>
                <textarea
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows="3"
                  placeholder="e.g. Docker, CI/CD, Kubernetes, Redis, Microservices, TypeScript"
                  className="modern-textarea"
                />
              </label>
            </div>

            {error && <div className="form-error-banner">{error}</div>}

            <button
              type="submit"
              className="generate-submit-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner-dots" />
                  <span>Synthesizing Learning Roadmap...</span>
                </>
              ) : (
                <>
                  <span>Generate Career Roadmap</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Roadmap Milestones Journey */}
        <section className="milestones-timeline-section">
          {result?.milestones?.length > 0 ? (
            <>
              <div className="timeline-section-header">
                <h3>Recommended Learning Sequence</h3>
                <span className="timeline-subtitle">Step-by-step progression to close technical gaps</span>
              </div>

              <div className="milestones-list">
                {result.milestones.map((item, index) => {
                  const priorityClass = item.priority?.toLowerCase() || "medium";
                  return (
                    <article className="milestone-card" key={`${item.skill}-${index}`}>
                      <div className="milestone-node">
                        <span className="node-number">0{index + 1}</span>
                        <div className="node-line" />
                      </div>

                      <div className="milestone-content">
                        <div className="milestone-top">
                          <h4 className="milestone-title">{item.skill}</h4>
                          <div className="milestone-badges">
                            <span className={`priority-badge ${priorityClass}`}>
                              {item.priority} Priority
                            </span>
                            <span className="duration-badge">⏱️ {item.duration}</span>
                          </div>
                        </div>

                        <p className="milestone-summary">
                          Recommended curriculum focus and hands-on implementation guide.
                        </p>

                        <div className="milestone-footer">
                          <button
                            type="button"
                            className="resource-link-btn"
                            onClick={() => handleOpenResource(item.resource, item.skill)}
                            title="Search recommended documentation and guides"
                          >
                            <span>Docs: {item.resource}</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Capstone Proof Project Callout */}
              {result.nextProject && (
                <div className="capstone-callout-card">
                  <div className="capstone-icon-badge">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <div className="capstone-details">
                    <span className="capstone-tag">RECOMMENDED PROOF PROJECT</span>
                    <h4 className="capstone-title">{result.nextProject}</h4>
                    <p className="capstone-desc">
                      Building this project will demonstrate practical mastery of your missing skills directly on your resume.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="preview-empty-state">
              <div className="empty-icon-circle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h3>Skill Roadmap Preview</h3>
              <p>
                Select a career preset above or enter missing skills to generate your prioritized learning milestones.
              </p>
            </div>
          )}
        </section>
      </div>
    </FeatureShell>
  );
};

export default SkillRoadmap;
