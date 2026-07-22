import CuentaCorreo from "../models/CuentaCorreo.js";
import nodemailer from "nodemailer";

export const getCuentas = async (req, res) => {
  try {
    const cuentas = await CuentaCorreo.find().select("-password");
    res.json(cuentas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCuenta = async (req, res) => {
  try {
    const { nombre, email, password, servicio } = req.body;
    const cuenta = await CuentaCorreo.create({ nombre, email, password, servicio });
    res.status(201).json({ ...cuenta.toObject(), password: undefined });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCuenta = async (req, res) => {
  try {
    const { nombre, email, password, servicio, activa } = req.body;
    const update = { nombre, email, servicio, activa };
    if (password) update.password = password;
    const cuenta = await CuentaCorreo.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    res.json(cuenta);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCuenta = async (req, res) => {
  try {
    await CuentaCorreo.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const testCuenta = async (req, res) => {
  try {
    const cuenta = await CuentaCorreo.findById(req.params.id);
    if (!cuenta) return res.status(404).json({ message: "Cuenta no encontrada" });

    const transportConfig = cuenta.smtpHost
      ? {
          host: cuenta.smtpHost,
          port: cuenta.smtpPort || 587,
          secure: false,
          auth: { user: cuenta.email, pass: cuenta.password },
        }
      : {
          service: cuenta.servicio,
          auth: { user: cuenta.email, pass: cuenta.password },
        };

    const transporter = nodemailer.createTransport(transportConfig);

    await transporter.sendMail({
      from: `"${cuenta.nombre}" <${cuenta.email}>`,
      to: cuenta.email,
      subject: "Prueba de conexión — DEMATIQ CRM",
      text: "Si recibes este correo, la cuenta está configurada correctamente.",
    });

    res.json({ ok: true, message: "Correo de prueba enviado correctamente" });
  } catch (error) {
    console.error("Error en testCuenta:", error);
    res.status(500).json({ message: "No se pudo conectar: " + error.message });
  }
};