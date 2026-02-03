// models/PurchaseRequest.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const PurchaseRequest = sequelize.define(
  "PurchaseRequest",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },

    status: {
      type: DataTypes.STRING(12),
      allowNull: false,
      defaultValue: "PENDING",
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    responded_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "purchase_requests",
    timestamps: false,
    freezeTableName: true,
  }
);

module.exports = PurchaseRequest;
