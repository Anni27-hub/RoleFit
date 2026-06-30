import { Router } from "express";
import {
  getCurrentUser,
  googleLogin,
  login,
  signup
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", requireAuth, getCurrentUser);

export default router;
