// services/orderService.js
const sequelize = require("../database");
const { Product, Order, OrderItem } = require("../models");

class OrderService {
  async buyProduct(productId, buyerId, quantity) {
    const pid = parseInt(productId, 10);
    const bid = parseInt(buyerId, 10);
    const qty = parseInt(quantity, 10);

    // ✅ Validaciones básicas
    if (isNaN(pid)) throw { status: 400, message: "Invalid product ID" };
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "Invalid buyer (token)" };

    // quantity debe ser entero y > 0
    if (!Number.isInteger(qty) || qty <= 0) {
      throw { status: 400, message: "Quantity must be an integer > 0" };
    }

    // ✅ Transacción: si falla algo, no se guarda nada
    try {
      const result = await sequelize.transaction(
        { isolationLevel: sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED },
        async (t) => {
          // 🔒 Bloqueo para que 2 compras simultáneas no dañen stock
          const product = await Product.findByPk(pid, {
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          if (!product) throw { status: 404, message: "Product not found" };

          // No comprar tu propio producto
          if (product.seller_id === bid) {
            throw { status: 400, message: "You cannot buy your own product" };
          }

          // Stock suficiente
          if (product.quantity < qty) {
            throw {
              status: 400,
              message: `Not enough stock. Available: ${product.quantity}`,
            };
          }

          // Precio válido
          const unitPrice = Number(product.price);
          if (isNaN(unitPrice) || unitPrice <= 0) {
            throw { status: 500, message: "Invalid product price stored" };
          }

          const total = Number((unitPrice * qty).toFixed(2));

          // 1) Crear orden
          const order = await Order.create(
            { buyer_id: bid, total },
            { transaction: t }
          );

          // 2) Crear item
          await OrderItem.create(
            {
              order_id: order.id,
              product_id: product.id,
              quantity: qty,
              unit_price: unitPrice,
            },
            { transaction: t }
          );

          // 3) Actualizar stock
          product.quantity = product.quantity - qty;
          await product.save({ transaction: t });

          // respuesta
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
        }
      );

      return result;
    } catch (err) {
      // ✅ Si err ya viene con {status, message}, lo dejamos pasar
      if (err && err.status) throw err;

      // Si es un error real de Sequelize o del sistema
      console.error("❌ BUY ERROR:", err);
      throw { status: 500, message: "Error processing purchase" };
    }
  }
}

module.exports = new OrderService();
