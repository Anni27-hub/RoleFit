import crypto from "crypto";
import Razorpay from "razorpay";
import {
  createPayment,
  listPaymentsForUser,
  serializePayment,
  updatePaymentByOrderId
} from "../models/Payment.js";
import { addPremiumCredits, serializeUser } from "../models/User.js";

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are required.");
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
}

export async function getPremiumConfig(req, res) {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || "",
    priceInr: Number(process.env.PREMIUM_PRICE_INR || 99),
    credits: Number(process.env.PREMIUM_ANALYSIS_CREDITS || 5),
    currency: "INR"
  });
}

export async function createPremiumOrder(req, res, next) {
  try {
    const priceInr = Number(process.env.PREMIUM_PRICE_INR || 99);
    const credits = Number(process.env.PREMIUM_ANALYSIS_CREDITS || 5);
    const amount = priceInr * 100;

    const order = await getRazorpay().orders.create({
      amount,
      currency: "INR",
      receipt: `rf_${req.user._id.toString().slice(-8)}_${Date.now()}`,
      notes: {
        userId: req.user._id,
        plan: "premium",
        credits: String(credits)
      }
    });

    await createPayment({
      userId: req.user._id,
      razorpayOrderId: order.id,
      amount,
      currency: "INR",
      credits,
      status: "created"
    });

    res.status(201).json({
      orderId: order.id,
      amount,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID,
      credits,
      name: "RoleFit AI Premium"
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyPremiumPayment(req, res, next) {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature
    } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ message: "Payment verification data is missing." });
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      await updatePaymentByOrderId(orderId, { status: "failed", razorpayPaymentId: paymentId });
      return res.status(400).json({ message: "Payment signature verification failed." });
    }

    const credits = Number(process.env.PREMIUM_ANALYSIS_CREDITS || 5);
    const payment = await updatePaymentByOrderId(orderId, {
      status: "paid",
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      verifiedAt: new Date()
    });
    const user = await addPremiumCredits(req.user._id, credits);

    res.json({
      message: "Premium activated successfully.",
      payment: serializePayment(payment),
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export async function getPaymentHistory(req, res, next) {
  try {
    const payments = await listPaymentsForUser(req.user._id);
    res.json(payments.map(serializePayment));
  } catch (error) {
    next(error);
  }
}
