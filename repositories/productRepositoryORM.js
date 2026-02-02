// repositories/productRepositoryORM.js
const { Op } = require("sequelize");
const Product = require("../models/Product");

class ProductRepositoryORM {
  async findAll() {
    return await Product.findAll({ order: [["id", "ASC"]] });
  }

  async findById(id) {
    return await Product.findByPk(id);
  }

  async findByQuantityRange(min, max) {
    return await Product.findAll({
      where: {
        quantity: { [Op.between]: [min, max] },
      },
      order: [["id", "ASC"]],
    });
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, updatedProduct) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(updatedProduct);
    return product;
  }

  async delete(id) {
    const product = await Product.findByPk(id);
    if (!product) return null;

    const deleted = product.toJSON();
    await product.destroy();
    return deleted;
  }
}


module.exports = new ProductRepositoryORM();

