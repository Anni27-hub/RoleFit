import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const payments = () => getDb().collection("payments");

export async function createPayment(data) {
  const document = {
    ...data,
    userId: new ObjectId(data.userId),
    createdAt: new Date()
  };
  const result = await payments().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function updatePaymentByOrderId(orderId, updates) {
  await payments().updateOne(
    { razorpayOrderId: orderId },
    { $set: { ...updates, updatedAt: new Date() } }
  );
  return payments().findOne({ razorpayOrderId: orderId });
}

export async function listPaymentsForUser(userId) {
  if (!ObjectId.isValid(userId)) return [];
  return payments()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(20)
    .toArray();
}

export function serializePayment(payment) {
  return {
    ...payment,
    _id: payment._id?.toString(),
    userId: payment.userId?.toString(),
    createdAt: payment.createdAt?.toISOString?.() || payment.createdAt,
    updatedAt: payment.updatedAt?.toISOString?.() || payment.updatedAt
  };
}
