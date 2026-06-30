import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import featureRoutes from "./routes/featureRoutes.js";
import { connectDb } from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "RoleFit AI API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api", analysisRoutes);
app.use("/api", paymentRoutes);
app.use("/api", featureRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Server error. Please try again."
  });
});

await connectDb();

app.listen(port, () => {
  console.log(`RoleFit AI API running on http://localhost:${port}`);
});
