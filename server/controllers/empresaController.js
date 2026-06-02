import Empresa from "../models/Empresa.js";
import mongoose from "mongoose";

export const getEmpresas = async (req, res) => {
  try {
    const { parqueIndustrialId } = req.query;
    const filter = parqueIndustrialId
      ? { parqueIndustrialId: new mongoose.Types.ObjectId(parqueIndustrialId) } // ← fix
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