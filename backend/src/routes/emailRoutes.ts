import express from "express";
import { listAndIndexEmails } from "../gmailService.js";
import { searchEmails } from "../indexService.js";

const router = express.Router();


router.get("/emails", async (req, res) => {
  const emails = await listAndIndexEmails();
  res.json(emails);
});

router.get("/search", async (req, res) => {
  const query = req.query.q as string;
  if (!query) {
    return res.status(400).json({ error: "Query parameter 'q' is required." });
  }
  const results = await searchEmails(query);
  res.json(results);
});

export default router;