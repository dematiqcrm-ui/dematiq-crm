import mongoose from "mongoose";

const contactoSchema = new mongoose.Schema(
  {
    nombre: String,

    puesto: String,

    correo: String,

    telefono: String,
  },
  {
    _id: false,
  }
);

const empresaSchema = new mongoose.Schema(
  {
    parqueIndustrialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParqueIndustrial",
      required: true,
    },

    numero: String,

    empresa: {
      type: String,
      required: true,
    },

    giroEmpresa: String,

    direccion: String,

    telefono: String,

    paginaWeb: String,

    notas: String,

    estado: String,

    municipio: String,

    contactos: [contactoSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Empresa",
  empresaSchema
);