import transporter from "../config/mailer.js";
import Historial from "../models/Historial.js";

export const enviarCorreo = async (req, res) => {
  try {
    const { destinatario, asunto, mensaje, empresaId, contactoNombre } = req.body;

    const adjuntos = req.files?.map((file) => ({
      filename: file.originalname,
      content:  file.buffer,
      contentType: file.mimetype,
    })) || [];

    await transporter.sendMail({
      from:    `"DEMATIQ CRM" <${process.env.MAIL_USER}>`,
      to:      destinatario,
      replyTo: process.env.MAIL_USER,
      subject: asunto,
      headers: {
        "X-Mailer":   "DEMATIQ CRM v1.0",
        "X-Priority": "3",
        "Importance": "Normal",
      },
      attachments: adjuntos,
      // Texto plano como fallback (reduce probabilidad de spam)
      text: mensaje,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
            <tr><td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                
                <!-- Header -->
                <tr>
                  <td style="background:#1a1f2e;padding:24px 32px;">
                    <h2 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;">DEMATIQ</h2>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.4);font-size:12px;">Sistema CRM</p>
                  </td>
                </tr>

                <!-- Cuerpo -->
                <tr>
                  <td style="padding:32px;color:#333333;font-size:14px;line-height:1.7;">
                    ${mensaje.replace(/\n/g, "<br>")}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #eeeeee;">
                    <p style="margin:0;color:#aaaaaa;font-size:11px;">
                      Este mensaje fue enviado desde el sistema CRM de DEMATIQ Automatización Industrial.<br>
                      Si recibiste este correo por error, por favor ignóralo.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    await Historial.create({
      empresaId,
      contactoNombre,
      contactoCorreo: destinatario,
      asunto,
      mensaje,
      enviadoPor: req.user.id,
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