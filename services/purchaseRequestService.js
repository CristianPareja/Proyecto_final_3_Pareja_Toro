const { sequelize, Product, User, PurchaseRequest } = require("../models");
const purchaseRepo = require("../repositories/purchaseRequestRepositoryORM");

class PurchaseRequestService {
  // Buyer crea solicitud (no baja stock)
  async requestPurchase({ productId, buyerId, quantity }) {
    const product = await Product.findByPk(productId);
    if (!product) throw { status: 404, message: "Producto no encontrado" };
    if (quantity <= 0) throw { status: 400, message: "Cantidad inválida" };

    // no descontamos stock aquí, solo validamos que exista algo
    if (product.quantity <= 0) throw { status: 400, message: "Producto sin stock" };

    // seller_id debe existir
    const sellerId = product.seller_id;
    const seller = await User.findByPk(sellerId);
    if (!seller) throw { status: 400, message: "Vendedor inválido" };

    // crea request
    return await purchaseRepo.create({
      product_id: product.id,
      buyer_id: buyerId,
      seller_id: sellerId,
      quantity,
      status: "PENDING",
    });
  }

  async listSellerPending(sellerId) {
    return await purchaseRepo.findSellerPending(sellerId);
  }

  async listBuyerAll(buyerId) {
    return await purchaseRepo.findBuyerAll(buyerId);
  }

  // Seller acepta: baja stock + marca accepted (todo en transacción)
  async acceptRequest({ requestId, sellerId }) {
    return await sequelize.transaction(async (t) => {
      const req = await PurchaseRequest.findByPk(requestId, { transaction: t, lock: true });
      if (!req) throw { status: 404, message: "Solicitud no encontrada" };
      if (req.seller_id !== sellerId) throw { status: 403, message: "No autorizado" };
      if (req.status !== "PENDING") throw { status: 400, message: "Solicitud ya procesada" };

      const product = await Product.findByPk(req.product_id, { transaction: t, lock: true });
      if (!product) throw { status: 404, message: "Producto no encontrado" };

      if (product.quantity < req.quantity) {
        throw { status: 400, message: "Stock insuficiente para aceptar" };
      }

      // descuenta stock
      product.quantity = product.quantity - req.quantity;
      await product.save({ transaction: t });

      // marca aceptada
      req.status = "ACCEPTED";
      req.responded_at = new Date();
      await req.save({ transaction: t });

      return req;
    });
  }

  // Seller rechaza: no cambia stock
  async rejectRequest({ requestId, sellerId }) {
    const req = await PurchaseRequest.findByPk(requestId);
    if (!req) throw { status: 404, message: "Solicitud no encontrada" };
    if (req.seller_id !== sellerId) throw { status: 403, message: "No autorizado" };
    if (req.status !== "PENDING") throw { status: 400, message: "Solicitud ya procesada" };

    req.status = "REJECTED";
    req.responded_at = new Date();
    await req.save();
    return req;
  }

  // Buyer ve info bancaria SOLO si está ACCEPTED
  // (Aquí asumo que luego vas a manejar banca en otra tabla o de otra forma.
  // Por ahora solo devolvemos "allowed: true" como bandera)
  async buyerCanSeeBankInfo({ requestId, buyerId }) {
    const req = await PurchaseRequest.findByPk(requestId);
    if (!req) throw { status: 404, message: "Solicitud no encontrada" };
    if (req.buyer_id !== buyerId) throw { status: 403, message: "No autorizado" };

    return { status: req.status, allowed: req.status === "ACCEPTED" };
  }
}

module.exports = new PurchaseRequestService();
