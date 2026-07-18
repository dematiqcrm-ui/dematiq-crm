import mongoose from "mongoose";

// Un contacto puede tener varios teléfonos (fijo, celular, otro contacto, etc.)
const telefonoSchema = new mongoose.Schema(
  {
    tipo: {
      type: String,
      default: "",
    },
    numero: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const contactoSchema = new mongoose.Schema(
  {
    nombre: String,
    puesto: String,
    correo: String,
    telefono: String,
    telefonos: { type: [telefonoSchema], default: [] },
    nota: { type: String, default: "" },
    fechaUltimoCorreo: { type: Date, default: null },
  },
  { _id: false }
);

const empresaSchema = new mongoose.Schema(
  {
    parqueIndustrialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParqueIndustrial",
      required: false,
    },

    numero: String,

    empresa: {
      type: String,
      required: true,
    },

    giroEmpresa: String,

    direccion: String,

    telefono: String,

    telefonosExtra: { type: [telefonoSchema], default: [] },

    paginaWeb: String,

    notas: String,

    estado: String,

    municipio: String,

    contactos: [contactoSchema],

    tipo: {
      type: String,
      enum: ["empresa", "proveedor"],
      default: "empresa",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Empresa",
  empresaSchema
);