import mongoose from "mongoose";

const cuentaCorreoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    servicio: { type: String, default: "gmail" },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("CuentaCorreo", cuentaCorreoSchema);