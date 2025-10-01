import { Router } from "express";
import Test from "../models/Test.js";

const router = Router();

router.get("/api/tests", async (_req, res) => {
  const items = await Test.find().lean();
  res.json(items);
});

router.post("/api/tests", async (req, res) => {
  const item = await Test.create({ name: req.body.name || "demo" });
  res.status(201).json(item);
});

export default router;
