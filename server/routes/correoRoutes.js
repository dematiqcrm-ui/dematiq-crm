import express from "express";
import { enviarCorreo, getHistorial, getHistorialGlobal, deleteHistorialPorRango, deleteHistorialById } from "../controllers/correoController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/enviar", protect, upload.array("adjuntos", 5), enviarCorreo);
router.get("/historial-global", protect, getHistorialGlobal);
router.delete("/historial-global", protect, deleteHistorialPorRango);
router.delete("/historial/:id", protect, deleteHistorialById);

export default router;