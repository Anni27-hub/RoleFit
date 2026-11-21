import api from "./client.js";

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const runAnalysis = async ({ resumeId, jobDescription, jobTitle, jobUrl }) => {
  const { data } = await api.post("/analyze", { resumeId, jobDescription, jobTitle, jobUrl });
  return data;
};

export const scrapeJobUrl = async (url) => {
  const { data } = await api.post("/analyze/scrape-url", { url });
  return data;
};

export const compareAnalyses = async ({ baseId, targetId }) => {
  const { data } = await api.post("/analyze/compare", { baseId, targetId });
  return data;
};

export const getAnalysis = async (id) => {
  const { data } = await api.get(`/analyze/${id}`);
  return data;
};

export const getHistory = async () => {
  const { data } = await api.get("/history");
  return data;
};

export const emailAnalysisReport = async (id, email) => {
  const { data } = await api.post(`/analyze/${id}/email-report`, { email });
  return data;
};

export const downloadTailoredDocx = async (id, title = "Tailored_Resume") => {
  const response = await api.get(`/analyze/${id}/export-docx`, {
    responseType: "blob"
  });
  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `RoleFit_${(title || "Tailored_Resume").replace(/[^a-zA-Z0-9_-]/g, "_")}.docx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
