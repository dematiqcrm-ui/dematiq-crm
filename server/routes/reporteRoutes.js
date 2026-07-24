import express from "express";

import {
  getEmpresasIncompletas,
  getParquesIncompletos,
  empresasPorEstado,
  getResumen,
  empresasPorGiro,
  empresasPorParque,
  getProveedoresPorEstado,
} from "../controllers/reporteController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/empresas-incompletas", protect, getEmpresasIncompletas);
router.get("/parques-incompletos", protect, getParquesIncompletos);
router.get("/empresas-estado", protect, empresasPorEstado);
router.get("/resumen", protect, getResumen);
router.get("/empresas-giro", protect, empresasPorGiro);
router.get("/empresas-parque", protect, empresasPorParque);
router.get("/proveedores-por-estado", protect, getProveedoresPorEstado);

export default router;