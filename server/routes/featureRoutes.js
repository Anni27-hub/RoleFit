import { Router } from "express";
import {
  buildCoverLetter,
  buildInterviewPrep,
  buildResume,
  buildSkillRoadmap
} from "../controllers/featureController.js";

const router = Router();

router.post("/ai/resume-builder", buildResume);
router.post("/ai/cover-letter", buildCoverLetter);
router.post("/ai/interview-prep", buildInterviewPrep);
router.post("/ai/skill-roadmap", buildSkillRoadmap);

export default router;
