import express from "express";

import {
  register,
  login,
  updateProfile,
  changePassword,
  verifyPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-password", protect, verifyPassword);

router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;