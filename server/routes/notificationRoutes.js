// routes/notificationRoutes.js
import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ─── GET /api/notifications ────────────────────────────────────────────────
// Devuelve las notificaciones del usuario logueado + las globales (user: null)
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ user: req.user._id }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(notifications);
  } catch (err) {
    console.error("Error obteniendo notificaciones:", err);
    res.status(500).json({ error: "Error obteniendo notificaciones" });
  }
});

// ─── PATCH /api/notifications/:id/read ─────────────────────────────────────
// Marca una notificación específica como leída
router.patch("/:id/read", protect, async (req, res) => {
  try {
    const notif = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ error: "Notificación no encontrada" });
    res.json(notif);
  } catch (err) {
    console.error("Error marcando notificación como leída:", err);
    res.status(500).json({ error: "Error actualizando notificación" });
  }
});

// ─── PATCH /api/notifications/read-all ─────────────────────────────────────
// Marca todas las notificaciones (propias + globales) como leídas
router.patch("/read-all", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ user: req.user._id }, { user: null }], read: false },
      { read: true }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error("Error marcando todas las notificaciones:", err);
    res.status(500).json({ error: "Error actualizando notificaciones" });
  }
});

// ─── DELETE /api/notifications/:id ─────────────────────────────────────────
// Descarta (elimina) una notificación
router.delete("/:id", protect, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error eliminando notificación:", err);
    res.status(500).json({ error: "Error eliminando notificación" });
  }
});

// ─── POST /api/notifications ───────────────────────────────────────────────
// Crea una notificación nueva (úsala desde otras rutas de tu backend,
// ej. al registrar un cliente, generar un reporte, actualizar un parque, etc.)
router.post("/", protect, async (req, res) => {
  try {
    const { title, description, type, user, link } = req.body;
    if (!title) return res.status(400).json({ error: "El título es requerido" });

    const notif = await Notification.create({
      title,
      description,
      type,
      user: user || null,
      link,
    });

    res.status(201).json(notif);
  } catch (err) {
    console.error("Error creando notificación:", err);
    res.status(500).json({ error: "Error creando notificación" });
  }
});

export default router;