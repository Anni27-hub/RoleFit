import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateSkillRoadmap } from "../api/feature.js";
import "./SkillRoadmap.css";

const SkillRoadmap = () => {
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const data = await generateSkillRoadmap({ role, skills });
      setResult(data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FeatureShell
      title="Skill Roadmap"
      subtitle="Turn the missing keywords into a practical learning plan and visible project proof."
    >
      <section className="roadmap-summary">
        <div className="summary-card">
          <h2>{result?.milestones?.length || 0}</h2>
          <p>Milestones</p>
        </div>
        <div className="summary-card">
          <h2>{result?.title || "Roadmap"}</h2>
          <p>Target role</p>
        </div>
        <div className="summary-card">
          <h2>{result?.nextProject ? "Ready" : "--"}</h2>
          <p>Next project</p>
        </div>
      </section>

      <section className="roadmap-controls">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role"
        />
        <textarea
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          rows="4"
          placeholder="Missing skills or JD keywords"
        />
        <button
          type="button"
          className="submit-btn"
          onClick={generate}
          disabled={busy}
        >
          {busy ? "Generating..." : "Generate roadmap"}
        </button>
      </section>

      <section className="roadmap-container">
        {result?.milestones?.map((item, index) => (
          <div className="roadmap-card" key={`${item.skill}-${index}`}>
            <div>
              <h2>{item.skill}</h2>
              <p>
                Priority: <span>{item.priority}</span>
              </p>
              <p>Duration: {item.duration}</p>
            </div>
            <button type="button" className="submit-btn roadmap-link-btn">
              {item.resource}
            </button>
          </div>
        ))}

        {result && <div className="roadmap-note">{result.nextProject}</div>}
      </section>
    </FeatureShell>
  );
};

export default SkillRoadmap;
