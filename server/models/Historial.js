import mongoose from "mongoose";

const historialSchema = new mongoose.Schema(
  {
    empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa" },
    contactoNombre: { type: String },
    contactoCorreo: { type: String },
    asunto: { type: String },
    mensaje: { type: String },
    enviadoPor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    cuentaRemitente: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Historial", historialSchema);