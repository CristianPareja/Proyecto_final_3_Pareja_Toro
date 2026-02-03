// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const productRoutes = require("./routes/productRoutes");
const purchaseRequestRoutes = require("./routes/purchaseRequestRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ ok: true, message: "EcoCanje API running" });
});

app.use("/api/products", productRoutes);
app.use("/api/purchase-requests", purchaseRequestRoutes);

app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err);
  res.status(err?.status || 500).json({ message: err?.message || "Internal server error" });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a PostgreSQL OK");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
})();
