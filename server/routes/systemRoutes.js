import express from "express";
import { getDbStats } from "../controllers/systemController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/db-stats", protect, getDbStats);

export default router;