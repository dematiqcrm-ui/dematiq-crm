import Empresa from "../models/Empresa.js";

// GET /api/proveedores
export const getProveedores = async (req, res) => {
  try {
    const proveedores = await Empresa.find({ tipo: "proveedor" }).sort({ createdAt: -1 });
    res.json(proveedores);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proveedores", error: err.message });
  }
};

// GET /api/proveedores/:id
export const getProveedor = async (req, res) => {
  try {
    const proveedor = await Empresa.findOne({ _id: req.params.id, tipo: "proveedor" });
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json(proveedor);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener proveedor", error: err.message });
  }
};

// POST /api/proveedores
export const createProveedor = async (req, res) => {
  try {
    const { parqueIndustrialId, ...resto } = req.body;
    const proveedor = new Empresa({ ...resto, tipo: "proveedor" });
    const saved = await proveedor.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: "Error al crear proveedor", error: err.message });
  }
};

// PUT /api/proveedores/:id
export const updateProveedor = async (req, res) => {
  try {
    const { parqueIndustrialId, ...resto } = req.body;
    const proveedor = await Empresa.findOneAndUpdate(
      { _id: req.params.id, tipo: "proveedor" },
      { ...resto, tipo: "proveedor" },
      { new: true, runValidators: true }
    );
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json(proveedor);
  } catch (err) {
    res.status(400).json({ message: "Error al actualizar proveedor", error: err.message });
  }
};

// DELETE /api/proveedores/:id
export const deleteProveedor = async (req, res) => {
  try {
    const proveedor = await Empresa.findOneAndDelete({ _id: req.params.id, tipo: "proveedor" });
    if (!proveedor) return res.status(404).json({ message: "Proveedor no encontrado" });
    res.json({ message: "Proveedor eliminado correctamente" });
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar proveedor", error: err.message });
  }
};