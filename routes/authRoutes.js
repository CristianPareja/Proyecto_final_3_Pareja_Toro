// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { User } = require("../models");

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const {
      username,
      password,
      full_name,
      phone,
      bank_name,
      account_type,
      account_number,
    } = req.body;

    if (!username || !password) {
      throw { status: 400, message: "username y password son obligatorios" };
    }

    const exists = await User.findOne({ where: { username } });
    if (exists) throw { status: 409, message: "El usuario ya existe" };

    const password_hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      username: username.trim(),
      password_hash,
      full_name: full_name?.trim() || null,
      phone: phone ? String(phone).replace(/[^\d]/g, "") : null,
      bank_name: bank_name?.trim() || null,
      account_type: account_type?.trim() || null,
      account_number: account_number?.trim() || null,
    });

    res.status(201).json({
      message: "Usuario creado",
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      throw { status: 400, message: "username y password son obligatorios" };
    }

    const user = await User.findOne({ where: { username } });
    if (!user) throw { status: 401, message: "Credenciales incorrectas" };

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) throw { status: 401, message: "Credenciales incorrectas" };

    if (!process.env.JWT_SECRET) {
      throw { status: 500, message: "JWT_SECRET no configurado" };
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
