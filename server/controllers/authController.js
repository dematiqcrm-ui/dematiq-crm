import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// REGISTRO
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const existe = await User.findOne({ email });

    if (existe) {
      return res.status(400).json({
        message: "El usuario ya existe",
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nombre,
      email,
      password: hash,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    const valid = await bcrypt.compare(
      password,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        message: "Credenciales inválidas",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.json({
      token,
      user: {
        _id: user._id,
        nombre: user.nombre,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ACTUALIZAR PERFIL
export const updateProfile = async (
  req,
  res
) => {
  try {
    const { nombre, email } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        nombre,
        email,
      },
      {
        new: true,
      }
    );

    res.json({
      _id: user._id,
      nombre: user.nombre,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const verifyPassword = async (req, res) => {
  try {
    const { password } = req.body;
    console.log("password recibido:", password);
    console.log("user id:", req.user.id);
    const user = await User.findById(req.user.id);
    console.log("hash en BD:", user.password);
    const valid = await bcrypt.compare(password, user.password);
    console.log("válido:", valid);
    if (!valid) return res.status(400).json({ message: "Contraseña incorrecta" });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// CAMBIAR CONTRASEÑA
export const changePassword = async (
  req,
  res
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const user = await User.findById(
      req.user.id
    );

    const valid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!valid) {
      return res.status(400).json({
        message:
          "Contraseña actual incorrecta",
      });
    }

    const hash = await bcrypt.hash(
      newPassword,
      10
    );

    user.password = hash;

    await user.save();

    res.json({
      message:
        "Contraseña actualizada correctamente",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};