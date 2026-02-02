// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const productService = require("../services/productService");
const orderService = require("../services/orderService");

// ✅ GET por rango de cantidad (DEBE ir antes de "/:id")
router.get("/quantity/:min/:max", async (req, res, next) => {
  try {
    const result = await productService.findProductByQuantity(req.params.min, req.params.max);
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

// ✅ GET by id
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

// ✅ BUY product (protegido)
// POST /api/products/:id/buy
// Body: { "quantity": 2 }
router.post("/:id/buy", auth, async (req, res, next) => {
  try {
    const result = await orderService.buyProduct(req.params.id, req.user.id, req.body?.quantity);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ PUT update (protegido + dueño)
router.put("/:id", auth, async (req, res, next) => {
  try {
    const updatedProduct = await productService.update(req.params.id, req.body, req.user.id);
    res.json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

// ✅ DELETE (protegido + dueño)
router.delete("/:id", auth, async (req, res, next) => {
  try {
    const result = await productService.delete(req.params.id, req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
