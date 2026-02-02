// server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

// 👉 conexión Sequelize
const sequelize = require("./database");

// 👉 cargar modelos y asociaciones
require("./models");

// 👉 rutas
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

// =====================
// MIDDLEWARES
// =====================

// 🔓 CORS (permite conexión desde el frontend)
app.use(
  cors({
    origin: "http://localhost:5173", // Vite
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📦 JSON body
app.use(express.json());

// =====================
// RUTAS
// =====================

// ruta base de prueba
app.get("/", (req, res) => {
  res.send("EcoCanje API funcionando 🚀");
});

// auth & productos
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// =====================
// MANEJO DE ERRORES (SIEMPRE AL FINAL)
// =====================
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    status,
  });
});

// =====================
// INICIAR SERVIDOR + DB
// =====================
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos exitosa");

    await sequelize.sync({ alter: true });
    console.log("✅ Tablas sincronizadas");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
})();
