// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();

const PORT = process.env.PORT || 4000;

// Sequelize
const sequelize = require("./database");

// ✅ IMPORTANTE: cargar modelos y asociaciones
require("./models");

// Rutas
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const purchaseRequestRoutes = require("./routes/purchaseRequestRoutes");

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

// Rutas
app.get("/", (req, res) => res.send("EcoCanje API funcionando "));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);

// Middleware errores
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error", status });
});

// ✅ Arranque + Sync
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL OK");

    // ✅ Esto crea tablas si no existen
    await sequelize.sync({ alter: true });
    console.log("Tablas creadas / sincronizadas");

    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (error) {
    console.error("Error al iniciar:", error);
  }
})();
