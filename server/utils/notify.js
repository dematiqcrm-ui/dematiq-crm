// utils/notify.js
import Notification from "../models/Notification.js";

/**
 * Crea una notificación. Nunca lanza error: si falla, solo lo loguea,
 * para que un problema al notificar jamás tumbe la operación principal
 * (crear/editar/eliminar, etc).
 */
export const notify = async ({ title, description = "", type = "sistema", user = null, link = "" }) => {
  try {
    await Notification.create({ title, description, type, user, link });
  } catch (err) {
    console.error("Error creando notificación:", err);
  }
};