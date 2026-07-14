import mongoose from "mongoose";

const cuentaCorreoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    servicio: { type: String, default: "gmail" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: Number, default: 587 },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CuentaCorreo", cuentaCorreoSchema);