// models/User.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const User = sequelize.define(
  "User",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },

    // ✅ info para que el comprador contacte y pague por transferencia
    full_name: { type: DataTypes.STRING(120), allowNull: true },
    phone: { type: DataTypes.STRING(20), allowNull: true },

    bank_name: { type: DataTypes.STRING(80), allowNull: true },
    account_type: { type: DataTypes.STRING(30), allowNull: true }, // "Ahorros" / "Corriente"
    account_number: { type: DataTypes.STRING(30), allowNull: true },
  },
  {
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = User;
