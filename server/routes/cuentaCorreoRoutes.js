import express from "express";
import {
  getCuentas,
  createCuenta,
  updateCuenta,
  deleteCuenta,
  testCuenta,
} from "../controllers/cuentaCorreoController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getCuentas);
router.post("/", protect, createCuenta);
router.put("/:id", protect, updateCuenta);
router.delete("/:id", protect, deleteCuenta);
router.post("/:id/test", protect, testCuenta);

export default router;