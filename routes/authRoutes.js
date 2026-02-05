const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
