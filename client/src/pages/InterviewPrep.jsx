import { useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import { generateInterviewPrep } from "../api/feature.js";
import "./InterviewPrep.css";

const InterviewPrep = () => {
  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setBusy(true);
    try {
      const data = await generateInterviewPrep({ role, difficulty });
      setResult(data);
    } finally {
      setBusy(false);
    }
  };

  return (
    <FeatureShell
      title="Interview Prep"
      subtitle="Practice with questions aligned to your target role and the way you present your work."
    >
      <section className="prep-controls">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <button
          type="button"
          className="submit-btn"
          onClick={generate}
          disabled={busy}
        >
          {busy ? "Generating..." : "Generate questions"}
        </button>
      </section>

      <section className="question-list">
        {(result?.questions?.length ? result.questions : []).map(
          (item, index) => (
            <div className="question-card" key={`${item.question}-${index}`}>
              <span>{item.type}</span>
              <h3>{item.question}</h3>
              <p>{item.hint}</p>
              <button type="button" className="submit-btn practice-btn">
                Practice answer
              </button>
            </div>
          ),
        )}

        {!result && (
          <div className="empty-state full-width">
            <h2>Generate questions first</h2>
            <p>
              Enter the target role and let the app produce interview prep
              suggestions.
            </p>
          </div>
        )}
      </section>
    </FeatureShell>
  );
};

export default InterviewPrep;
