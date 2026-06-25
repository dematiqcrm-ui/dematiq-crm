import nodemailer from "nodemailer";
import Historial from "../models/Historial.js";
import CuentaCorreo from "../models/CuentaCorreo.js";

export const enviarCorreo = async (req, res) => {
  try {
    const { destinatario, asunto, mensaje, empresaId, contactoNombre } = req.body;

    const adjuntos = req.files?.map((file) => ({
      filename: file.originalname,
      content: file.buffer,
      contentType: file.mimetype,
    })) || [];

    const cuenta = await CuentaCorreo.findOne({
  activa: true,
});

if (!cuenta) {
  return res.status(400).json({
    message:
      "No hay una cuenta de correo configurada",
  });
}

const transporter =
  nodemailer.createTransport({
    service:
      cuenta.servicio,
    auth: {
      user: cuenta.email,
      pass: cuenta.password,
    },
  });

const remitenteEmail =
  cuenta.email;

    await transporter.sendMail({
      from: `"DEMATIQ CRM" <${remitenteEmail}>`,
      to: destinatario,
      subject: asunto,
      attachments: adjuntos,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1a1f2e; padding: 24px; border-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0 0 16px;">DEMATIQ Automatización</h2>
            <div style="background: #ffffff; padding: 24px; border-radius: 6px; color: #333;">
              ${mensaje.replace(/\n/g, "<br>")}
            </div>
            <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin-top: 16px;">
              Este correo fue enviado desde el sistema CRM de DEMATIQ.
            </p>
          </div>
        </div>
      `,
    });

    await Historial.create({
      empresaId,
      contactoNombre,
      contactoCorreo: destinatario,
      asunto,
      mensaje,
      enviadoPor: req.user.id,
      cuentaRemitente: remitenteEmail,
    });

    res.json({ ok: true, message: "Correo enviado correctamente" });
  } catch (error) {
    console.error("Error al enviar correo:", error);
    res.status(500).json({ message: "No se pudo enviar el correo", error: error.message });
  }
};

export const getHistorial = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const historial = await Historial.find({ empresaId })
      .populate("enviadoPor", "nombre email")
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(historial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};