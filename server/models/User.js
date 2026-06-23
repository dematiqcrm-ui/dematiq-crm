import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },

    usuario: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    rol: {
      type: String,
      default: "admin",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "User",
  userSchema
);