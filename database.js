// database.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD; // <- debe ser string
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT || "5432", 10);

if (!DB_PASSWORD || typeof DB_PASSWORD !== "string") {
  console.error("❌ DB_PASSWORD no está definida o no es string. Revisa tu .env");
  console.error("DB_PASSWORD =", DB_PASSWORD);
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
});

module.exports = sequelize;
