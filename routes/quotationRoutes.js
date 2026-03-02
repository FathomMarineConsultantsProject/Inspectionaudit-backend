const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const Inspection = require("../models/Inspection");
const Quotation = require("../models/Quotation");

/* =========================
   EMAIL CONFIG
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   SEND QUOTATION EMAIL
========================= */
router.post("/send-quotation", async (req, res) => {
  try {
    const { inspectionId, emailSentTo } = req.body;

    if (!inspectionId || !emailSentTo) {
      return res.status(400).json({ message: "Missing data" });
    }

    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    const quotationId = uuidv4();

    inspection.quotationId = quotationId;
    inspection.quotationStatus = "Pending";
    inspection.emailSentTo = emailSentTo;
    await inspection.save();

    const submitLink = `https://www.shipinspectors.com/submit-quotation/${quotationId}`;

    const html = `
      <h3>Hello Team,</h3>
      <table border="1" cellpadding="10" style="border-collapse:collapse;width:100%">
        <tr><td>Ship</td><td>${inspection.shipName}</td></tr>
        <tr><td>Inspection</td><td>${inspection.inspectionType}</td></tr>
        <tr><td>Port</td><td>${inspection.portName}</td></tr>
        <tr><td>Date</td><td>${inspection.inspectionDate.toDateString()}</td></tr>
      </table>
      <br/>
      <a href="${submitLink}" style="padding:10px 20px;background:#0d6efd;color:white;text-decoration:none">
        Submit Quotation
      </a>
    `;

    await transporter.sendMail({
      from: `"Fathom Marine" <${process.env.EMAIL_USER}>`,
      to: emailSentTo,
      subject: "Inspection Quotation Request",
      html,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   SUBMIT QUOTATION (MATCHES FRONTEND)
========================= */
router.post("/submit-quotation/:quotationId", async (req, res) => {
  try {
    const { quotationId } = req.params;
    const { amount, description } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    const inspection = await Inspection.findOne({ quotationId });
    if (!inspection) {
      return res.status(404).json({ message: "Inspection not found" });
    }

    await Quotation.create({
      quotationId,
      inspectionId: inspection._id,

      // 👇 admin table fields
      name: inspection.shipName,
      email: inspection.emailSentTo,
      shipType: inspection.shipName,
      serviceType: inspection.inspectionType,
      portCountry: inspection.portName,
      inspectionDate: inspection.inspectionDate,
      status: "Submitted",

      amount,
      description,
    });

    inspection.quotationStatus = "Submitted";
    await inspection.save();

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================
   ADMIN: GET ALL QUOTATIONS
========================= */
router.get("/quotations", async (req, res) => {
  const quotations = await Quotation.find().sort({ createdAt: -1 });
  res.json(quotations);
});

module.exports = router;