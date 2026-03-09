const express = require("express");
const router = express.Router();

const {
  createQuotation,
  submitQuotation,
  getAllQuotations,
  deleteQuotation,
} = require("../controllers/quotationController");

/* =========================
   1. CREATE QUOTATION (Client Form)
========================= */
router.post("/", createQuotation);

/* =========================
   2. SUBMIT QUOTATION (Surveyor/Team)
========================= */
router.post("/submit", submitQuotation);

/* =========================
   3. GET ALL QUOTATIONS (Dashboard)
========================= */
router.get("/", getAllQuotations);

/* =========================
   4. DELETE QUOTATION (Admin)
========================= */
router.delete("/:id", deleteQuotation);

module.exports = router;