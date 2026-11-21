import LiveDiagnosticWidget from "../components/LiveDiagnosticWidget.jsx";
import HeroBentoGrid from "../components/HeroBentoGrid.jsx";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { uploadResume, runAnalysis, scrapeJobUrl } from "../api/resume.js";
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
    badge: "ATS DRAFT",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    ),
    title: "Resume Builder",
    text: "Draft a clean, ATS-optimized single-column resume with structured metrics.",
    tone: "emerald",
    cta: "Launch Builder",
  },
  {
    to: "/cover-letter",
    badge: "AI TAILOR",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
        <polyline points="22,6 12,13 2,6"></polyline>
      </svg>
    ),
    title: "Cover Letter",
    text: "Generate high-conviction letters aligned directly to the target JD.",
    tone: "blue",
    cta: "Draft Letter",
  },
  {
    to: "/job-tracker",
    badge: "TRACKER",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    title: "Job Tracker",
    text: "Organize applications, interview rounds, and offers in one pipeline.",
    tone: "violet",
    cta: "Open Board",
  },
  {
    to: "/interview-prep",
    badge: "STAR COACH",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    title: "Interview Prep",
    text: "Simulate technical and behavioral questions with structured STAR hints.",
    tone: "coral",
    cta: "Start Prep",
  },
  {
    to: "/skill-roadmap",
    badge: "PATHWAY",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
    title: "Skill Roadmap",
    text: "Convert missing keywords into prioritized weekly learning milestones.",
    tone: "sky",
    cta: "View Roadmap",
  },
];

const SAMPLE_JDS = {
  ai: {
    title: "AI & Machine Learning Engineer",
    jd: "Seeking an AI Engineer with expertise in Python, PyTorch/TensorFlow, and Large Language Models (LLMs). Experience with RAG architectures, vector databases (Pinecone, ChromaDB), API integrations, and fine-tuning open-source models (Llama, Mistral) is highly desirable. Must possess strong foundations in data structures, algorithms, and prompt engineering."
  },
  sde: {
    title: "Full Stack Software Engineer",
    jd: "Looking for a Full Stack Engineer to architect responsive web applications and scalable backend APIs. Core tech stack: React.js, Node.js, Express, MongoDB, and TypeScript. Experience designing distributed RESTful services, implementing JWT/OAuth authentication, and deploying Dockerized containers on AWS or GCP is preferred."
  },
  data: {
    title: "Data Analyst & Business Intelligence",
    jd: "We are hiring a Data Analyst proficient in SQL, Python/R, and Tableau or PowerBI. Responsibilities include querying complex datasets, building automated reporting pipelines, statistical analysis, and collaborating with cross-functional teams to translate metrics into strategic business insights."
  }
};

