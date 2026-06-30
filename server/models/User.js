import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const users = () => getDb().collection("users");

export async function findUserByEmail(email) {
  return users().findOne({ email });
}

export async function findUserByGoogleId(googleId) {
  return users().findOne({ googleId });
}

export async function findUserById(id, options = {}) {
  if (!ObjectId.isValid(id)) return null;
  return users().findOne(
    { _id: new ObjectId(id) },
    options.excludePassword ? { projection: { passwordHash: 0 } } : undefined
  );
}

export async function createUser({ name, email, passwordHash = null, googleId = null, avatar = "" }) {
  const document = {
    name,
    email,
    avatar,
    authProvider: googleId ? "google" : "email",
    googleId,
    passwordHash,
    plan: "free",
    analysisCredits: Number(process.env.FREE_ANALYSIS_CREDITS || 2),
    totalAnalyses: 0,
    subscriptionStatus: "free",
    createdAt: new Date()
  };
  const result = await users().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function linkGoogleAccount(userId, { googleId, avatar = "" }) {
  await users().updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        googleId,
        avatar,
        authProvider: "google",
        updatedAt: new Date()
      }
    }
  );
  return findUserById(userId);
}

export async function decrementAnalysisCredit(userId) {
  const result = await users().findOneAndUpdate(
    {
      _id: new ObjectId(userId),
      analysisCredits: { $gt: 0 }
    },
    {
      $inc: {
        analysisCredits: -1,
        totalAnalyses: 1
      },
      $set: { updatedAt: new Date() }
    },
    { returnDocument: "after", projection: { passwordHash: 0 } }
  );
  return result;
}

export async function addPremiumCredits(userId, credits) {
  const result = await users().findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $inc: { analysisCredits: credits },
      $set: {
        plan: "premium",
        subscriptionStatus: "active",
        premiumActivatedAt: new Date(),
        updatedAt: new Date()
      }
    },
    { returnDocument: "after", projection: { passwordHash: 0 } }
  );
  return result;
}

export function serializeUser(user) {
  const defaultCredits = Number(process.env.FREE_ANALYSIS_CREDITS || 2);
  return {
    _id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar || "",
    plan: user.plan || "free",
    analysisCredits: Number(user.analysisCredits ?? defaultCredits),
    totalAnalyses: Number(user.totalAnalyses || 0),
    subscriptionStatus: user.subscriptionStatus || "free"
  };
}
