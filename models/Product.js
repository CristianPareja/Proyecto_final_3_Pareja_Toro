// models/Product.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Product = sequelize.define(
  "Product",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },

    seller_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "products",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Product;
