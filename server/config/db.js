import { MongoClient } from "mongodb";

let client;
let database;

export async function connectDb() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is required.");
  }

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(process.env.MONGO_DB_NAME || "rolefit_ai");

  await Promise.all([
    database.collection("users").createIndex({ email: 1 }, { unique: true }),
    database.collection("resumes").createIndex({ userId: 1, createdAt: -1 }),
    database.collection("analyses").createIndex({ userId: 1, createdAt: -1 })
  ]);

  console.log("MongoDB connected");
  return database;
}

export function getDb() {
  if (!database) {
    throw new Error("Database has not been initialized.");
  }

  return database;
}

export async function closeDb() {
  if (client) {
    await client.close();
  }
}
