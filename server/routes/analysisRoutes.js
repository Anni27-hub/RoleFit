import { Router } from "express";
import {
  compareAnalyses,
  emailReport,
  exportDocx,
  getAnalysis,
  getHistory,
  runAnalysis,
  scrapeJobUrl
} from "../controllers/analysisController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Job description URL scraping
router.post("/analyze/scrape-url", requireAuth, scrapeJobUrl);

// Resume version comparison (v1 vs v2 delta)
router.post("/analyze/compare", requireAuth, compareAnalyses);

// Core analysis
router.post("/analyze", requireAuth, runAnalysis);
router.get("/analyze/:id", requireAuth, getAnalysis);

// Tailored DOCX export & Email delivery
router.get("/analyze/:id/export-docx", requireAuth, exportDocx);
router.post("/analyze/:id/email-report", requireAuth, emailReport);

// User history
router.get("/history", requireAuth, getHistory);

export default router;
