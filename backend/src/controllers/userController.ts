import type { Request, Response } from "express";
import User from "../models/User.js";

export const getCurrentUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user.id).select("email name gmailConnected");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
