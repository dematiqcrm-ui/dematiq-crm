import mongoose from "mongoose";

const parqueIndustrialSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },

    estado: {
      type: String,
      required: true,
    },

    municipio: {
      type: String,
      required: true,
    },

    direccion: {
      type: String,
      default: "",
    },

    notas: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ParqueIndustrial",
  parqueIndustrialSchema
);