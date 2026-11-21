import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateInterviewPrep } from "../api/feature.js";
import "./InterviewPrep.css";

const ROLE_PRESETS = [
  "Full Stack Engineer (MERN)",
  "React & Frontend Engineer",
  "Node.js Backend Engineer",
  "DevOps & Cloud Engineer",
  "AI & ML Application Developer"
];

const InterviewPrep = () => {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [activePracticeIndex, setActivePracticeIndex] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  const generate = async (overrideRole) => {
    const targetRole = overrideRole || role;
    if (!targetRole.trim()) {
      setError("Please select or enter a target role.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const data = await generateInterviewPrep({ role: targetRole, difficulty });
      setResult(data);
      setActivePracticeIndex(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate interview questions.");
    } finally {
      setBusy(false);
    }
  };

  const handleSelectPreset = (preset) => {
    setRole(preset);
    generate(preset);
  };

  const togglePractice = (idx) => {
    setActivePracticeIndex(activePracticeIndex === idx ? null : idx);
  };

  const handleAnswerChange = (idx, text) => {
    setAnswers((prev) => ({ ...prev, [idx]: text }));
  };

  return (
    <FeatureShell
      title="Interview Simulation & Coach"
      subtitle="Practice role-specific technical and behavioral questions with structured STAR coaching hints."
    >
      <div className="interview-prep-wrapper">
        {/* Controls & Presets Card */}
        <section className="prep-config-panel">
          <div className="config-header">
            <div>
              <h3>Interview Simulation Setup</h3>
              <p>Choose your target role and difficulty level</p>
            </div>
            <div className="difficulty-badge-wrap">
              <span className="diff-label">Level:</span>
              <span className={`diff-pill ${difficulty.toLowerCase()}`}>{difficulty}</span>
            </div>
          </div>

          <div className="role-preset-chips">
            <span className="presets-label">Quick Roles:</span>
            {ROLE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className={`preset-chip ${role === preset ? "active" : ""}`}
                onClick={() => handleSelectPreset(preset)}
              >
                {preset}
              </button>
            ))}
          </div>

          <form
            className="prep-controls-form"
            onSubmit={(e) => {
              e.preventDefault();
              generate();
            }}
          >
            <div className="role-input-group">
              <input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Or enter custom role (e.g. Distributed Systems Engineer)"
                className="role-input"
              />
            </div>

            <div className="difficulty-select-group">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="difficulty-select"
              >
                <option value="Easy">Easy (Fundamentals)</option>
                <option value="Medium">Medium (Applied)</option>
                <option value="Hard">Hard (Staff / Deep)</option>
              </select>
            </div>

            <button
              type="submit"
              className="generate-prep-btn"
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner-dots" />
                  <span>Synthesizing Questions...</span>
                </>
              ) : (
                <>
                  <span>Generate Questions</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                </>
              )}
            </button>
          </form>

          {error && <div className="prep-error-banner">{error}</div>}
        </section>

        {/* Global Strategy Advice Banner */}
        {result?.advice?.length > 0 && (
          <section className="coaching-advice-banner">
            <div className="advice-header">
              <span className="advice-tag">STRATEGY</span>
              <div>
                <h4>Interview Execution Guidelines</h4>
                <p>Strategic pointers tailored to {result.title || role || "your role"}</p>
              </div>
            </div>
            <div className="advice-grid">
              {result.advice.map((tip, idx) => (
                <div key={idx} className="advice-item">
                  <span className="advice-num">{idx + 1}</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Question Cards Grid */}
        <section className="questions-container">
          {result?.questions?.length > 0 ? (
            result.questions.map((item, index) => {
              const isPracticing = activePracticeIndex === index;
              const currentAnswer = answers[index] || "";
              const wordCount = currentAnswer.trim() ? currentAnswer.trim().split(/\s+/).length : 0;
              const typeClass = item.type?.toLowerCase().includes("behavioral")
                ? "behavioral"
                : item.type?.toLowerCase().includes("system")
                ? "system"
                : "technical";

              return (
                <article className="interview-card" key={`${item.question}-${index}`}>
                  <div className="card-top-bar">
                    <span className={`question-type-badge ${typeClass}`}>
                      {item.type || "Technical"}
                    </span>
                    <span className="question-index-tag">Q{index + 1} of {result.questions.length}</span>
                  </div>

                  <h3 className="card-question-text">{item.question}</h3>

                  <div className="interviewer-hint-box">
                    <div className="hint-header">
                      <span className="hint-tag">KEY TALKING POINTS</span>
                      <strong>Architecture & Context Hint</strong>
                    </div>
                    <p className="hint-body">{item.hint}</p>
                  </div>

                  <div className="card-footer-action">
                    <button
                      type="button"
                      className={`practice-toggle-btn ${isPracticing ? "active" : ""}`}
                      onClick={() => togglePractice(index)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                      <span>{isPracticing ? "Close Answer Workbench" : "Practice Your Answer (STAR Mode)"}</span>
                    </button>
                  </div>

                  {/* Interactive Practice Workbench */}
                  {isPracticing && (
                    <div className="practice-workbench">
                      <div className="star-method-header">
                        <span className="star-tag">STAR Framework</span>
                        <div className="star-steps">
                          <span title="Situation: What was the context?"><b>S</b>ituation</span>
                          <span title="Task: What was your responsibility?"><b>T</b>ask</span>
                          <span title="Action: What engineering steps did you take?"><b>A</b>ction</span>
                          <span title="Result: What was the quantifiable metric?"><b>R</b>esult</span>
                        </div>
                      </div>

                      <textarea
                        rows="5"
                        placeholder="Structure your answer here using the STAR method:
• Situation: At my last internship/project...
• Task: I was tasked with optimizing the API latency...
• Action: I migrated MongoDB queries to index-backed lookups and introduced Redis caching...
• Result: Reduced p99 response times by 44%."
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        className="workbench-textarea"
                      />

                      <div className="workbench-footer">
                        <div className="word-count-badge">
                          <span>{wordCount} words</span>
                          <span className="count-hint">
                            {wordCount < 40 ? "(Target 80-150 words for 60-90s pitch)" : "Target answer length reached"}
                          </span>
                        </div>
                        <div className="workbench-actions">
                          <button
                            type="button"
                            className="wb-save-btn"
                            onClick={() => togglePractice(index)}
                          >
                            Save & Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="preview-empty-state">
              <div className="empty-icon-circle">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3>Interview Simulation</h3>
              <p>
                Select a target role preset above or enter a role title to generate role-aligned technical and behavioral questions.
              </p>
            </div>
          )}
        </section>
      </div>
    </FeatureShell>
  );
};

export default InterviewPrep;
