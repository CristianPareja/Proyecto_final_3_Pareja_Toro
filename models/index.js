const User = require("./User");
const Product = require("./Product");
const Order = require("./Order");
const OrderItem = require("./OrderItem");

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

module.exports = { User, Product, Order, OrderItem };
