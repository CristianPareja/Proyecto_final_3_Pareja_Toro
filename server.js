// server.js
require("dotenv").config();

const express = require("express");
const app = express();
const PORT = 4000;

// 👉 conexión Sequelize
const sequelize = require("./database");

// 👉 cargar modelos y asociaciones
require("./models");

// 👉 rutas
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");

// middleware
app.use(express.json());

// rutas
app.get("/", (req, res) => {
  res.send("EcoCanje API funcionando 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// ✅ middleware de errores (SIEMPRE al final, después de las rutas)
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || "Internal server error",
    status,
  });
});

// ✅ sincronizar BD y levantar servidor
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a la base de datos exitosa");

    await sequelize.sync({ alter: true });
    console.log("✅ Tablas creadas / sincronizadas correctamente");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor levantado en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
  }
})();
