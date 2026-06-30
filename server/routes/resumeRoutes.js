import { Router } from "express";
import { uploadResume } from "../controllers/resumeController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/upload", requireAuth, uploadResume);

export default router;
