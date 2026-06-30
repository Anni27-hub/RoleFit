import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateCoverLetter } from "../api/feature.js";
import "./CoverLetter.css";

const CoverLetter = () => {
  const [form, setForm] = useState({ company: "", role: "", jd: "" });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const generate = async () => {
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

  return (
    <FeatureShell
      title="AI Cover Letter Generator"
      subtitle="Generate a tailored cover letter that sounds human, not inflated."
    >
      <section className="cover-layout">
        <div className="panel cover-form">
          <label>
            <span>Company name</span>
            <input
              value={form.company}
              onChange={update("company")}
              placeholder="Google"
            />
          </label>
          <label>
            <span>Job role</span>
            <input
              value={form.role}
              onChange={update("role")}
              placeholder="Software Engineer"
            />
          </label>
          <label>
            <span>Job description</span>
            <textarea
              value={form.jd}
              onChange={(e) => {
                update("jd")(e);
                e.target.style.height = "auto";
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              placeholder="Paste the job description here..."
              rows="1"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button
            className="submit-btn"
            type="button"
            onClick={generate}
            disabled={busy}
          >
            {busy ? "Generating..." : "Generate cover letter"}
          </button>
        </div>

        <div className="panel cover-preview">
          {result ? (
            <>
              <p className="cover-meta">{result.subject}</p>
              <h2>{result.salutation}</h2>
              <pre>{result.body}</pre>
              <pre>{result.closing}</pre>
              <div className="cover-highlights">
                {result.highlights?.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>Your letter will appear here</h2>
              <p>
                Use the job context to generate a concise, tailored letter with
                Groq.
              </p>
            </div>
          )}
        </div>
      </section>
    </FeatureShell>
  );
};

export default CoverLetter;
