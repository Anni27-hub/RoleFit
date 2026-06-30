import ResumeGrader from "../assets/Resume_grader.png";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { uploadResume, runAnalysis } from "../api/resume.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import "./Home.css";

const scoreSteps = [
  {
    number: "01",
    title: "ATS readability",
    text: "RoleFit checks whether your file, headings, links, dates, and sections can be understood by common applicant tracking systems.",
  },
  {
    number: "02",
    title: "Recruiter quality",
    text: "The second layer reviews impact, clarity, role relevance, red flags, and whether your bullets prove the skills the job description asks for.",
  },
];

const checkGroups = [
  {
    title: "ATS essentials",
    items: [
      "File type and size",
      "Readable headings",
      "Contact links",
      "Date consistency",
    ],
  },
  {
    title: "Resume content",
    items: [
      "ATS parse rate",
      "Impact metrics",
      "Repeated phrases",
      "Bullet strength",
    ],
  },
  {
    title: "Job tailoring",
    items: [
      "Hard skill match",
      "Soft skill match",
      "Action verbs",
      "Target title fit",
    ],
  },
  {
    title: "Recruiter signals",
    items: [
      "Credibility",
      "Seniority fit",
      "Leadership proof",
      "Interview risks",
    ],
  },
];

const faqs = [
  {
    question: "What does the resume score mean?",
    answer:
      "It is a practical fit score based on ATS readability, keyword overlap, resume structure, measurable impact, and role relevance.",
  },
  {
    question: "Can I use this for every job application?",
    answer:
      "Yes. Paste a new job description each time and RoleFit AI will generate a fresh analysis for that role.",
  },
  {
    question: "Should I add every missing keyword?",
    answer:
      "Only add keywords you can honestly support with experience, projects, tools, or learning evidence.",
  },
  {
    question: "Does this replace human resume review?",
    answer:
      "No. It gives you a strong first pass before you apply, then you can still refine the final version manually.",
  },
];

const defaultFaqOpen = faqs[0].question;

const featureShortcuts = [
  {
    to: "/resume-builder",
    title: "Resume Builder",
    text: "Draft a cleaner ATS-friendly resume section by section.",
    tone: "emerald",
  },
  {
    to: "/cover-letter",
    title: "Cover Letter",
    text: "Generate a tailored letter that matches the opening.",
    tone: "blue",
  },
  {
    to: "/job-tracker",
    title: "Job Tracker",
    text: "Keep applications, statuses, and follow-ups organized.",
    tone: "violet",
  },
  {
    to: "/interview-prep",
    title: "Interview Prep",
    text: "Turn the role into questions, hints, and talking points.",
    tone: "coral",
  },
  {
    to: "/skill-roadmap",
    title: "Skill Roadmap",
    text: "Convert missing keywords into a practical learning plan.",
    tone: "sky",
  },
];