const Home = () => {
  const [file, setFile] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jdMode, setJdMode] = useState("text"); // "text" | "url"
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState(defaultFaqOpen);
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleFetchUrl = async () => {
    if (!jobUrl.trim()) {
      setError("Please paste a valid job URL first.");
      return;
    }
    setError("");
    setFetchingUrl(true);
    try {
      const res = await scrapeJobUrl(jobUrl.trim());
      if (res.jobTitle && !jobTitle) {
        setJobTitle(res.jobTitle);
      }
      if (res.jobDescription) {
        setJobDescription(res.jobDescription);
        setJdMode("text"); // auto-switch so user sees extracted content
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not fetch JD from link. Please copy and paste the text manually."
      );
    } finally {
      setFetchingUrl(false);
    }
  };

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
    if (!jobDescription.trim() && !jobUrl.trim()) {
      return setError("Paste the job description or provide a job posting URL.");
    }

    setError("");
    try {
      setStatus("uploading");
      const { resumeId } = await uploadResume(file);

      setStatus("analyzing");
      const analysis = await runAnalysis({
        resumeId,
        jobDescription,
        jobTitle,
        jobUrl
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

  const isBusy = status === "uploading" || status === "analyzing" || fetchingUrl;
  const buttonLabel =
    fetchingUrl
      ? "Fetching job details..."
      : status === "uploading"
        ? "Reading resume..."
        : status === "analyzing"
          ? (jobUrl && !jobDescription.trim() ? "Extracting job & analyzing..." : "Analyzing against the JD...")
          : "Analyze my resume";

  const jdWordCount = jobDescription.trim() ? jobDescription.trim().split(/\s+/).length : 0;

  const loadSampleJd = (key) => {
    const sample = SAMPLE_JDS[key];
    if (sample) {
      setJobTitle(sample.title);
      setJobDescription(sample.jd);
      setJobUrl("");
      setError("");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  const renderUploadForm = (compact = false) => {
    const isReady = Boolean(file && (jobDescription.trim().length > 20 || jobUrl.trim().length > 10));

    return (
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
          <span className={`upload-orb ${file ? "uploaded" : ""}`} aria-hidden="true">
            {file ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            )}
          </span>
          {file ? (
            <div className="dropzone-file-info">
              <span className="file-name-badge">{file.name}</span>
              <span className="file-meta-sub">
                {formatFileSize(file.size)} • Ready for ATS scan • <span className="change-link">Change file</span>
              </span>
            </div>
          ) : (
            <>
              <span className="dropzone-title">Drop your resume here or choose a file</span>
              <div className="dropzone-tags">
                <span className="dz-pill">PDF</span>
                <span className="dz-pill">DOCX</span>
                <span className="dz-pill dim">Max 5MB</span>
              </div>
            </>
          )}
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

          <div className="field field-wide">
            <div className="field-header-row">
              <label>
                <span>Job Requirements <span className="required-star">*</span></span>
              </label>
              <div className="jd-mode-tabs">
                <button
                  type="button"
                  className={`jd-mode-tab ${jdMode === "text" ? "active" : ""}`}
                  onClick={() => setJdMode("text")}
                >
                  Paste JD Text
                </button>
                <button
                  type="button"
                  className={`jd-mode-tab ${jdMode === "url" ? "active" : ""}`}
                  onClick={() => setJdMode("url")}
                >
                  Paste Job Link
                </button>
              </div>
            </div>

            {jdMode === "url" ? (
              <div className="jd-url-box">
                <div className="jd-url-input-wrap">
                  <input
                    type="url"
                    className="text-input jd-url-field"
                    placeholder="e.g. https://linkedin.com/jobs/view/... or Greenhouse link"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="jd-fetch-btn"
                    onClick={handleFetchUrl}
                    disabled={fetchingUrl || !jobUrl.trim()}
                  >
                    {fetchingUrl ? "Extracting..." : "Fetch Details"}
                  </button>
                </div>
                <p className="jd-url-tip">
                  Supports LinkedIn, Indeed, Greenhouse, Lever, Workday, or company career pages.
                </p>
                {jobDescription && (
                  <div className="extracted-preview-badge">
                    <span>Extracted: {jobDescription.substring(0, 110)}...</span>
                    <button type="button" onClick={() => setJdMode("text")}>Review full text &rarr;</button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="sample-jd-bar">
                  <span className="sample-label">Try sample:</span>
                  <button type="button" className="sample-pill" onClick={() => loadSampleJd("ai")}>
                    AI Engineer
                  </button>
                  <button type="button" className="sample-pill" onClick={() => loadSampleJd("sde")}>
                    Full Stack SDE
                  </button>
                  <button type="button" className="sample-pill" onClick={() => loadSampleJd("data")}>
                    Data Analyst
                  </button>
                  {jobDescription && (
                    <button
                      type="button"
                      className="sample-clear-pill"
                      onClick={() => { setJobTitle(""); setJobDescription(""); setJobUrl(""); }}
                    >
                      Clear
                    </button>
                  )}
                  <span className={`jd-word-badge ${jdWordCount >= 40 ? "optimal" : jdWordCount > 0 ? "warning" : ""}`}>
                    {jdWordCount} words {jdWordCount >= 40 ? "• Optimal" : jdWordCount > 0 ? "• Need more detail" : ""}
                  </span>
                </div>

                <textarea
                  id="jd-input"
                  className="text-input textarea"
                  placeholder="Paste the full job description here..."
                  rows={compact ? 5 : 8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </>
            )}
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button
          type="submit"
          className={`submit-btn ${isReady && !isBusy ? "ready-pulse" : ""}`}
          disabled={isBusy}
        >
          <span className="btn-sparkle" aria-hidden="true">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
          </span>
          <span>{buttonLabel}</span>
          <span aria-hidden="true" className="btn-arrow">&rarr;</span>
        </button>
      </form>
    );
  };

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
          <Link to="/resume-builder" className="nav-workspace-link">AI Workspace</Link>
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
            aria-label="Resume intelligence bento grid"
          >
            <HeroBentoGrid />
          </div>
        </section>

        <section className="score-section" id="score">
          <div className="machine-visual">
            <LiveDiagnosticWidget />
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
          <div className="feature-card parse-card-enhanced">
            <div className="card-top-bar">
              <div className="card-top-title-wrap">
                <span className="card-top-pulse-dot"></span>
                <span className="card-subtle-title">ATS Diagnostic Signals</span>
              </div>
              <span className="card-confidence-badge">94% Confidence</span>
            </div>

            <div className="parse-items-list">
              <div className="parse-item-row row-emerald">
                <div className="parse-item-left">
                  <div className="parse-item-icon icon-emerald">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  </div>
                  <div>
                    <strong>Contact Details & Links</strong>
                    <span>Email, phone, LinkedIn & GitHub verified</span>
                  </div>
                </div>
                <span className="status-pill-badge pill-emerald">Clear</span>
              </div>

              <div className="parse-item-row row-sky">
                <div className="parse-item-left">
                  <div className="parse-item-icon icon-sky">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  </div>
                  <div>
                    <strong>Technical Skills Taxonomy</strong>
                    <span>18 frameworks & libraries detected</span>
                  </div>
                </div>
                <span className="status-pill-badge pill-sky">Strong</span>
              </div>

              <div className="parse-item-row row-amber">
                <div className="parse-item-left">
                  <div className="parse-item-icon icon-amber">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </div>
                  <div>
                    <strong>Measurable Impact Metrics</strong>
                    <span>Percentages & quantitative outcomes missing</span>
                  </div>
                </div>
                <span className="status-pill-badge pill-amber">Needs Work</span>
              </div>

              <div className="parse-item-row row-rose">
                <div className="parse-item-left">
                  <div className="parse-item-icon icon-rose">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>
                  </div>
                  <div>
                    <strong>Target Cloud Keywords</strong>
                    <span>Docker, Kubernetes, AWS missing from JD</span>
                  </div>
                </div>
                <span className="status-pill-badge pill-rose">Missing</span>
              </div>
            </div>

            <div className="card-bottom-footer">
              <span className="footer-metric">ATS Readability: <strong className="readability-score">95/100</strong></span>
              <span className="footer-tip">Single-column layout recommended</span>
            </div>
          </div>
        </section>

        <section className="feature-pair reverse">
          <div className="feature-card rewrite-card-enhanced">
            <div className="rewrite-card-header">
              <span className="rewrite-title-tag">AI Proof Transformer</span>
              <span className="rewrite-header-sub">Action-Verb & Impact Injection</span>
            </div>

            <div className="bullet-diff-box before-box">
              <div className="diff-header">
                <span className="diff-tag-colored tag-rose">Before • Weak Duty</span>
                <span className="diff-subtext-rose">Lacks metrics & proof</span>
              </div>
              <p className="diff-text-original">
                "Responsible for making web pages using React and APIs."
              </p>
            </div>

            <div className="diff-arrow-wrap" aria-hidden="true">
              <div className="diff-enhancement-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                <span>RoleFit AI Enhancement</span>
              </div>
            </div>

            <div className="bullet-diff-box after-box">
              <div className="diff-header">
                <span className="diff-tag-colored tag-emerald">After • ATS-Optimized</span>
                <span className="diff-impact-tag">+38% Impact Score</span>
              </div>
              <p className="diff-text-improved">
                "<span className="verb-highlight">Architected</span> and deployed responsive React interfaces integrated with RESTful APIs, accelerating page load speeds by <span className="metric-highlight">35%</span> and reducing redundant UI code across core user workflows."
              </p>
              <div className="diff-pills-row">
                <span className="impact-pill pill-blue">Action: Architected</span>
                <span className="impact-pill pill-green">Metric: +35% Speed</span>
                <span className="impact-pill pill-purple">Keywords: React, REST APIs</span>
              </div>
            </div>
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
                <div className="shortcut-top">
                  <div className="shortcut-icon-badge">{item.icon}</div>
                  <span className="shortcut-badge">{item.badge}</span>
                </div>
                <h3 className="shortcut-title">{item.title}</h3>
                <p className="shortcut-desc">{item.text}</p>
                <div className="shortcut-cta">
                  <span>{item.cta}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="cta-arrow">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="proof-section">
          <div className="proof-copy">
            <p className="section-kicker">Built for serious applicants</p>
            <h2>A cleaner way to tailor every resume before sending it.</h2>
            <p className="proof-lead">
              Stop submitting blind applications. RoleFit AI decodes ATS keyword parsing, recruiter scoring metrics, and measurable impact so your resume stands out before human review.
            </p>
            <div className="proof-trust-tags">
              <span className="proof-trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                True ATS Parser Simulation
              </span>
              <span className="proof-trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Zero AI Hallucinations
              </span>
              <span className="proof-trust-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Actionable Proof Bullets
              </span>
            </div>
          </div>
          <div className="proof-cards">
            <article className="proof-stat-card">
              <strong className="proof-card-title">Applicant Rating</strong>
              <div className="proof-stat-number">
                4.8<span className="stat-unit">/5</span>
              </div>
              <p>
                Average score from job seekers testing resume fit, keyword density, and bullet rewrite clarity.
              </p>
              <div className="proof-card-footer">
                <span className="proof-footer-badge">500+ resumes benchmarked</span>
              </div>
            </article>

            <article className="proof-stat-card">
              <strong className="proof-card-title">Deep Diagnostics</strong>
              <div className="proof-stat-number">
                27<span className="stat-unit">+</span>
              </div>
              <p>
                Targeted checks across ATS readability, taxonomy match, recruiter signals, and quantifiable impact.
              </p>
              <div className="proof-card-footer">
                <span className="proof-footer-badge">Full ATS compliance</span>
              </div>
            </article>

            <article className="proof-stat-card">
              <strong className="proof-card-title">Turnaround Speed</strong>
              <div className="proof-stat-number">
                &lt; 3<span className="stat-unit">min</span>
              </div>
              <p>
                Typical turnaround time to upload, parse against target JD requirements, and export an executive PDF report.
              </p>
              <div className="proof-card-footer">
                <span className="proof-footer-badge">Instant AI feedback</span>
              </div>
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
