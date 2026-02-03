const express = require("express");
const router = express.Router();
const service = require("../services/purchaseRequestService");

// Buyer crea solicitud
router.post("/", async (req, res) => {
  const { productId, buyerId, quantity } = req.body;
  const created = await service.requestPurchase({ productId, buyerId, quantity });
  res.status(201).json(created);
});

// Seller lista pendientes
router.get("/seller/:sellerId/pending", async (req, res) => {
  const sellerId = parseInt(req.params.sellerId);
  const list = await service.listSellerPending(sellerId);
  res.json({ requests: list, total: list.length });
});

// Buyer lista sus solicitudes
router.get("/buyer/:buyerId", async (req, res) => {
  const buyerId = parseInt(req.params.buyerId);
  const list = await service.listBuyerAll(buyerId);
  res.json({ requests: list, total: list.length });
});

// Seller acepta
router.post("/:id/accept", async (req, res) => {
  const requestId = parseInt(req.params.id);
  const { sellerId } = req.body;
  const updated = await service.acceptRequest({ requestId, sellerId });
  res.json(updated);
});

// Seller rechaza
router.post("/:id/reject", async (req, res) => {
  const requestId = parseInt(req.params.id);
  const { sellerId } = req.body;
  const updated = await service.rejectRequest({ requestId, sellerId });
  res.json(updated);
});

// Buyer consulta si ya puede ver info bancaria
router.get("/:id/buyer/:buyerId/can-see-bank", async (req, res) => {
  const requestId = parseInt(req.params.id);
  const buyerId = parseInt(req.params.buyerId);
  const result = await service.buyerCanSeeBankInfo({ requestId, buyerId });
  res.json(result);
});

module.exports = router;
