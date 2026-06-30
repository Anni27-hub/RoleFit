import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const analyses = () => getDb().collection("analyses");

export async function createAnalysis(data) {
  const document = {
    ...data,
    userId: new ObjectId(data.userId),
    resumeId: new ObjectId(data.resumeId),
    createdAt: new Date()
  };
  const result = await analyses().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function findAnalysisForUser(analysisId, userId) {
  if (!ObjectId.isValid(analysisId) || !ObjectId.isValid(userId)) return null;
  return analyses().findOne({
    _id: new ObjectId(analysisId),
    userId: new ObjectId(userId)
  });
}

export async function listAnalysesForUser(userId, limit = 20) {
  if (!ObjectId.isValid(userId)) return [];
  return analyses()
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .limit(limit)
    .project({ jobDescription: 0, resumeText: 0 })
    .toArray();
}

export function serializeAnalysis(document) {
  return {
    ...document,
    _id: document._id?.toString(),
    userId: document.userId?.toString(),
    resumeId: document.resumeId?.toString(),
    createdAt: document.createdAt?.toISOString?.() || document.createdAt
  };
}
