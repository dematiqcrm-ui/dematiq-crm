import Empresa from "../models/Empresa.js";
import ParqueIndustrial from "../models/ParqueIndustrial.js";

export const getEmpresasIncompletas = async (req, res) => {
  try {
    const empresas = await Empresa.find().populate("parqueIndustrialId", "nombre");

    const resultado = empresas
      .map((empresa) => {
        const faltantes = [];
        if (!empresa.giroEmpresa) faltantes.push("Giro");
        if (!empresa.direccion) faltantes.push("Dirección");
        if (!empresa.telefono) faltantes.push("Teléfono");
        if (!empresa.paginaWeb) faltantes.push("Página Web");
        if (!empresa.contactos || empresa.contactos.length === 0) faltantes.push("Contactos");
        return {
          _id: empresa._id,
          empresa: empresa.empresa,
          parque: empresa.parqueIndustrialId?.nombre || "",
          parqueId: empresa.parqueIndustrialId?._id || "",
          faltantes,
        };
      })
      .filter((empresa) => empresa.faltantes.length > 0);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getParquesIncompletos = async (req, res) => {
  try {
    const parques = await ParqueIndustrial.find();

    const resultado = parques
      .map((parque) => {
        const faltantes = [];
        if (!parque.direccion) faltantes.push("Dirección");
        if (!parque.notas) faltantes.push("Notas");
        return {
          _id: parque._id,
          nombre: parque.nombre,
          estado: parque.estado,
          municipio: parque.municipio,
          faltantes,
        };
      })
      .filter((parque) => parque.faltantes.length > 0);

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const empresasPorEstado = async (req, res) => {
  try {
    const parques = await ParqueIndustrial.find({}, "_id nombre estado");

    const resultado = await Promise.all(
      parques.map(async (parque) => {
        const total = await Empresa.countDocuments({
          parqueIndustrialId: parque._id,
        });
        return { estado: parque.estado, total };
      })
    );

    // Agrupar por estado sumando empresas de todos los parques del mismo estado
    const agrupado = resultado.reduce((acc, item) => {
      if (!item.estado) return acc;
      acc[item.estado] = (acc[item.estado] || 0) + item.total;
      return acc;
    }, {});

    const data = Object.entries(agrupado)
      .map(([estado, total]) => ({ estado, total }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getResumen = async (req, res) => {
  try {
    const empresas = await Empresa.countDocuments();
    const parques = await ParqueIndustrial.countDocuments();
    const contactos = await Empresa.aggregate([
      { $project: { totalContactos: { $size: "$contactos" } } },
      { $group: { _id: null, total: { $sum: "$totalContactos" } } },
    ]);
    res.json({ empresas, parques, contactos: contactos[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const empresasPorGiro = async (req, res) => {
  try {
    const resultado = await Empresa.aggregate([
      { $match: { giroEmpresa: { $ne: "" } } },
      { $group: { _id: "$giroEmpresa", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json(resultado.map((item) => ({ giro: item._id, total: item.total })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const empresasPorParque = async (req, res) => {
  try {
    const parques = await ParqueIndustrial.find({}, "_id nombre");

    const resultado = await Promise.all(
      parques.map(async (parque) => {
        const total = await Empresa.countDocuments({
          parqueIndustrialId: parque._id,
        });
        return { parque: parque.nombre, total };
      })
    );

    const data = resultado
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};