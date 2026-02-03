const { PurchaseRequest, Product, User } = require("../models");
const { Op } = require("sequelize");

class PurchaseRequestRepositoryORM {
  async create(data) {
    return await PurchaseRequest.create(data);
  }

  async findSellerPending(sellerId) {
    return await PurchaseRequest.findAll({
      where: { seller_id: sellerId, status: "PENDING" },
      order: [["created_at", "DESC"]],
      include: [
        { model: Product, as: "product" },
        { model: User, as: "buyer", attributes: ["id", "username", "phone"] },
      ],
    });
  }

  async findBuyerAll(buyerId) {
    return await PurchaseRequest.findAll({
      where: { buyer_id: buyerId },
      order: [["created_at", "DESC"]],
      include: [
        { model: Product, as: "product" },
        { model: User, as: "seller", attributes: ["id", "username", "phone"] },
      ],
    });
  }

  async findById(id) {
    return await PurchaseRequest.findByPk(id);
  }
}

module.exports = new PurchaseRequestRepositoryORM();
