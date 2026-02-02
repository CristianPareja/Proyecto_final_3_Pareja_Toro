const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Order = sequelize.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  buyer_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "PENDING" },
  total: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0 },
}, {
  tableName: "orders",
  timestamps: true,
  createdAt: "created_at",
  updatedAt: false
});

module.exports = Order;
