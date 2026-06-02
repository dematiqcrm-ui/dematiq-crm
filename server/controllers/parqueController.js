import ParqueIndustrial from "../models/ParqueIndustrial.js";

// Obtener todos
export const getParques = async (req, res) => {
  try {
    const parques = await ParqueIndustrial.find().sort({
      nombre: 1,
    });

    res.json(parques);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Obtener uno
export const getParque = async (req, res) => {
  try {
    const parque = await ParqueIndustrial.findById(
      req.params.id
    );

    if (!parque) {
      return res.status(404).json({
        message: "Parque no encontrado",
      });
    }

    res.json(parque);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Crear
export const createParque = async (req, res) => {
  try {
    const parque = await ParqueIndustrial.create(
      req.body
    );

    res.status(201).json(parque);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Actualizar
export const updateParque = async (req, res) => {
  try {
    const parque =
      await ParqueIndustrial.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    if (!parque) {
      return res.status(404).json({
        message: "Parque no encontrado",
      });
    }

    res.json(parque);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// Eliminar
export const deleteParque = async (req, res) => {
  try {
    const parque =
      await ParqueIndustrial.findByIdAndDelete(
        req.params.id
      );

    if (!parque) {
      return res.status(404).json({
        message: "Parque no encontrado",
      });
    }

    res.json({
      message: "Parque eliminado",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};