import express from "express";
import {
  getEmpresas,
  getEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  registrarCorreoEnviado,
} from "../controllers/empresaController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",      protect, getEmpresas);
router.get("/:id",   protect, getEmpresa);
router.post("/",     protect, createEmpresa);
router.put("/correo", protect, registrarCorreoEnviado);
router.put("/:id",    protect, updateEmpresa);

router.delete("/:id", protect, deleteEmpresa);

export default router;