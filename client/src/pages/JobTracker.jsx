import { useEffect, useState } from "react";
import FeatureShell from "../components/FeatureShell.jsx";
import "./JobTracker.css";

const STORAGE_KEY = "rolefit-jobs";

const JobTracker = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState({
    company: "",
    role: "",
    status: "Applied",
  });

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setJobs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  }, [jobs]);

  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const addJob = () => {
    if (!form.company.trim() || !form.role.trim()) return;
    setJobs([
      {
        ...form,
        company: form.company.trim(),
        role: form.role.trim(),
        date: new Date().toLocaleDateString(),
      },
      ...jobs,
    ]);
    setForm({ company: "", role: "", status: "Applied" });
  };

  const counts = {
    applied: jobs.filter((job) => job.status === "Applied").length,
    interview: jobs.filter((job) => job.status === "Interview").length,
    offer: jobs.filter((job) => job.status === "Offer").length,
    rejected: jobs.filter((job) => job.status === "Rejected").length,
  };

  return (
    <FeatureShell
      title="Job Tracker"
      subtitle="Keep the job hunt organized without leaving the app."
    >
      <section className="dashboard">
        <div className="card">
          <h2>{jobs.length}</h2>
          <p>Total Applications</p>
        </div>
        <div className="card">
          <h2>{counts.interview}</h2>
          <p>Interviews</p>
        </div>
        <div className="card">
          <h2>{counts.offer}</h2>
          <p>Offers</p>
        </div>
        <div className="card">
          <h2>{counts.rejected}</h2>
          <p>Rejected</p>
        </div>
      </section>

      <section className="add-job">
        <input
          placeholder="Company"
          value={form.company}
          onChange={update("company")}
        />
        <input placeholder="Role" value={form.role} onChange={update("role")} />
        <select value={form.status} onChange={update("status")}>
          <option>Applied</option>
          <option>OA</option>
          <option>Interview</option>
          <option>HR</option>
          <option>Offer</option>
          <option>Rejected</option>
        </select>
        <button type="button" className="submit-btn" onClick={addJob}>
          Add Job
        </button>
      </section>

      <section className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              <tr key={`${job.company}-${index}`}>
                <td>{job.company}</td>
                <td>{job.role}</td>
                <td>{job.status}</td>
                <td>{job.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </FeatureShell>
  );
};

export default JobTracker;
