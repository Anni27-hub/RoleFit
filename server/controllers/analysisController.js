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
import { extractJobFromUrl } from "../services/jobScraper.js";
import { generateTailoredResumeDocx } from "../services/docxService.js";
import { sendAnalysisReportEmail } from "../services/emailService.js";

export async function runAnalysis(req, res, next) {
  try {
    let { resumeId, jobDescription = "", jobTitle = "", jobUrl = "" } = req.body;

    if (!ObjectId.isValid(resumeId)) {
      return res.status(400).json({ message: "Invalid resume id." });
    }

    // If jobUrl is provided and jobDescription is short or missing, scrape it on the fly
    if (jobUrl && jobDescription.trim().length < 80) {
      const scraped = await extractJobFromUrl(jobUrl);
      jobDescription = scraped.jobDescription;
      if (!jobTitle) jobTitle = scraped.jobTitle;
    }

    if (jobDescription.trim().length < 80) {
      return res.status(400).json({
        message: "Paste a detailed job description (minimum 80 characters) or provide a valid job posting link."
      });
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
      jobUrl: jobUrl.trim() || undefined,
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

export async function scrapeJobUrl(req, res, next) {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ message: "Job URL is required." });
    }
    const result = await extractJobFromUrl(url);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function exportDocx(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid analysis id." });
    }

    const analysis = await findAnalysisForUser(req.params.id, req.user._id);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    const docxBuffer = await generateTailoredResumeDocx({
      candidateName: req.user.name || "Candidate",
      jobTitle: analysis.jobTitle || "Software Engineer",
      summary: analysis.improvedSummary || "",
      matchedKeywords: analysis.matchedKeywords || [],
      bulletRewrites: analysis.bulletRewrites || [],
      strengths: analysis.strengths || [],
      skills: analysis.matchedKeywords || []
    });

    const safeTitle = (analysis.jobTitle || "Tailored_Resume").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="RoleFit_${safeTitle}.docx"`
    );
    res.send(docxBuffer);
  } catch (error) {
    next(error);
  }
}

export async function emailReport(req, res, next) {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid analysis id." });
    }

    const analysis = await findAnalysisForUser(req.params.id, req.user._id);
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found." });
    }

    const recipientEmail = req.body?.email?.trim() || req.user.email;
    if (!recipientEmail) {
      return res.status(400).json({ message: "Recipient email is required." });
    }

    const result = await sendAnalysisReportEmail({
      toEmail: recipientEmail,
      candidateName: req.user.name || "Candidate",
      jobTitle: analysis.jobTitle || "Target Role",
      matchScore: analysis.matchScore || 0,
      sectionScores: analysis.sectionScores || [],
      strengths: analysis.strengths || [],
      missingKeywords: analysis.missingKeywords || [],
      bulletRewrites: analysis.bulletRewrites || []
    });

    res.json({
      ok: true,
      message: `Report successfully sent to ${recipientEmail}`,
      previewUrl: result.previewUrl
    });
  } catch (error) {
    next(error);
  }
}

export async function compareAnalyses(req, res, next) {
  try {
    const { baseId, targetId } = req.body;

    if (!baseId || !targetId) {
      return res.status(400).json({ message: "Both baseId and targetId are required for comparison." });
    }

    if (!ObjectId.isValid(baseId) || !ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid analysis ID." });
    }

    const base = await findAnalysisForUser(baseId, req.user._id);
    const target = await findAnalysisForUser(targetId, req.user._id);

    if (!base || !target) {
      return res.status(404).json({ message: "One or both analyses not found." });
    }

    const baseScore = Number(base.matchScore || 0);
    const targetScore = Number(target.matchScore || 0);
    const scoreDelta = targetScore - baseScore;

    const sectionDeltas = (target.sectionScores || []).map((tSec) => {
      const bSec = (base.sectionScores || []).find((s) => s.section === tSec.section);
      const bVal = Number(bSec?.score || 0);
      const tVal = Number(tSec.score || 0);
      return {
        section: tSec.section,
        baseScore: bVal,
        targetScore: tVal,
        delta: tVal - bVal
      };
    });

    const baseMatched = new Set((base.matchedKeywords || []).map((k) => k.toLowerCase()));
    const keywordsGained = (target.matchedKeywords || []).filter(
      (k) => !baseMatched.has(k.toLowerCase())
    );

    const baseMissing = new Set((base.missingKeywords || []).map((k) => k.toLowerCase()));
    const keywordsResolved = (target.matchedKeywords || []).filter(
      (k) => baseMissing.has(k.toLowerCase())
    );

    res.json({
      baseId: base._id,
      targetId: target._id,
      jobTitle: target.jobTitle || base.jobTitle,
      baseScore,
      targetScore,
      scoreDelta,
      improved: scoreDelta > 0,
      sectionDeltas,
      keywordsGained,
      keywordsResolved,
      strengthsGained: (target.strengths || []).filter(
        (s) => !(base.strengths || []).includes(s)
      ),
      summaryComparison: {
        before: base.improvedSummary || "",
        after: target.improvedSummary || ""
      }
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
