import Empresa from "../models/Empresa.js";
import mongoose from "mongoose";

// GET /api/empresas
export const getEmpresas = async (req, res) => {
  try {
    const { parqueIndustrialId } = req.query;
    const filter = parqueIndustrialId
      ? { parqueIndustrialId: new mongoose.Types.ObjectId(parqueIndustrialId) }
      : {};
    const empresas = await Empresa.find(filter).sort({ createdAt: -1 });
    res.json(empresas);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener empresas", error: err.message });
  }
};

// GET /api/empresas/:id
export const getEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findById(req.params.id);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener empresa", error: err.message });
  }
};

// POST /api/empresas
export const createEmpresa = async (req, res) => {
  try {
    const empresa = new Empresa(req.body);
    const saved = await empresa.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error al crear empresa", error: err.message });
  }
};

// PUT /api/empresas/:id
export const updateEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.json(empresa);
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar empresa", error: err.message });
  }
};

// DELETE /api/empresas/:id
export const deleteEmpresa = async (req, res) => {
  try {
    const empresa = await Empresa.findByIdAndDelete(req.params.id);
    if (!empresa) return res.status(404).json({ message: "Empresa no encontrada" });
    res.json({ message: "Empresa eliminada correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar empresa", error: err.message });
  }
};

// PUT /api/empresas/correo
export const registrarCorreoEnviado = async (req, res) => {
  try {
    const { empresaId, correo } = req.body;

    // Validar que lleguen los datos
    if (!empresaId || !correo) {
      return res.status(400).json({ message: "empresaId y correo son requeridos" });
    }

    // Validar que empresaId sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(empresaId)) {
      return res.status(400).json({ message: "empresaId inválido" });
    }

    const empresa = await Empresa.findById(empresaId);
    if (!empresa) {
      return res.status(404).json({ message: "Empresa no encontrada" });
    }

    // Buscar contacto ignorando espacios y diferencias de mayúsculas
    const correoBuscado = correo.trim().toLowerCase();
    const contacto = empresa.contactos.find(
      (c) => c.correo?.trim().toLowerCase() === correoBuscado
    );

    if (!contacto) {
      return res.status(404).json({
        message: `Contacto con correo "${correo}" no encontrado`,
        contactosDisponibles: empresa.contactos.map((c) => c.correo),
      });
    }

    contacto.fechaUltimoCorreo = new Date();
    await empresa.save();

    res.json({
      message: "Fecha de correo actualizada",
      contacto: {
        nombre: contacto.nombre,
        correo: contacto.correo,
        fechaUltimoCorreo: contacto.fechaUltimoCorreo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};