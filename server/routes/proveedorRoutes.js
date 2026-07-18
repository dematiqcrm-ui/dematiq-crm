import express from "express";
import {
  getProveedores,
  getProveedor,
  createProveedor,
  updateProveedor,
  deleteProveedor,
} from "../controllers/proveedorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/",     protect, getProveedores);
router.get("/:id",  protect, getProveedor);
router.post("/",    protect, createProveedor);
router.put("/:id",  protect, updateProveedor);
router.delete("/:id", protect, deleteProveedor);

export default router;