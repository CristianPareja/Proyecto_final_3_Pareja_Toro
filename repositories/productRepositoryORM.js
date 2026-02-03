// repositories/productRepositoryORM.js
const { Product, User } = require("../models");
const { Op } = require("sequelize");

class ProductRepositoryORM {
  async findAllInStock() {
    return await Product.findAll({
      where: { quantity: { [Op.gt]: 0 } },
      order: [["id", "DESC"]],
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "phone"],
        },
      ],
    });
  }

  async findById(id) {
    return await Product.findByPk(id, {
      include: [
        {
          model: User,
          as: "seller",
          attributes: ["id", "username", "phone"],
        },
      ],
    });
  }

  async create(data) {
    return await Product.create(data);
  }

  async update(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.update(data);
    return product;
  }

  async delete(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    await product.destroy();
    return product;
  }
}

module.exports = new ProductRepositoryORM();

