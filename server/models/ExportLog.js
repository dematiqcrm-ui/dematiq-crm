// models/ExportLog.js
import mongoose from "mongoose";

const exportLogSchema = new mongoose.Schema(
  {
    formato: { type: String, enum: ["excel", "pdf", "backup"], required: true },
    filtroTipo: { type: String, default: "todo" },
    filtroValor: { type: String, default: "" },
    totalRegistros: { type: Number, default: 0 },
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    usuarioNombre: { type: String, default: "" },
    ip: { type: String, default: "" },
  },
  { timestamps: true }
);

exportLogSchema.index({ createdAt: -1 });

export default mongoose.model("ExportLog", exportLogSchema);