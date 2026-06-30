import {
  generateCoverLetter,
  generateInterviewPrep,
  generateResumeBuilder,
  generateSkillRoadmap
} from "../services/featureAi.js";

export async function buildResume(req, res, next) {
  try {
    const result = await generateResumeBuilder(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function buildCoverLetter(req, res, next) {
  try {
    const result = await generateCoverLetter(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function buildInterviewPrep(req, res, next) {
  try {
    const result = await generateInterviewPrep(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function buildSkillRoadmap(req, res, next) {
  try {
    const result = await generateSkillRoadmap(req.body || {});
    res.json(result);
  } catch (error) {
    next(error);
  }
}
