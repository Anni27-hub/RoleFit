import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateResumeBuilder } from "../api/feature.js";
import "./ResumeBuilder.css";

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

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const generate = async () => {
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

  return (
    <FeatureShell
      title="AI Resume Builder"
      subtitle="Build a clean ATS-friendly resume draft, then refine it section by section."
    >
      <section className="builder-layout">
        <div className="builder-form panel">
          <label><span>Full name</span><input value={form.fullName} onChange={update("fullName")} placeholder="Anish Agarwal" /></label>
          <label><span>Target role</span><input value={form.targetRole} onChange={update("targetRole")} placeholder="Software Engineer" /></label>
          <label><span>Summary</span><textarea rows="4" value={form.summary} onChange={update("summary")} placeholder="2-3 lines about your background" /></label>
          <label><span>Skills</span><textarea rows="4" value={form.skills} onChange={update("skills")} placeholder="React, Node.js, MongoDB, ..." /></label>
          <label><span>Projects</span><textarea rows="4" value={form.projects} onChange={update("projects")} placeholder="Project names with impact" /></label>
          <label><span>Experience</span><textarea rows="4" value={form.experience} onChange={update("experience")} placeholder="Internships, freelance, campus work" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="submit-btn" type="button" onClick={generate} disabled={busy}>
            {busy ? "Generating..." : "Generate resume draft"}
          </button>
        </div>

        <div className="builder-preview panel">
          {result ? (
            <>
              <h2>{result.headline}</h2>
              <p>{result.summary}</p>
              {result.sections?.map((section) => (
                <article key={section.title} className="builder-section">
                  <h3>{section.title}</h3>
                  <ul>{section.bullets?.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>
                </article>
              ))}
              <article className="builder-section">
                <h3>ATS tips</h3>
                <ul>{result.atsTips?.map((tip) => <li key={tip}>{tip}</li>)}</ul>
              </article>
              <pre className="builder-download">{result.downloadText}</pre>
            </>
          ) : (
            <div className="empty-state">
              <h2>Your draft will appear here</h2>
              <p>Fill the form and generate a truthful ATS-friendly resume draft with Groq.</p>
            </div>
          )}
        </div>
      </section>
    </FeatureShell>
  );
};

export default ResumeBuilder;
