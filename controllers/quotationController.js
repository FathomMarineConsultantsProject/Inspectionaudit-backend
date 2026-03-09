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
   1. CREATE QUOTATION (Client fills form)
========================= */
exports.createQuotation = async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate, clientEmail } = req.body;

    const quotation = await Quotation.create({
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      clientEmail,
      status: "Pending",
    });

    // Link for the team to fill the amount (Passing email in URL for auto-linking)
    const submitLink = `https://inspectionaudit-frontend-dashboard.vercel.app/submit-quotation?email=${clientEmail}`;

    // Send Email to the Admin/Team
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Usually sent to admin or "clientEmail" if intended for client
        subject: "🚢 New Inspection Enquiry Received",
        html: `
          <div style="font-family:Arial, sans-serif; padding:20px; border: 1px solid #eee;">
            <h2 style="color:#2c5cc5; text-align:center;">🚢 New Inspection Enquiry</h2>
            <p>A new request has been submitted by: <strong>${clientEmail}</strong></p>
            <table width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse; margin-bottom:20px;">
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
                Fill Amount & Finalize Quote
              </a>
            </div>
            <p style="margin-top:30px; font-size:12px; color:#777;">Regards,<br/><strong>Fathom Marine System</strong></p>
          </div>
        `
      });
    } catch (emailError) {
      console.log("Email Error:", emailError);
    }

    res.status(201).json({ success: true, message: "Quotation Created & Email Sent", data: quotation });
  } catch (error) {
    console.log("Create Quotation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   2. SUBMIT QUOTATION (Team fills amount & description)
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // Email use karke existing record ko update karein (Duplicate entry avoid karne ke liye)
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, // Search criteria
      { 
        amount: amount, 
        description: description, 
        status: "Quoted" 
      },
      { new: true } // Return the updated document
    );

    if (!updatedQuotation) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending enquiry found for this email. It might already be quoted or doesn't exist." 
      });
    }

    res.json({ success: true, message: "Quotation submitted and linked successfully!", data: updatedQuotation });
  } catch (error) {
    console.log("Submit Quotation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   3. GET ALL QUOTATIONS (Admin Dashboard)
========================= */
exports.getAllQuotations = async (req, res) => {
  try {
    // Newest entries first
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) {
    console.log("Get All Quotations Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   4. DELETE QUOTATION (Admin Action)
========================= */
exports.deleteQuotation = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedQuotation = await Quotation.findByIdAndDelete(id);

    if (!deletedQuotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.json({ success: true, message: "Quotation deleted successfully" });
  } catch (error) {
    console.log("Delete Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};