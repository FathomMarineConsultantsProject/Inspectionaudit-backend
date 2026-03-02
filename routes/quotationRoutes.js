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
router.post("/", createQuotation);

/* =========================
   SUBMIT QUOTATION (Team)
========================= */
router.put("/submit/:id", submitQuotation);

/* =========================
   DASHBOARD GET ALL
========================= */
router.get("/", getAllQuotations);

module.exports = router;