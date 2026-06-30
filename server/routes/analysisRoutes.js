import { Router } from "express";
import {
  getAnalysis,
  getHistory,
  runAnalysis
} from "../controllers/analysisController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/analyze", requireAuth, runAnalysis);
router.get("/analyze/:id", requireAuth, getAnalysis);
router.get("/history", requireAuth, getHistory);

export default router;
