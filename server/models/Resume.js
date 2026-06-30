import { ObjectId } from "mongodb";
import { getDb } from "../config/db.js";

const resumes = () => getDb().collection("resumes");

export async function createResume({ userId, originalName, mimeType, size, text }) {
  const document = {
    userId: new ObjectId(userId),
    originalName,
    mimeType,
    size,
    text,
    createdAt: new Date()
  };
  const result = await resumes().insertOne(document);
  return { ...document, _id: result.insertedId };
}

export async function findResumeForUser(resumeId, userId) {
  if (!ObjectId.isValid(resumeId) || !ObjectId.isValid(userId)) return null;
  return resumes().findOne({
    _id: new ObjectId(resumeId),
    userId: new ObjectId(userId)
  });
}
