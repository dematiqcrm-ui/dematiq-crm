import express from "express";
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
} from "../controllers/empresaController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getEmpresas);

router.post("/", protect, createEmpresa);

router.put("/:id", protect, updateEmpresa);

router.delete("/:id", protect, deleteEmpresa);

export default router;