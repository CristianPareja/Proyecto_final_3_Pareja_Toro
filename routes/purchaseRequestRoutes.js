const express = require("express");
const router = express.Router();

const sequelize = require("../database");
const { User, Product, Order, OrderItem, PurchaseRequest } = require("../models");
const auth = require("../middlewares/auth");

/* =====================================================
   BUYER: crear solicitud de compra (PENDING)
   NO baja stock
===================================================== */
router.post("/", auth, async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const { productId, quantity } = req.body;

    const qty = Number(quantity);
    if (!productId || isNaN(productId)) {
      return res.status(400).json({ message: "productId inválido" });
    }
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: "quantity inválida" });
    }

    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Producto no existe" });

    if (qty > product.quantity) {
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    if (product.seller_id === buyerId) {
      return res.status(400).json({ message: "No puedes comprar tu propio producto" });
    }

    const pr = await PurchaseRequest.create({
      product_id: product.id,
      seller_id: product.seller_id,
      buyer_id: buyerId,
      quantity: qty,
      status: "PENDING",
    });

    return res.json({ id: pr.id, status: pr.status });
  } catch (err) {
    next(err);
  }
});

/* =====================================================
   SELLER: ver solicitudes pendientes (NOTIFICACIONES)
   🔔 ESTA ES LA CLAVE
===================================================== */
router.get("/seller/pending", auth, async (req, res, next) => {
  try {
    const sellerId = req.user.id;

    const requests = await PurchaseRequest.findAll({
      where: {
        seller_id: sellerId,
        status: "PENDING",
      },
      order: [["created_at", "DESC"]],
      include: [
        {
          model: Product,
          as: "product",
          attributes: ["id", "name", "price"],
        },
        {
          model: User,
          as: "buyer",
          attributes: ["id", "username", "full_name", "phone"],
        },
      ],
    });

    return res.json({ requests });
  } catch (err) {
    next(err);
  }
});

/* =====================================================
   BUYER: ver estado + datos bancarios si ACCEPTED
===================================================== */
router.get("/:id/can-see-bank", auth, async (req, res, next) => {
  try {
    const buyerId = req.user.id;
    const pr = await PurchaseRequest.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: [
            "id",
            "username",
            "full_name",
            "phone",
            "bank_name",
            "account_type",
            "account_number",
          ],
        },
      ],
    });

    if (!pr) return res.status(404).json({ message: "Solicitud no existe" });
    if (pr.buyer_id !== buyerId) return res.status(403).json({ message: "No autorizado" });

    const accepted = pr.status === "ACCEPTED";

    return res.json({
      status: pr.status,
      canSeeBank: accepted,
      seller: accepted
        ? pr.seller
        : {
            id: pr.seller.id,
            username: pr.seller.username,
            full_name: pr.seller.full_name,
            phone: pr.seller.phone,
          },
    });
  } catch (err) {
    next(err);
  }
});

/* =====================================================
   SELLER: aceptar solicitud
   ✔ baja stock
   ✔ crea orden
===================================================== */
router.post("/:id/accept", auth, async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const sellerId = req.user.id;
    const pr = await PurchaseRequest.findByPk(req.params.id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!pr) {
      await t.rollback();
      return res.status(404).json({ message: "Solicitud no existe" });
    }

    if (pr.seller_id !== sellerId) {
      await t.rollback();
      return res.status(403).json({ message: "No autorizado" });
    }

    if (pr.status !== "PENDING") {
      await t.rollback();
      return res.status(400).json({ message: "Solicitud ya procesada" });
    }

    const product = await Product.findByPk(pr.product_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (product.quantity < pr.quantity) {
      await t.rollback();
      return res.status(400).json({ message: "Stock insuficiente" });
    }

    product.quantity -= pr.quantity;
    await product.save({ transaction: t });

    const total = product.price * pr.quantity;

    const order = await Order.create(
      {
        buyer_id: pr.buyer_id,
        total,
        payment_method: "CONTRAENTREGA",
        status: "CONFIRMED",
      },
      { transaction: t }
    );

    await OrderItem.create(
      {
        order_id: order.id,
        product_id: product.id,
        quantity: pr.quantity,
        unit_price: product.price,
      },
      { transaction: t }
    );

    pr.status = "ACCEPTED";
    await pr.save({ transaction: t });

    await t.commit();
    return res.json({ status: "ACCEPTED" });
  } catch (err) {
    await t.rollback();
    next(err);
  }
});

/* =====================================================
   SELLER: rechazar solicitud
===================================================== */
router.post("/:id/reject", auth, async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const pr = await PurchaseRequest.findByPk(req.params.id);

    if (!pr) return res.status(404).json({ message: "Solicitud no existe" });
    if (pr.seller_id !== sellerId) return res.status(403).json({ message: "No autorizado" });

    pr.status = "REJECTED";
    await pr.save();

    return res.json({ status: "REJECTED" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
