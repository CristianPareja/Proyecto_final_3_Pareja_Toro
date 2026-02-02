const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const productService = require("../services/productService");

// ✅ GET por rango de cantidad (DEBE IR ANTES de "/:id")
router.get("/quantity/:min/:max", async (req, res, next) => {
  try {
    const minQ = parseInt(req.params.min);
    const maxQ = parseInt(req.params.max);
    const result = await productService.findProductByQuantity(minQ, maxQ);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ GET all
router.get("/", async (req, res, next) => {
  try {
    const result = await productService.findAll();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ GET by id (va después de rutas específicas)
router.get("/:id", async (req, res, next) => {
  try {
    const result = await productService.findProductById(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ POST create (protegido)
router.post("/", auth, async (req, res, next) => {
  try {
    const newProduct = await productService.create(req.body, req.user.id);
    res.status(201).json(newProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ PUT update (protegido)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updatedProduct = await productService.update(req.params.id, req.body, req.user.id);
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ DELETE (protegido)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const deletedProduct = await productService.delete(req.params.id, req.user.id);
    res.json(deletedProduct);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
