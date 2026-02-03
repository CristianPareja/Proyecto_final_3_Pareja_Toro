// routes/productRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const productService = require("../services/productService");

// GET all (solo con stock)
router.get("/", async (req, res, next) => {
  try {
    const result = await productService.findAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET by id
router.get("/:id", async (req, res, next) => {
  try {
    const result = await productService.findProductById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST create (vendedor)
router.post("/", auth, async (req, res, next) => {
  try {
    const newProduct = await productService.create(req.body, req.user.id);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ POST request purchase (comprador compra 1 producto)
router.post("/:id/request-purchase", auth, async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const result = await productService.requestPurchase(req.params.id, req.user.id, quantity);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT update
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updated = await productService.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const deleted = await productService.delete(req.params.id);
    res.json(deleted);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
