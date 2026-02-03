const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const orderService = require("../services/orderService");

// ✅ POST /api/orders/checkout -> crea orden + items desde carrito
router.post("/checkout", auth, async (req, res, next) => {
  try {
    const { items, contact } = req.body;
    const result = await orderService.checkoutCart(req.user.id, items, contact);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// ✅ GET /api/orders/my -> historial del comprador logueado
router.get("/my", auth, async (req, res, next) => {
  try {
    const result = await orderService.getMyPurchases(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
