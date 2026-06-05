import express from "express";
import { enviarCorreo, getHistorial } from "../controllers/correoController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../config/multer.js";

const router = express.Router();

router.post("/enviar", protect, upload.array("adjuntos", 5), enviarCorreo);
router.get("/historial/:empresaId", protect, getHistorial);

export default router;