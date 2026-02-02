// services/orderService.js
const sequelize = require("../database");
const { Product, Order, OrderItem } = require("../models");

class OrderService {
  // Comprar 1 producto (por ahora simple)
  async buyProduct(productId, buyerId, quantity) {
    const pid = parseInt(productId);
    const bid = parseInt(buyerId);
    const qty = parseInt(quantity);

    if (isNaN(pid)) throw { status: 400, message: "Invalid product ID" };
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "Invalid buyer (token)" };
    if (isNaN(qty) || qty <= 0) throw { status: 400, message: "Quantity must be a number > 0" };

    // Transacción: o se hace todo, o no se hace nada
    return await sequelize.transaction(async (t) => {
      // ⚠️ lock para evitar compras simultáneas que rompan el stock
      const product = await Product.findByPk(pid, { transaction: t, lock: t.LOCK.UPDATE });

      if (!product) throw { status: 404, message: "Product not found" };

      // opcional: evitar comprarte a ti mismo
      if (product.seller_id === bid) {
        throw { status: 400, message: "You cannot buy your own product" };
      }

      if (product.quantity < qty) {
        throw { status: 400, message: `Not enough stock. Available: ${product.quantity}` };
      }

      const unitPrice = Number(product.price);
      const total = Number((unitPrice * qty).toFixed(2));

      // 1) crear orden
      const order = await Order.create(
        { buyer_id: bid, total },
        { transaction: t }
      );

      // 2) crear item
      await OrderItem.create(
        {
          order_id: order.id,
          product_id: product.id,
          quantity: qty,
          unit_price: unitPrice,
        },
        { transaction: t }
      );

      // 3) actualizar stock
      product.quantity = product.quantity - qty;
      await product.save({ transaction: t });

      // devolver orden con item (simple)
      return {
        message: "Purchase successful",
        order: {
          id: order.id,
          buyer_id: order.buyer_id,
          total: order.total,
          created_at: order.created_at,
        },
        product: {
          id: product.id,
          name: product.name,
          remaining_quantity: product.quantity,
        },
      };
    });
  }
}

module.exports = new OrderService();
