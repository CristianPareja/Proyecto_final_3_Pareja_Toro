// routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const auth = require("../middlewares/auth");
const orderService = require("../services/orderService");

// POST /api/orders  -> crea compra (baja stock)
router.post("/", auth, async (req, res, next) => {
  try {

    const buyerId = req.user?.id || req.user?.userId || req.user?.sub;
    if (!buyerId) return res.status(401).json({ message: "No user id in token", status: 401 });

    const result = await orderService.createSingleProductOrder({
      buyerId,
      productId: req.body.productId,
      quantity: req.body.quantity,
      payment_method: req.body.payment_method || "CASH_ON_DELIVERY",
      contact_phone: req.body.contact_phone || null,
      contact_email: req.body.contact_email || null,
    });

    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
