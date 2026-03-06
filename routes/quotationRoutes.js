const express = require("express");
const router = express.Router();

const {
  createQuotation,
  submitQuotation,
  getAllQuotations,
} = require("../controllers/quotationController");

/* =========================
   CREATE (Client Form)
========================= */
router.post("/create", createQuotation);

/* =========================
   SUBMIT QUOTATION (Team)
========================= */
router.post("/submit", submitQuotation);

/* =========================
   DASHBOARD GET ALL
========================= */
router.get("/all", getAllQuotations);

module.exports = router;