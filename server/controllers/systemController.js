import mongoose from "mongoose";

// GET /api/system/db-stats
// Devuelve el tamaño de la base de datos usando db.stats() de MongoDB.
export const getDbStats = async (req, res) => {
  try {
    const stats = await mongoose.connection.db.stats();

    res.json({
      dataSize: stats.dataSize,       // tamaño de los documentos (sin índices)
      storageSize: stats.storageSize, // tamaño reservado en disco
      indexSize: stats.indexSize,     // tamaño de todos los índices
      totalSize: (stats.dataSize || 0) + (stats.indexSize || 0),
      collections: stats.collections,
      objects: stats.objects,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error al obtener estadísticas de la base de datos",
      error: err.message,
    });
  }
};