const Home = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(defaultFaqOpen);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const validTypes = [".pdf", ".docx"];
    const ext = "." + selected.name.split(".").pop().toLowerCase();
    if (!validTypes.includes(ext)) {
      setError("Only PDF and DOCX files are supported.");
      return;
    }

    setError("");
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const selected = e.dataTransfer.files[0];
    if (!selected) return;
    handleFileChange({ target: { files: [selected] } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/auth", { state: { from: "/" } });
      return;
    }
    if (!file) return setError("Upload a resume first.");
    if (!jobDescription.trim()) return setError("Paste the job description.");

    setError("");
    try {
      setStatus("uploading");
      const { resumeId } = await uploadResume(file);

      setStatus("analyzing");
      const analysis = await runAnalysis({
        resumeId,
        jobDescription,
        jobTitle,
      });
      if (analysis.user) {
        updateUser(analysis.user);
      }

      navigate(`/results/${analysis._id}`);
    } catch (err) {
      setStatus("error");
      setError(
        err.response?.data?.message || "Something went wrong. Try again.",
      );
    }
  };

  const isBusy = status === "uploading" || status === "analyzing";
  const buttonLabel =
    status === "uploading"
      ? "Reading resume..."
      : status === "analyzing"
        ? "Analyzing against the JD..."
        : "Analyze my resume";

  const renderUploadForm = (compact = false) => (
    <form
      className={`analyze-form ${compact ? "compact-form" : ""}`}
      onSubmit={handleSubmit}
    >
      <label
        className={`dropzone ${file ? "has-file" : ""}`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
          hidden
        />
        <span className="upload-orb" aria-hidden="true">
          {file ? "OK" : "UP"}
        </span>
        <span className="dropzone-title">
          {file ? file.name : "Drop your resume here or choose a file"}
        </span>
        <span className="dropzone-sub">
          PDF and DOCX only. Max 5MB file size.
        </span>
      </label>

      <div className="input-grid">
        <label className="field">
          <span>
            Job title <em>optional</em>
          </span>
          <input
            className="text-input"
            placeholder="e.g. Software Engineer"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
          />
        </label>

        <label className="field field-wide">
          <span>Job description</span>
          <textarea
            className="text-input textarea"
            placeholder="Paste the full job description here..."
            rows={compact ? 5 : 8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="submit-btn" disabled={isBusy}>
        <span>{buttonLabel}</span>
        <span aria-hidden="true">&rarr;</span>
      </button>
    </form>
  );

  const renderFaq = () =>
    faqs.map((faq) => {
      const isOpen = openFaq === faq.question;
      return (
        <button
          key={faq.question}
          type="button"
          className={`faq-item ${isOpen ? "open" : ""}`}
          onClick={() => setOpenFaq(isOpen ? "" : faq.question)}
        >
          <div className="faq-question">
            <h3>{faq.question}</h3>
            <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
          </div>
          {isOpen && <p>{faq.answer}</p>}
        </button>
      );
    });

  return (
    <div className="home">
      <nav className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark">RF</span>
          <span>RoleFit AI</span>
        </Link>

        <div className="nav-links" aria-label="Primary navigation">
          <a href="#score">Score</a>
          <a href="#checks">Checks</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
          {isAuthenticated && <Link to="/history">History</Link>}
          {isAuthenticated && <Link to="/premium">Premium</Link>}
          <button className="theme-toggle" type="button" onClick={toggleTheme}>
            {theme === "dark" ? "Light" : "Dark"}
          </button>
          {isAuthenticated ? (
            <button className="nav-button" onClick={logout}>
              Logout {user?.name ? `(${user.name.split(" ")[0]})` : ""}
            </button>
          ) : (
            <Link to="/auth">Sign in</Link>
          )}
        </div>
      </nav>

      <main>
        <section className="hero" id="checker">
          <div className="hero-copy animate-rise">
            <p className="section-kicker">Resume checker</p>
            <h1>Is your resume strong enough for this opening?</h1>
            <p className="hero-text">
              Upload your resume, paste the job description, and get a practical
              role-fit report with ATS keywords, missing skills, rewrite
              suggestions, and recruiter-focused fixes.
            </p>

            <div className="trust-row">
              <span>ATS readability</span>
              <span>Groq-powered analysis</span>
              <span>JD keyword matching</span>
            </div>

            {renderUploadForm()}
          </div>

<div
            className="hero-preview animate-rise"
            aria-label="Resume report preview"
          >
            <div className="report-window">
              <div className="window-brand">
                <span className="mini-logo">RF</span>
                <strong>RoleFit AI</strong>
              </div>

              <div className="report-layout">
                <aside className="score-sidebar">
                  <p>Resume Score</p>
                  <div className="score-dial">
                    <strong>86</strong>
                    <small>/100</small>
                  </div>
                  <span className="issue-count">11 fixes found</span>
                  <ul>
                    <li>
                      <span></span>ATS parse rate
                    </li>
                    <li>
                      <span></span>Keyword coverage
                    </li>
                    <li>
                      <span></span>Impact metrics
                    </li>
                    <li>
                      <span></span>Bullet clarity
                    </li>
                  </ul>
                </aside>

                <section className="report-main">
                  <div className="report-header">
                    <span>Content</span>
                    <b>4 priority fixes</b>
                  </div>
                  
                  <div style={{padding: '24px 22px', lineHeight: '1.6'}}>
                    <p style={{margin: '0 0 14px', color: '#a8b6c7', fontSize: '0.95rem'}}>
                      Your resume shows strong foundational content, but lacks critical technical terminology that ATS systems and recruiters expect. Your experience is solid, but the impact isn't clearly quantified.
                    </p>
                    <div style={{display: 'grid', gap: '10px'}}>
                      <div style={{display: 'flex', gap: '10px', color: '#a8b6c7', fontSize: '0.9rem'}}>
                        <span style={{color: '#34d399', fontWeight: '600'}}>✓</span>
                        <span>Strong action verbs detected</span>
                      </div>
                      <div style={{display: 'flex', gap: '10px', color: '#a8b6c7', fontSize: '0.9rem'}}>
                        <span style={{color: '#fb7185', fontWeight: '600'}}>!</span>
                        <span>Missing metrics and quantifiable results</span>
                      </div>
                      <div style={{display: 'flex', gap: '10px', color: '#a8b6c7', fontSize: '0.9rem'}}>
                        <span style={{color: '#fb7185', fontWeight: '600'}}>!</span>
                        <span>Cloud/DevOps keywords underrepresented</span>
                      </div>
                    </div>
                  </div>

                  <div className="keyword-card">
                    <span className="keyword-icon"></span>
                    <div>
                      <strong>Missing keyword cluster</strong>
                      <p>Docker, CI/CD, cloud deployment</p>
                    </div>
                  </div>
                  <div className="meter">
                    <span></span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        <section className="score-section" id="score">
          <div className="machine-visual">
            <img
              src={ResumeGrader}
              alt="AI Resume Analyzer"
              className="machine-image"
            />
          </div>
          <div className="score-copy">
            <p className="section-kicker">Two-layer scoring</p>
            <h2>
              RoleFit AI scores what ATS systems parse and what recruiters
              actually read.
            </h2>
            <p>
              A resume can pass software and still feel weak to a hiring
              manager. RoleFit AI looks at both sides, then gives you fixes that
              are specific to the job description.
            </p>

            <div className="score-steps">
              {scoreSteps.map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="dark-checks" id="checks">
          <div className="dark-intro">
            <p className="section-kicker">More than typos</p>
            <h2>
              The AI checker reviews your resume across recruiter and ATS
              categories.
            </h2>
            <p>
              Instead of giving one vague score, RoleFit AI breaks the report
              into practical categories so you know what to fix first.
            </p>
          </div>

          <div className="check-grid">
            {checkGroups.map((group) => (
              <article key={group.title}>
                <h3>{group.title}</h3>
                {group.items.map((item) => (
                  <p key={item}>
                    <span></span>
                    {item}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="feature-pair" id="features">
          <div className="feature-copy">
            <p className="section-kicker">ATS understanding</p>
            <h2>
              See which parts of your resume the system can confidently
              interpret.
            </h2>
            <p>
              RoleFit AI checks section names, contact details, dates, skills,
              projects, and experience signals so your resume is easier to parse
              and easier to trust.
            </p>
          </div>
          <div className="feature-card parse-card">
            <div className="parse-row">
              <span>Contact info</span>
              <strong>Clear</strong>
            </div>
            <div className="parse-row">
              <span>Skills section</span>
              <strong>Strong</strong>
            </div>
            <div className="parse-row warning">
              <span>Impact metrics</span>
              <strong>Needs work</strong>
            </div>
            <div className="parse-row warning">
              <span>Cloud keywords</span>
              <strong>Missing</strong>
            </div>
          </div>
        </section>

        <section className="feature-pair reverse">
          <div className="feature-card rewrite-card">
            <span className="tag">AI rewrite</span>
            <p className="weak">
              Responsible for making web pages using React and APIs.
            </p>
            <p className="strong">
              Built responsive React pages integrated with REST APIs, improving
              page speed and reducing repeated UI code across core workflows.
            </p>
          </div>
          <div className="feature-copy">
            <p className="section-kicker">Human-ready bullets</p>
            <h2>Convert weak duties into proof-backed resume bullets.</h2>
            <p>
              The analyzer keeps suggestions truthful while improving action
              verbs, tools, context, and measurable outcomes.
            </p>
          </div>
        </section>

        <section className="work-section">
          <div className="work-heading">
            <h2>Put your resume score to work</h2>
            <p>
              Checking is step one. RoleFit AI helps you improve the full
              application journey.
            </p>
          </div>

          <div className="feature-shortcuts">
            {featureShortcuts.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`shortcut-card ${item.tone}`}
              >
                <span>{item.title}</span>
                <p>{item.text}</p>
                <strong>Check it out</strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="proof-section">
          <div>
            <p className="section-kicker">Built for serious applicants</p>
            <h2>A cleaner way to tailor every resume before sending it.</h2>
          </div>
          <div className="proof-cards">
            <article>
              <strong>4.8/5</strong>
              <p>
                Average feedback from mock users testing resume fit and rewrite
                quality.
              </p>
            </article>
            <article>
              <strong>27+</strong>
              <p>
                Checks across ATS readability, job tailoring, recruiter signals,
                and impact.
              </p>
            </article>
            <article>
              <strong>3 min</strong>
              <p>
                Typical time to get a first-pass report after uploading resume
                and JD.
              </p>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <div>
            <p className="section-kicker">Get your score now</p>
            <h2>
              Upload your resume and find the fixes that matter for this job.
            </h2>
          </div>
          {renderUploadForm(true)}
        </section>

        <section className="faq-section" id="faq">
          <div className="faq-heading">
            <p className="section-kicker">FAQ</p>
            <h2>Questions applicants usually ask</h2>
          </div>
          <div className="faq-list">{renderFaq()}</div>
        </section>
      </main>
    </div>
  );
};

export default Home;
