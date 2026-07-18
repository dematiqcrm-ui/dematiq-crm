import express from "express";
import cors from "cors";
import dotenv from "dotenv";


import { connectDB } from "./config/database.js";
import parqueRoutes from "./routes/parqueRoutes.js";
import empresaRoutes from "./routes/empresaRoutes.js";
import reporteRoutes from "./routes/reporteRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import proveedorRoutes from "./routes/proveedorRoutes.js";
import correoRoutes from "./routes/correoRoutes.js";
import cuentaCorreoRoutes from "./routes/cuentaCorreoRoutes.js"; // ← agregar
import systemRoutes from "./routes/systemRoutes.js"; // ← agregar

dotenv.config();

console.log("MONGO_URI =", process.env.MONGO_URI);

connectDB();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

app.use("/api/parques",        parqueRoutes);
app.use("/api/empresas",       empresaRoutes);
app.use("/api/reportes",       reporteRoutes);
app.use("/api/auth",           authRoutes);
app.use("/api/correo",         correoRoutes);
app.use("/api/cuentas-correo", cuentaCorreoRoutes); // ← agregar
app.use("/api/system",         systemRoutes);        // ← agregar
app.use("/api/proveedores",    proveedorRoutes);
app.use("/api",                exportRoutes);

app.get("/", (req, res) => {
  res.json({ mensaje: "API funcionando" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});