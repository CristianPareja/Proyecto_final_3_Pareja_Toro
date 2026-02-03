// services/orderService.js
const sequelize = require("../database");
const { Product, Order, OrderItem, User } = require("../models");

// Helper: construir link WhatsApp
function buildWaLink(phone, text) {
  // phone debe ir sin +, sin espacios. Ej: 593999999999
  const safePhone = String(phone || "").replace(/[^\d]/g, "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${safePhone}?text=${encoded}`;
}

class OrderService {
  // =========================
  // ✅ COMPRA INDIVIDUAL (ya la tenías)
  // =========================
  async buyProduct(productId, buyerId, quantity) {
    const pid = parseInt(productId, 10);
    const bid = parseInt(buyerId, 10);
    const qty = parseInt(quantity, 10);

    if (isNaN(pid)) throw { status: 400, message: "Invalid product ID" };
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "Invalid buyer (token)" };
    if (!Number.isInteger(qty) || qty <= 0) throw { status: 400, message: "Quantity must be an integer > 0" };

    try {
      return await sequelize.transaction(async (t) => {
        const product = await Product.findByPk(pid, { transaction: t, lock: t.LOCK.UPDATE });
        if (!product) throw { status: 404, message: "Product not found" };
        if (product.seller_id === bid) throw { status: 400, message: "You cannot buy your own product" };
        if (product.quantity < qty) throw { status: 400, message: `Not enough stock. Available: ${product.quantity}` };

        const unitPrice = Number(product.price);
        const total = Number((unitPrice * qty).toFixed(2));

        const order = await Order.create(
          { buyer_id: bid, total, payment_method: "CASH_ON_DELIVERY", status: "PENDING" },
          { transaction: t }
        );

        await OrderItem.create(
          { order_id: order.id, product_id: product.id, quantity: qty, unit_price: unitPrice },
          { transaction: t }
        );

        product.quantity -= qty;
        await product.save({ transaction: t });

        return { message: "Purchase successful", order_id: order.id };
      });
    } catch (err) {
      if (err && err.status) throw err;
      console.error("❌ BUY ERROR:", err);
      throw { status: 500, message: err?.message || "Error processing purchase" };
    }
  }

  // =========================
  // ✅ CHECKOUT DEL CARRITO (NUEVO)
  // =========================
  async checkoutCart(buyerId, items, contact = {}) {
    const bid = parseInt(buyerId, 10);
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "Invalid buyer (token)" };

    if (!Array.isArray(items) || items.length === 0) {
      throw { status: 400, message: "Cart is empty" };
    }

    const contactPhone = contact.phone ? String(contact.phone).trim() : null;
    const contactEmail = contact.email ? String(contact.email).trim() : null;

    // teléfono o email al menos 1 (como pediste)
    if (!contactPhone && !contactEmail) {
      throw { status: 400, message: "Provide phone or email to contact you" };
    }

    // normalizar items
    const normalized = items.map((it) => ({
      product_id: parseInt(it.product_id, 10),
      quantity: parseInt(it.quantity, 10),
    }));

    for (const it of normalized) {
      if (isNaN(it.product_id)) throw { status: 400, message: "Invalid product_id in cart" };
      if (!Number.isInteger(it.quantity) || it.quantity <= 0) throw { status: 400, message: "Invalid quantity in cart" };
    }

    try {
      return await sequelize.transaction(async (t) => {
        // cargar productos y bloquearlos
        const ids = normalized.map((x) => x.product_id);

        const products = await Product.findAll({
          where: { id: ids },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (products.length !== ids.length) {
          throw { status: 404, message: "Some products were not found" };
        }

        // map id->product
        const map = new Map(products.map((p) => [p.id, p]));

        // validar y calcular total
        let total = 0;

        // agrupar por vendedor para generar mensajes
        // seller_id -> array de items {product, qty, subtotal}
        const bySeller = new Map();

        for (const it of normalized) {
          const p = map.get(it.product_id);

          if (p.seller_id === bid) {
            throw { status: 400, message: "You cannot buy your own product" };
          }

          if (p.quantity < it.quantity) {
            throw { status: 400, message: `Not enough stock for "${p.name}". Available: ${p.quantity}` };
          }

          const unit = Number(p.price);
          const subtotal = Number((unit * it.quantity).toFixed(2));
          total += subtotal;

          if (!bySeller.has(p.seller_id)) bySeller.set(p.seller_id, []);
          bySeller.get(p.seller_id).push({
            product_id: p.id,
            name: p.name,
            quantity: it.quantity,
            unit_price: unit,
            subtotal,
          });
        }

        total = Number(total.toFixed(2));

        // crear orden
        const order = await Order.create(
          {
            buyer_id: bid,
            total,
            payment_method: "CASH_ON_DELIVERY",
            status: "PENDING",
            contact_phone: contactPhone,
            contact_email: contactEmail,
          },
          { transaction: t }
        );

        // crear items + actualizar stock
        for (const sellerItems of bySeller.values()) {
          for (const it of sellerItems) {
            const p = map.get(it.product_id);

            await OrderItem.create(
              {
                order_id: order.id,
                product_id: p.id,
                quantity: it.quantity,
                unit_price: it.unit_price,
              },
              { transaction: t }
            );

            p.quantity -= it.quantity;
            await p.save({ transaction: t });
          }
        }

        // buscar compradores/vendedores (para armar mensajes)
        const buyerUser = await User.findByPk(bid, { transaction: t });
        const buyerName = buyerUser?.username || `buyer#${bid}`;

        // obtener teléfonos de vendedores
        const sellerIds = Array.from(bySeller.keys());
        const sellers = await User.findAll({
          where: { id: sellerIds },
          attributes: ["id", "username", "phone"],
          transaction: t,
        });

        const sellerMap = new Map(sellers.map((s) => [s.id, s]));

        // construir mensajes por vendedor
        const waVendors = [];

        for (const [sellerId, sellerItems] of bySeller.entries()) {
          const seller = sellerMap.get(sellerId);
          const sellerPhone = seller?.phone; // ⚠️ si no tienes phone en User, puedes dejarlo null
          const sellerName = seller?.username || `seller#${sellerId}`;

          const lines = sellerItems
            .map((x) => `- ${x.quantity} x ${x.name} ($${x.unit_price}) = $${x.subtotal}`)
            .join("\n");

          const contactLine = contactPhone
            ? `📱 Contacto comprador (WhatsApp): ${contactPhone}`
            : `📧 Contacto comprador (Email): ${contactEmail}`;

          const msgToSeller =
            `Hola ${sellerName},\n` +
            `El usuario comprador "${buyerName}" desea adquirir (contraentrega en efectivo) estos productos:\n\n` +
            `${lines}\n\n` +
            `🧾 Orden: #${order.id}\n` +
            `💰 Total de esta orden: $${total}\n` +
            `${contactLine}\n\n` +
            `¿Podemos coordinar entrega?`;

          waVendors.push({
            seller_id: sellerId,
            seller_username: sellerName,
            seller_phone: sellerPhone || null,
            message: msgToSeller,
            wa_link: sellerPhone ? buildWaLink(sellerPhone, msgToSeller) : null,
            items: sellerItems,
          });
        }

        // mensaje para comprador (resumen)
        const msgToBuyer =
          `Vas a comprar (contraentrega en efectivo) estos productos.\n` +
          `🧾 Orden: #${order.id}\n` +
          `💰 Total: $${total}\n\n` +
          `Presiona para contactar a cada vendedor desde WhatsApp.`;

        return {
          message: "Checkout created (pending cash on delivery)",
          order_id: order.id,
          status: order.status,
          total,
          buyer_message: msgToBuyer,
          vendors: waVendors,
        };
      });
    } catch (err) {
      if (err && err.status) throw err;
      console.error("❌ CHECKOUT ERROR:", err);
      throw { status: 500, message: err?.message || "Error processing checkout" };
    }
  }

  // =========================
  // ✅ HISTORIAL: MIS COMPRAS (si ya lo tenías, te sirve igual)
  // =========================
  async getMyPurchases(buyerId) {
    const bid = parseInt(buyerId, 10);
    if (isNaN(bid) || bid <= 0) throw { status: 401, message: "Invalid buyer (token)" };

    const orders = await Order.findAll({
      where: { buyer_id: bid },
      order: [["id", "DESC"]],
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["id", "name", "description", "price", "seller_id"] }],
        },
      ],
    });

    const formatted = orders.map((o) => ({
      id: o.id,
      total: Number(o.total),
      status: o.status,
      payment_method: o.payment_method,
      contact_phone: o.contact_phone,
      contact_email: o.contact_email,
      created_at: o.created_at,
      items: (o.OrderItems || []).map((it) => ({
        id: it.id,
        quantity: it.quantity,
        unit_price: Number(it.unit_price),
        subtotal: Number((Number(it.unit_price) * it.quantity).toFixed(2)),
        product: it.Product,
      })),
    }));

    return { orders: formatted, total: formatted.length };
  }
}

module.exports = new OrderService();
