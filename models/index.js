// models/index.js
const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");
const PurchaseRequest = require("./PurchaseRequest");

// Seller (User) -> Products
User.hasMany(Product, { foreignKey: "seller_id" });
Product.belongsTo(User, { foreignKey: "seller_id", as: "seller" });

// Buyer (User) -> Orders
User.hasMany(Order, { foreignKey: "buyer_id" });
Order.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });

// Order -> Items
Order.hasMany(OrderItem, { foreignKey: "order_id" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// Product -> Items
Product.hasMany(OrderItem, { foreignKey: "product_id" });
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

// ✅ Purchase Requests
User.hasMany(PurchaseRequest, { foreignKey: "seller_id", as: "sales_requests" });
User.hasMany(PurchaseRequest, { foreignKey: "buyer_id", as: "buy_requests" });

PurchaseRequest.belongsTo(User, { foreignKey: "seller_id", as: "seller" });
PurchaseRequest.belongsTo(User, { foreignKey: "buyer_id", as: "buyer" });

Product.hasMany(PurchaseRequest, { foreignKey: "product_id" });
PurchaseRequest.belongsTo(Product, { foreignKey: "product_id", as: "product" });

module.exports = { User, Product, Order, OrderItem, PurchaseRequest };
