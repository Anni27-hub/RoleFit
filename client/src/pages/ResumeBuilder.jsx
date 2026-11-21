import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateResumeBuilder } from "../api/feature.js";
import "./ResumeBuilder.css";

const SAMPLE_PROFILE = {
  fullName: "Anish Agarwal",
  targetRole: "Full Stack Engineer (MERN / AI)",
  summary: "Results-driven Software Engineer with strong foundations in React, Node.js, Express, and MongoDB. Experienced in building scalable web architectures and AI-driven workflow tools.",
  skills: "React, Node.js, Express.js, MongoDB, JavaScript (ES6+), Groq API, REST APIs, Git, Tailwind CSS, Docker basics",
  projects: "RoleFit AI: Full-stack ATS resume optimization engine with real-time scoring, Groq Llama-3 parsing, and analytics.\nSecureAuth Portal: End-to-end authentication system featuring JWT token rotation, bcrypt hashing, and OAuth 2.0 integration.",
  experience: "Software Engineering Intern at TechLabs (6 mos): Developed responsive UI components in React and optimized Express backend routes, reducing API latency by 32%.\nMCA Academic Project Lead at BIT Mesra: Architected distributed microservices and managed continuous deployment workflows."
};

const ResumeBuilder = () => {
  const [form, setForm] = useState({
    fullName: "",
    targetRole: "",
    summary: "",
    skills: "",
    projects: "",
    experience: ""
  });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleAutofill = () => {
    setForm(SAMPLE_PROFILE);
    setError("");
  };

  const handleClear = () => {
    setForm({
      fullName: "",
      targetRole: "",
      summary: "",
      skills: "",
      projects: "",
      experience: ""
    });
    setResult(null);
    setError("");
  };

  const generate = async () => {
    if (!form.fullName.trim() && !form.targetRole.trim()) {
      setError("Please provide at least your Name and Target Role, or click 'Autofill Sample'.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await generateResumeBuilder(form);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate resume content.");
    } finally {
      setBusy(false);
    }
  };

  const handleCopy = () => {
    if (!result?.downloadText) return;
    navigator.clipboard.writeText(result.downloadText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!result?.downloadText) return;
    const blob = new Blob([result.downloadText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(form.fullName || "Resume").replace(/\s+/g, "_")}_RoleFit_Draft.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <FeatureShell
      title="AI Resume Builder"
      subtitle="Draft a clean ATS-compliant resume section by section, powered by Groq Llama-3."
    >
      <section className="builder-layout">
        {/* Left Form Panel */}
        <div className="builder-form-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Candidate Profile</h2>
              <p className="panel-subtitle">Fill your details or use our sample preset</p>
            </div>
            <div className="panel-actions">
              <button
                type="button"
                className="autofill-btn"
                onClick={handleAutofill}
                title="Fill with high-impact sample data"
              >
                Auto-fill Sample
              </button>
              {(form.fullName || result) && (
                <button
                  type="button"
                  className="clear-btn"
                  onClick={handleClear}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="form-fields">
            <div className="field-row-two">
              <label className="field-group">
                <span className="field-label">Full Name</span>
                <input
                  value={form.fullName}
                  onChange={update("fullName")}
                  placeholder="e.g. Anish Agarwal"
                  className="modern-input"
                />
              </label>

              <label className="field-group">
                <span className="field-label">Target Role</span>
                <input
                  value={form.targetRole}
                  onChange={update("targetRole")}
                  placeholder="e.g. Software Engineer"
                  className="modern-input"
                />
              </label>
            </div>

            <label className="field-group">
              <div className="field-header">
                <span className="field-label">Professional Summary</span>
                <span className="field-hint">2-3 high impact lines</span>
              </div>
              <textarea
                rows="3"
                value={form.summary}
                onChange={update("summary")}
                placeholder="Brief summary of your technical background and career objective..."
                className="modern-textarea"
              />
            </label>

            <label className="field-group">
              <div className="field-header">
                <span className="field-label">Technical Skills</span>
                <span className="field-hint">Comma separated</span>
              </div>
              <textarea
                rows="2"
                value={form.skills}
                onChange={update("skills")}
                placeholder="e.g. React, Node.js, Express, MongoDB, Docker, Git"
                className="modern-textarea"
              />
            </label>

            <label className="field-group">
              <div className="field-header">
                <span className="field-label">Featured Projects</span>
                <span className="field-hint">Include quantifiable impact</span>
              </div>
              <textarea
                rows="4"
                value={form.projects}
                onChange={update("projects")}
                placeholder="Project title, key technologies, and measurable results achieved..."
                className="modern-textarea"
              />
            </label>

            <label className="field-group">
              <div className="field-header">
                <span className="field-label">Work Experience</span>
                <span className="field-hint">Internships, campus roles, freelance</span>
              </div>
              <textarea
                rows="4"
                value={form.experience}
                onChange={update("experience")}
                placeholder="Role, company/lab, timeframe, and core contributions..."
                className="modern-textarea"
              />
            </label>
          </div>

          {error && <div className="form-error-banner">{error}</div>}

          <button
            className="generate-submit-btn"
            type="button"
            onClick={generate}
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner-dots" />
                <span>Optimizing with Groq AI...</span>
              </>
            ) : (
              <>
                <span>Generate ATS Resume Draft</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="builder-preview-panel">
          <div className="preview-toolbar">
            <div className="preview-status">
              <span className="preview-dot" />
              <span>ATS Standard (Single Column)</span>
            </div>
            {result && (
              <div className="preview-actions">
                <button
                  type="button"
                  className="preview-action-btn"
                  onClick={handleCopy}
                  title="Copy full resume text"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <button
                  type="button"
                  className="preview-action-btn highlight"
                  onClick={handleDownload}
                  title="Download as clean text file"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download .txt</span>
                </button>
              </div>
            )}
          </div>

          <div className="preview-body">
            {result ? (
              <div className="document-sheet">
                <header className="sheet-header">
                  <h1 className="sheet-name">{result.headline?.split(" - ")[0] || form.fullName || "Candidate Name"}</h1>
                  <p className="sheet-role">{result.headline?.split(" - ")[1] || form.targetRole || "Software Professional"}</p>
                </header>

                <div className="sheet-divider" />

                <section className="sheet-section">
                  <h3 className="sheet-section-title">PROFESSIONAL SUMMARY</h3>
                  <p className="sheet-summary">{result.summary}</p>
                </section>

                {result.sections?.map((section) => (
                  <section key={section.title} className="sheet-section">
                    <h3 className="sheet-section-title">{section.title.toUpperCase()}</h3>
                    <ul className="sheet-bullets">
                      {section.bullets?.map((bullet, idx) => (
                        <li key={idx}>
                          <span className="bullet-marker">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}

                {result.atsTips?.length > 0 && (
                  <div className="sheet-ats-callout">
                    <div className="callout-header">
                      <span className="callout-tag">ATS SIGNALS</span>
                      <strong>Optimization Notes</strong>
                    </div>
                    <ul className="callout-tips">
                      {result.atsTips.map((tip, idx) => (
                        <li key={idx}>
                          <span className="tip-check">✓</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-empty-state">
                <div className="empty-icon-circle">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <h3>Resume Draft Preview</h3>
                <p>
                  Fill your background details on the left to produce a clean, single-column ATS resume draft.
                </p>
                <button
                  type="button"
                  className="empty-action-btn"
                  onClick={handleAutofill}
                >
                  Load Sample Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </FeatureShell>
  );
};

export default ResumeBuilder;
