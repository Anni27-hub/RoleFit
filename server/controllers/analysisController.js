import { ObjectId } from "mongodb";
import {
  createAnalysis,
  findAnalysisForUser,
  listAnalysesForUser,
  serializeAnalysis
} from "../models/Analysis.js";
import { findResumeForUser } from "../models/Resume.js";
import { decrementAnalysisCredit } from "../models/User.js";
import { analyzeResume } from "../services/analyzer.js";

export async function runAnalysis(req, res, next) {
  try {
    const { resumeId, jobDescription = "", jobTitle = "" } = req.body;

    if (!ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id." });
    }
    if (jobDescription.trim().length < 80) {
      return res.status(400).json({ message: "Paste a detailed job description." });
    }
    if (Number(req.user.analysisCredits || 0) <= 0) {
      return res.status(402).json({
        message: "You have no analysis credits left. Upgrade to Premium to continue.",
        code: "NO_CREDITS"
      });
    }

    const resume = await findResumeForUser(resumeId, req.user._id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found." });
    }

    const result = await analyzeResume({
      resumeText: resume.text,
      jobDescription: jobDescription.trim(),
      jobTitle: jobTitle.trim()
    });
    const analysis = await createAnalysis({
      userId: req.user._id,
      resumeId: resume._id.toString(),
      resumeName: resume.originalName,
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
      ...result
    });
    const updatedUser = await decrementAnalysisCredit(req.user._id);

    res.status(201).json({
      ...serializeAnalysis(analysis),
      user: updatedUser ? serializeUserSafe(updatedUser) : req.user
    });
  } catch (error) {
    next(error);
  }
}

function serializeUserSafe(user) {
  return {
    _id: user._id?.toString?.() || user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    plan: user.plan || "free",
    analysisCredits: Number(user.analysisCredits || 0),
    totalAnalyses: Number(user.totalAnalyses || 0),
    subscriptionStatus: user.subscriptionStatus || "free"
  };
}

export async function getAnalysis(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid analysis id." });
    }

    const analysis = await findAnalysisForUser(req.params.id, req.user._id);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    res.json(serializeAnalysis(analysis));
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const analyses = await listAnalysesForUser(req.user._id);
    res.json(analyses.map(serializeAnalysis));
  } catch (error) {
    next(error);
  }
}
