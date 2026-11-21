import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateCoverLetter } from "../api/feature.js";
import "./CoverLetter.css";

const SAMPLE_LETTER_DATA = {
  company: "Stripe",
  role: "Full Stack Software Engineer",
  jd: "Looking for an engineer to build developer-first payments infrastructure. Key requirements: React, TypeScript, Node.js, distributed REST APIs, high availability, and attention to user experience."
};

const TONES = [
  { id: "impact", label: "High Conviction", desc: "Results-first tone linking past metrics to role needs" },
  { id: "formal", label: "Formal Executive", desc: "Classic corporate tone with structured appreciation" },
  { id: "startup", label: "Startup / Agile", desc: "Agile, passionate, bias towards shipping fast" }
];

const CoverLetter = () => {
  const [form, setForm] = useState({ company: "", role: "", jd: "" });
  const [selectedTone, setSelectedTone] = useState("impact");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleAutofill = () => {
    setForm(SAMPLE_LETTER_DATA);
    setError("");
  };

  const handleClear = () => {
    setForm({ company: "", role: "", jd: "" });
    setResult(null);
    setError("");
  };

  const generate = async () => {
    if (!form.company.trim() || !form.role.trim()) {
      setError("Please specify the Company Name and Role, or click 'Auto-fill Example'.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await generateCoverLetter(form);
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to generate cover letter.",
      );
    } finally {
      setBusy(false);
    }
  };

  const getFullLetterText = () => {
    if (!result) return "";
    return `${result.subject || "Cover Letter"}\n\n${result.salutation}\n\n${result.body}\n\n${result.closing}`;
  };

  const handleCopy = () => {
    const text = getFullLetterText();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const text = getFullLetterText();
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Cover_Letter_${(form.company || "Company").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <FeatureShell
      title="AI Cover Letter Generator"
      subtitle="Craft compelling, truthful letters tailored specifically to each job opening."
    >
      <section className="cover-layout">
        {/* Left Form Panel */}
        <div className="cover-form-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Target Position</h2>
              <p className="panel-subtitle">Provide company context for tailored alignment</p>
            </div>
            <div className="panel-actions">
              <button
                type="button"
                className="autofill-btn"
                onClick={handleAutofill}
                title="Fill with sample opening"
              >
                Auto-fill Example
              </button>
              {(form.company || result) && (
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
                <span className="field-label">Target Company</span>
                <input
                  value={form.company}
                  onChange={update("company")}
                  placeholder="e.g. Stripe, Google, Atlassian"
                  className="modern-input"
                />
              </label>

              <label className="field-group">
                <span className="field-label">Job Role</span>
                <input
                  value={form.role}
                  onChange={update("role")}
                  placeholder="e.g. Full Stack Engineer"
                  className="modern-input"
                />
              </label>
            </div>

            <div className="field-group">
              <span className="field-label">Narrative Tone</span>
              <div className="tone-pill-group">
                {TONES.map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    className={`tone-pill ${selectedTone === tone.id ? "active" : ""}`}
                    onClick={() => setSelectedTone(tone.id)}
                  >
                    <span>{tone.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <label className="field-group">
              <div className="field-header">
                <span className="field-label">Job Description / Requirements</span>
                <span className="field-hint">Paste full opening text</span>
              </div>
              <textarea
                value={form.jd}
                onChange={update("jd")}
                placeholder="Paste the key responsibilities, requirements, and tech stack from the job description..."
                className="modern-textarea cover-textarea"
                rows="6"
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
                <span>Crafting Custom Letter with Groq...</span>
              </>
            ) : (
              <>
                <span>Generate Tailored Cover Letter</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Right Preview Panel */}
        <div className="cover-preview-panel">
          <div className="preview-toolbar">
            <div className="preview-status">
              <span className="preview-dot" />
              <span>Tailored Document Preview</span>
            </div>
            {result && (
              <div className="preview-actions">
                <button
                  type="button"
                  className="preview-action-btn"
                  onClick={handleCopy}
                  title="Copy full letter"
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
                  title="Download letter as text"
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
              <div className="letterhead-sheet">
                <div className="letterhead-header">
                  <div className="letterhead-meta">
                    <span className="subject-kicker">APPLICATION SUBJECT</span>
                    <h2 className="letterhead-subject">{result.subject}</h2>
                  </div>
                  <div className="letterhead-badge">VERIFIED HUMAN TONE</div>
                </div>

                <div className="letterhead-divider" />

                <div className="letterhead-salutation">
                  {result.salutation}
                </div>

                <div className="letterhead-body">
                  {result.body?.split("\n\n").map((para, idx) => (
                    <p key={idx} className="letterhead-paragraph">{para}</p>
                  ))}
                </div>

                <div className="letterhead-closing">
                  {result.closing?.split("\n").map((line, idx) => (
                    <p key={idx} className="closing-line">{line}</p>
                  ))}
                </div>

                {result.highlights?.length > 0 && (
                  <div className="letterhead-highlights">
                    <span className="highlights-title">Key Narrative Strengths:</span>
                    <div className="highlights-pills">
                      {result.highlights.map((item, idx) => (
                        <span key={idx} className="highlight-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="preview-empty-state">
                <div className="empty-icon-circle">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
                <h3>Cover Letter Preview</h3>
                <p>
                  Enter the company name, role, and job description on the left to generate your tailored cover letter.
                </p>
                <button
                  type="button"
                  className="empty-action-btn"
                  onClick={handleAutofill}
                >
                  Load Sample Data
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </FeatureShell>
  );
};

export default CoverLetter;
