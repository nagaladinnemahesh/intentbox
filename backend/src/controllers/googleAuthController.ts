import type { Request, Response } from "express";
import { google } from "googleapis";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Step 1: Redirect user to Google login
export const googleLogin = (req: Request, res: Response) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/gmail.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    prompt: "consent",
  });

  res.redirect(url);
};

// Step 2: Handle Google OAuth callback
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Fetch user profile from Google
    const oauth2 = google.oauth2({
      version: "v2",
      auth: oAuth2Client,
    });

    const { data: profile } = await oauth2.userinfo.get();

    if (!profile.email) {
      return res.status(400).json({ error: "Unable to fetch user email from Google" });
    }

    // Check if user exists in DB
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      user = new User({
        email: profile.email,
        name: profile.name,
        gmailConnected: true,
        gmailRefreshToken: tokens.refresh_token,
      });
    } else {
      user.gmailConnected = true;
      if (tokens.refresh_token) user.gmailRefreshToken = tokens.refresh_token;
    }

    await user.save();

    // Create a JWT token
    const userJWTtoken = jwt.sign(
      { id: user._id, email: profile.email, name: profile.name },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Redirect to frontend
    res.redirect(`http://localhost:5173/dashboard?token=${userJWTtoken}`);
  } catch (error) {
    console.error("❌ Error during Google OAuth callback:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
