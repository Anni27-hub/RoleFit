import api from "./client.js";

export const generateResumeBuilder = async (payload) => {
  const { data } = await api.post("/ai/resume-builder", payload);
  return data;
};

export const generateCoverLetter = async (payload) => {
  const { data } = await api.post("/ai/cover-letter", payload);
  return data;
};

export const generateInterviewPrep = async (payload) => {
  const { data } = await api.post("/ai/interview-prep", payload);
  return data;
};

export const generateSkillRoadmap = async (payload) => {
  const { data } = await api.post("/ai/skill-roadmap", payload);
  return data;
};
