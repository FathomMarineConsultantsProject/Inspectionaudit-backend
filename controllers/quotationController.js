const Quotation = require("../models/Quotation");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendSurveyorEmails = require("../utils/sendSurveyorEmails");
/* =========================
   EMAIL TRANSPORTER
========================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   1️⃣ CREATE ENQUIRY
========================= */

exports.createQuotation = async (req, res) => {
  try {

    const {
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      clientEmail,
    } = req.body;

    /* CREATE UNIQUE TOKEN */

    const token = crypto.randomBytes(20).toString("hex");

    /* SAVE ENQUIRY */

    const quotation = await Quotation.create({
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      clientEmail,
      token,
      status: "Pending",
    });

    /* SURVEYOR SUBMIT LINK */

    const submitLink =
      `https://inspectionaudit-frontend-dashboard.vercel.app/submit-quotation/${token}`;

    /* SEND EMAIL */

    try {

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: clientEmail,
        subject: "🚢 New Inspection Enquiry",
        html: `
          <div style="font-family:Arial, sans-serif; padding:20px;">
          
            <h2 style="color:#2c5cc5; text-align:center;">
              🚢 New Inspection Enquiry
            </h2>

            <p>Please find the inspection details below:</p>

            <table width="100%" border="1" cellpadding="10" cellspacing="0"
            style="border-collapse:collapse;">
            
              <tr style="background:#2c5cc5; color:white;">
                <th align="left">Field</th>
                <th align="left">Details</th>
              </tr>

              <tr>
                <td><strong>Ship Type</strong></td>
                <td>${shipType || "-"}</td>
              </tr>

              <tr>
                <td><strong>Service Type</strong></td>
                <td>${serviceType || "-"}</td>
              </tr>

              <tr>
                <td><strong>Port & Country</strong></td>
                <td>${portCountry || "-"}</td>
              </tr>

              <tr>
                <td><strong>Inspection Date</strong></td>
                <td>${inspectionDate || "-"}</td>
              </tr>

            </table>

            <div style="text-align:center; margin-top:30px;">
              <a href="${submitLink}"
                 style="
                 background:#2c5cc5;
                 color:white;
                 padding:12px 25px;
                 text-decoration:none;
                 border-radius:6px;
                 font-weight:bold;">
                 Submit Quotation
              </a>
            </div>

            <p style="margin-top:30px;">
              Regards,<br/>
              <strong>Fathom Marine</strong>
            </p>

          </div>
        `,
      });

    } catch (emailError) {

      console.log("Email Error:", emailError);

    }

    res.json({
      success: true,
      message: "Enquiry created & email sent",
      data: quotation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }
};

/* =========================
   2️⃣ SUBMIT QUOTATION
========================= */

exports.submitQuotation = async (req, res) => {

  try {

    const { token, amount, description } = req.body;

    const updatedQuotation = await Quotation.findOneAndUpdate(
      { token: token },
      {
        amount,
        description,
        status: "Quoted",
      },
      { new: true }
    );

    if (!updatedQuotation) {

      return res.status(404).json({
        success: false,
        message: "Invalid quotation link",
      });

    }

    res.json({
      success: true,
      message: "Quotation submitted successfully",
      data: updatedQuotation,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

};

/* =========================
   3️⃣ GET ALL QUOTATIONS
========================= */

exports.getAllQuotations = async (req, res) => {

  try {

    const quotations = await Quotation
      .find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: quotations,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

};

/* =========================
   4️⃣ DELETE QUOTATION
========================= */

exports.deleteQuotation = async (req, res) => {

  try {

    const { id } = req.params;

    await Quotation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message,
    });

  }

};