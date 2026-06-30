import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  linkGoogleAccount,
  serializeUser
} from "../models/User.js";

export async function signup(req, res, next) {
  try {
    const { name = "", email = "", password = "" } = req.body;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters." });
    }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    if (await findUserByEmail(cleanEmail)) {
      return res.status(409).json({ message: "An account already exists with this email." });
    }

    const user = await createUser({
      name: cleanName,
      email: cleanEmail,
      passwordHash: await bcrypt.hash(password, 12)
    });
    const clientUser = serializeUser(user);

    res.status(201).json({ token: signToken(clientUser._id), user: clientUser });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "An account already exists with this email." });
    }
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email = "", password = "" } = req.body;
    const user = await findUserByEmail(email.trim().toLowerCase());

    if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const clientUser = serializeUser(user);
    res.json({ token: signToken(clientUser._id), user: clientUser });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const { credential = "" } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Google credential is required." });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error("GOOGLE_CLIENT_ID is required.");
    }

    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase();

    if (!email || !payload.email_verified) {
      return res.status(401).json({ message: "Google account email is not verified." });
    }

    let user = await findUserByGoogleId(payload.sub);
    if (!user) {
      const existing = await findUserByEmail(email);
      user = existing
        ? await linkGoogleAccount(existing._id, {
            googleId: payload.sub,
            avatar: payload.picture || ""
          })
        : await createUser({
            name: payload.name || email.split("@")[0],
            email,
            googleId: payload.sub,
            avatar: payload.picture || ""
          });
    }

    const clientUser = serializeUser(user);
    res.json({ token: signToken(clientUser._id), user: clientUser });
  } catch (error) {
    next(error);
  }
}

export function getCurrentUser(req, res) {
  res.json({ user: req.user });
}

function signToken(userId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required.");
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
