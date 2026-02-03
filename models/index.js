// models/index.js
const sequelize = require("../database");

// ⚠️ Ajusta nombres si tus archivos se llaman diferente
const User = require("./User");
const Product = require("./Product"); // si en tu proyecto es "./Products", cambia aquí
const PurchaseRequest = require("./PurchaseRequest");

// ============================
// Asociaciones
// ============================

// Producto -> vendedor
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
User.hasMany(Product, { foreignKey: "seller_id", as: "products" });

// Solicitudes de compra
PurchaseRequest.belongsTo(Product, { foreignKey: "product_id", as: "product" });
PurchaseRequest.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });
PurchaseRequest.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

module.exports = {
  sequelize,
  User,
  Product,
  PurchaseRequest,
};
