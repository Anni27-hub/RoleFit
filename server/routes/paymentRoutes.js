import { Router } from "express";
import {
  createPremiumOrder,
  getPaymentHistory,
  getPremiumConfig,
  verifyPremiumPayment
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/premium/config", getPremiumConfig);
router.get("/payments", requireAuth, getPaymentHistory);
router.post("/premium/order", requireAuth, createPremiumOrder);
router.post("/premium/verify", requireAuth, verifyPremiumPayment);

export default router;
