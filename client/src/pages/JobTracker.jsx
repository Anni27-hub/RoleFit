import { useEffect, useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import "./JobTracker.css";

const STORAGE_KEY = "rolefit-jobs";

const DEMO_JOBS = [
  { id: "demo-1", company: "Google", role: "Full Stack Software Engineer", status: "Interview", date: "Nov 18, 2026" },
  { id: "demo-2", company: "Stripe", role: "Backend Systems Engineer", status: "Applied", date: "Nov 20, 2026" },
  { id: "demo-3", company: "Atlassian", role: "Frontend Platform Engineer", status: "Offer", date: "Nov 15, 2026" },
  { id: "demo-4", company: "Datadog", role: "Cloud Infrastructure Engineer", status: "OA", date: "Nov 19, 2026" },
  { id: "demo-5", company: "Microsoft", role: "AI Applications Engineer", status: "Applied", date: "Nov 21, 2026" },
];

const STATUS_OPTIONS = ["Applied", "OA", "Interview", "HR", "Offer", "Rejected"];

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({ company: "", role: "", status: "Applied" });
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setJobs(parsed);
          return;
        }
      } catch (e) {
        // fallback
      }
    }
    // Default seed for initial impressive view
    setJobs(DEMO_JOBS);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const addJob = (e) => {
    e?.preventDefault();
    if (!form.company.trim() || !form.role.trim()) return;
    const newJob = {
      id: Date.now().toString(),
      company: form.company.trim(),
      role: form.role.trim(),
      status: form.status,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setJobs([newJob, ...jobs]);
    setForm({ company: "", role: "", status: "Applied" });
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter((j) => j.id !== id));
  };

  const updateJobStatus = (id, newStatus) => {
    setJobs(jobs.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
  };

  const handleSeedDemo = () => {
    setJobs(DEMO_JOBS);
  };

  const handleClearAll = () => {
    setJobs([]);
  };

  const counts = {
    total: jobs.length,
    applied: jobs.filter((job) => job.status === "Applied").length,
    activeRounds: jobs.filter((job) => job.status === "Interview" || job.status === "OA" || job.status === "HR").length,
    offer: jobs.filter((job) => job.status === "Offer").length,
    rejected: jobs.filter((job) => job.status === "Rejected").length,
  };

  const interviewRate = counts.total > 0 ? Math.round((counts.activeRounds / counts.total) * 100) : 0;

  const filteredJobs = jobs.filter((job) => {
    const matchesStatus = filterStatus === "All" || job.status === filterStatus;
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <FeatureShell
      title="Job Application Pipeline"
      subtitle="Track your applications, interview stages, and offers in one organized workspace."
    >
      <div className="tracker-wrapper">
        {/* KPI Metric Cards */}
        <section className="tracker-kpi-grid">
          <div className="kpi-card total">
            <div className="kpi-top">
              <span className="kpi-label">Total Applications</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{counts.total}</div>
            <div className="kpi-sub">Across all active pipelines</div>
          </div>

          <div className="kpi-card interviews">
            <div className="kpi-top">
              <span className="kpi-label">Active Rounds</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{counts.activeRounds}</div>
            <div className="kpi-sub">
              <span className="kpi-tag positive">{interviewRate}% Response Rate</span>
            </div>
          </div>

          <div className="kpi-card offers">
            <div className="kpi-top">
              <span className="kpi-label">Offers Received</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{counts.offer}</div>
            <div className="kpi-sub">Decision stage</div>
          </div>

          <div className="kpi-card rejections">
            <div className="kpi-top">
              <span className="kpi-label">Archived / Rejected</span>
              <span className="kpi-icon-wrap">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              </span>
            </div>
            <div className="kpi-number">{counts.rejected}</div>
            <div className="kpi-sub">Ready for review</div>
          </div>
        </section>

        {/* Add Application Bar */}
        <section className="add-job-panel">
          <div className="add-job-header">
            <h3>Add New Application</h3>
            <span className="add-job-badge">INSTANT TRACKING</span>
          </div>

          <form className="add-job-form" onSubmit={addJob}>
            <div className="form-input-wrap">
              <input
                placeholder="Company (e.g. Netflix, Amazon)"
                value={form.company}
                onChange={update("company")}
                className="tracker-input"
              />
            </div>

            <div className="form-input-wrap">
              <input
                placeholder="Role (e.g. Software Engineer)"
                value={form.role}
                onChange={update("role")}
                className="tracker-input"
              />
            </div>

            <div className="form-select-wrap">
              <select
                value={form.status}
                onChange={update("status")}
                className="tracker-select"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="add-job-btn">
              <span>+ Add to Pipeline</span>
            </button>
          </form>
        </section>

        {/* Table & Filtering Section */}
        <section className="pipeline-table-card">
          <div className="table-toolbar">
            <div className="table-search">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Search company or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button type="button" className="clear-search-btn" onClick={() => setSearchQuery("")}>✕</button>
              )}
            </div>

            <div className="filter-tabs">
              {["All", "Applied", "OA", "Interview", "Offer", "Rejected"].map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`filter-tab ${filterStatus === st ? "active" : ""}`}
                  onClick={() => setFilterStatus(st)}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="toolbar-actions">
              {jobs.length === 0 && (
                <button type="button" className="action-pill-btn" onClick={handleSeedDemo}>
                  Load Demo Data
                </button>
              )}
              {jobs.length > 0 && (
                <button type="button" className="action-pill-btn danger" onClick={handleClearAll}>
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className="table-responsive">
            {filteredJobs.length > 0 ? (
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr key={job.id || job.company}>
                      <td>
                        <div className="company-cell">
                          <span className="company-avatar">
                            {job.company.charAt(0).toUpperCase()}
                          </span>
                          <span className="company-name">{job.company}</span>
                        </div>
                      </td>
                      <td>
                        <span className="role-cell">{job.role}</span>
                      </td>
                      <td>
                        <select
                          value={job.status}
                          onChange={(e) => updateJobStatus(job.id, e.target.value)}
                          className={`status-pill-select status-${job.status?.toLowerCase()}`}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <span className="date-cell">{job.date || "Recent"}</span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="delete-row-btn"
                          onClick={() => deleteJob(job.id)}
                          title="Remove application"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="table-empty-state">
                <div className="empty-icon-wrap">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                  </svg>
                </div>
                <h4>No applications found</h4>
                <p>
                  {searchQuery || filterStatus !== "All"
                    ? "Try adjusting your search query or status filter."
                    : "Start logging your applications or click below to seed demo records."}
                </p>
                <button type="button" className="seed-cta-btn" onClick={handleSeedDemo}>
                  Load Demo Pipeline
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </FeatureShell>
  );
};

export default JobTracker;
