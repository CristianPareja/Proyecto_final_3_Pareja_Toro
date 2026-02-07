// models/PurchaseRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PurchaseRequest = sequelize.define(
  "PurchaseRequest",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    product_id: { type: DataTypes.INTEGER, allowNull: false },
    seller_id: { type: DataTypes.INTEGER, allowNull: false },
    buyer_id: { type: DataTypes.INTEGER, allowNull: false },

    quantity: { type: DataTypes.INTEGER, allowNull: false },

    status: {
      type: DataTypes.ENUM("PENDING", "ACCEPTED", "REJECTED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "purchase_requests",
    timestamps: false,
  }
);

module.exports = PurchaseRequest;
