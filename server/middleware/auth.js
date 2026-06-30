import jwt from "jsonwebtoken";
import { findUserById, serializeUser } from "../models/User.js";

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Authentication required." });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is required.");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserById(payload.userId, { excludePassword: true });
    if (!user) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    req.user = serializeUser(user);
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Invalid or expired token." });
    }
    next(error);
  }
}
