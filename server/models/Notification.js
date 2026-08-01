// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    type: {
      type: String,
      enum: ["cliente", "reporte", "parque", "empresa", "proveedor", "sistema"],
      default: "sistema",
    },
    read: { type: Boolean, default: false },
    // Si "user" es null, la notificación es global (visible para todos los usuarios).
    // Si tiene un ObjectId, solo la ve ese usuario.
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // Ruta opcional a la que navegar al hacer click (ej. "/clientes/123")
    link: { type: String, default: "" },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);