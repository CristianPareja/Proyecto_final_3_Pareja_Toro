// routes/productRoutes.js
const express = require("express");
const router = express.Router();

const { Product, User } = require("../models");

const auth = require("../middlewares/auth"); 
// auth debe dejar el usuario en: req.user = { id, username, ... }

// Helpers

function toInt(v, def = 0) {
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? def : n;
}

function toNumber(v, def = 0) {
  const n = Number(v);
  return Number.isNaN(n) ? def : n;
}

// GET /api/products

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.findAll({
      where: { quantity: { [require("sequelize").Op.gt]: 0 } },
      order: [["id", "DESC"]],
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "full_name", "phone", "bank_name", "account_type", "account_number"],
        },
      ],
    });

    return res.json({ products });
  } catch (err) {
    return next(err);
  }
});

// POST /api/products

router.post("/", auth, async (req, res, next) => {
  try {
    const { name, description, quantity, price } = req.body || {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: "El nombre es obligatorio" });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ message: "La descripción es obligatoria" });
    }

    const qty = toInt(quantity, -1);
    if (qty < 0) {
      return res.status(400).json({ message: "quantity debe ser un número >= 0" });
    }

    const pr = toNumber(price, -1);
    if (pr < 0) {
      return res.status(400).json({ message: "price debe ser un número >= 0" });
    }

    const seller_id = req.user.id;

    const created = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      quantity: qty,
      price: pr,
      seller_id,
    });

    return res.status(201).json({ product: created });
  } catch (err) {
    return next(err);
  }
});

// PUT /api/products/:id

router.put("/:id", auth, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    // Solo dueño
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ message: "No puedes editar un producto que no es tuyo" });
    }

    const { name, description, quantity, price } = req.body || {};

    if (name !== undefined) {
      if (!String(name).trim()) return res.status(400).json({ message: "name inválido" });
      product.name = String(name).trim();
    }
    if (description !== undefined) {
      if (!String(description).trim()) return res.status(400).json({ message: "description inválido" });
      product.description = String(description).trim();
    }
    if (quantity !== undefined) {
      const qty = toInt(quantity, -1);
      if (qty < 0) return res.status(400).json({ message: "quantity debe ser >= 0" });
      product.quantity = qty;
    }
    if (price !== undefined) {
      const pr = toNumber(price, -1);
      if (pr < 0) return res.status(400).json({ message: "price debe ser >= 0" });
      product.price = pr;
    }

    await product.save();
    return res.json({ product });
  } catch (err) {
    return next(err);
  }
});


// DELETE /api/products/:id

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    // Solo dueño
    if (product.seller_id !== req.user.id) {
      return res.status(403).json({ message: "No puedes eliminar un producto que no es tuyo" });
    }

    await product.destroy();
    return res.json({ message: "Producto eliminado" });
  } catch (err) {
    return next(err);
  }
});


// POST /api/products/:id/buy
// Compra directa (baja stock) - requiere login

router.post("/:id/buy", auth, async (req, res, next) => {
  try {
    const id = toInt(req.params.id);
    const qty = toInt(req.body?.quantity, 0);

    if (qty <= 0) return res.status(400).json({ message: "quantity debe ser > 0" });

    const product = await Product.findByPk(id);

    if (!product) return res.status(404).json({ message: "Producto no encontrado" });

    if (product.quantity < qty) {
      return res.status(400).json({ message: "No hay stock suficiente" });
    }

    // Evitar que el vendedor se compre a sí mismo 
    if (product.seller_id === req.user.id) {
      return res.status(400).json({ message: "No puedes comprar tu propio producto" });
    }

    product.quantity = product.quantity - qty;
    await product.save();

    return res.json({
      message: "Compra realizada (stock actualizado)",
      product: {
        id: product.id,
        name: product.name,
        quantity: product.quantity,
      },
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
