const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

/* =========================
   EMAIL TRANSPORTER CONFIG
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   CREATE QUOTATION (Client fills form)
========================= */
exports.createQuotation = async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate, clientEmail } = req.body;

    const quotation = await Quotation.create({
      shipType,
      serviceType,
      portCountry,
      clientEmail,
      status: "Pending",
    });

    const submitLink = "https://inspectionaudit-frontend-dashboard.vercel.app/submit-quotation";

    // Send Email (wrap in try/catch so failure won't break API)
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: "🚢 New Inspection Enquiry",
        html: `
          <div style="font-family:Arial, sans-serif; padding:20px;">
            <h2 style="color:#2c5cc5; text-align:center;">🚢 New Inspection Enquiry</h2>
            <p>Hello Team,</p>
            <p>Please find the inspection request details below:</p>
            <table width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
              <tr style="background:#2c5cc5; color:white;">
                <th align="left">Field</th>
                <th align="left">Details</th>
              </tr>
              <tr><td><strong>Ship Type</strong></td><td>${shipType || "-"}</td></tr>
              <tr><td><strong>Service Type</strong></td><td>${serviceType || "-"}</td></tr>
              <tr><td><strong>Port & Country</strong></td><td>${portCountry || "-"}</td></tr>
              <tr><td><strong>Inspection Date</strong></td><td>${inspectionDate || "-"}</td></tr>
            </table>
            <div style="text-align:center; margin-top:30px;">
              <a href="${submitLink}" style="background-color:#2c5cc5; color:white; padding:12px 25px; text-decoration:none; border-radius:6px; display:inline-block; font-weight:bold;">
                Submit Quotation
              </a>
            </div>
            <p style="margin-top:30px;">Regards,<br/><strong>Fathom Marine</strong></p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("Email Error:", emailError);
    }

    res.json({ success: true, message: "Quotation Created & Email Sent", data: quotation });
  } catch (error) {
    console.log("Create Quotation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   SUBMIT QUOTATION (Team fills amount & description)
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const quotation = await Quotation.create({
      amount,
      description,
      status: "Quoted",
    });

    res.json({ success: true, message: "Quotation submitted successfully", data: quotation });
  } catch (error) {
    console.log("Submit Quotation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   GET ALL QUOTATIONS (Dashboard)
========================= */
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) {
    console.log("Get All Quotations Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};