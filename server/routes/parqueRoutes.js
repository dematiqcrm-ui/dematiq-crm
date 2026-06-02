import express from "express";
import {
  getParques,
  createParque,
  updateParque,
  deleteParque,
} from "../controllers/parqueController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getParques);

router.post("/", protect, createParque);

router.put("/:id", protect, updateParque);

router.delete("/:id", protect, deleteParque);

export default router;