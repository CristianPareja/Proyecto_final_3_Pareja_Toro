// services/orderService.js
const { Order, OrderItem, Product } = require("../models");

class OrderService {
  async createSingleProductOrder({ buyerId, productId, quantity, payment_method, contact_phone, contact_email }) {
    const pid = Number(productId);
    const qty = Number(quantity);

    if (!pid || Number.isNaN(pid)) {
      const e = new Error("productId inválido");
      e.status = 400;
      throw e;
    }
    if (!qty || Number.isNaN(qty) || qty <= 0) {
      const e = new Error("quantity inválida");
      e.status = 400;
      throw e;
    }

    const product = await Product.findByPk(pid);
    if (!product) {
      const e = new Error("Producto no existe");
      e.status = 404;
      throw e;
    }

    // No permitir comprar tu propio producto
    if (Number(product.seller_id) === Number(buyerId)) {
      const e = new Error("No puedes comprar tu propio producto");
      e.status = 400;
      throw e;
    }

    if (qty > Number(product.quantity)) {
      const e = new Error("No hay stock suficiente");
      e.status = 400;
      throw e;
    }

    const unitPrice = Number(product.price);
    const total = unitPrice * qty;

    // Transacción (muy importante para consistencia)
    const sequelize = Product.sequelize;

    return await sequelize.transaction(async (t) => {
      // bajar stock
      product.quantity = Number(product.quantity) - qty;
      await product.save({ transaction: t });

      // crear orden
      const order = await Order.create(
        {
          buyer_id: buyerId,
          total,
          payment_method: payment_method || "CASH_ON_DELIVERY",
          status: "PENDING",
          contact_phone: contact_phone || null,
          contact_email: contact_email || null,
        },
        { transaction: t }
      );

      // crear item
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
        },
        { transaction: t }
      );

      return {
        message: "Compra creada",
        order: {
          id: order.id,
          buyer_id: order.buyer_id,
          total: order.total,
          status: order.status,
          payment_method: order.payment_method,
          created_at: order.created_at,
        },
        product: {
          id: product.id,
          name: product.name,
          remaining_stock: product.quantity,
        },
      };
    });
  }
}

module.exports = new OrderService();
