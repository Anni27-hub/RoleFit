import api from "./client.js";

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  const { data } = await api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const runAnalysis = async ({ resumeId, jobDescription, jobTitle }) => {
  const { data } = await api.post("/analyze", { resumeId, jobDescription, jobTitle });
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