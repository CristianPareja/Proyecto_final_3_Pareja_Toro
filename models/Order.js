// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const Order = sequelize.define(
  "Order",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    buyer_id: { type: DataTypes.INTEGER, allowNull: false },

    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },

    // ✅ NUEVO: contraentrega didáctica
    payment_method: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "CASH_ON_DELIVERY",
    },

    // ✅ NUEVO: estado simple para historial
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "PENDING",
    },

    // ✅ NUEVO: contacto que el comprador decide compartir
    contact_phone: { type: DataTypes.STRING(20), allowNull: true },
    contact_email: { type: DataTypes.STRING(120), allowNull: true },
  },
  {
    tableName: "orders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Order;
