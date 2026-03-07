const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

// SMTP Transporter - Vercel aur Gmail ke liye robust configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  pool: true, // Connection pooling for better performance on Vercel
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  tls: {
    rejectUnauthorized: false // Helps with connection blocks
  }
});

/* =========================
   1. CREATE (Form Submission)
========================= */
exports.createQuotation = async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate, clientEmail, clientName } = req.body;

    const quotation = await Quotation.create({
      enquiryRef: `FM-${Math.floor(1000 + Math.random() * 9000)}`,
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      clientEmail,
      clientName: clientName || "Valued Client",
      status: "Pending",
    });

    res.status(201).json({ success: true, message: "Enquiry Created", data: quotation });
  } catch (error) {
    console.error("❌ Create Error:", error.message);
    res.status(500).json({ success: false, error: "Failed to create enquiry" });
  }
};

/* =========================
   2. SUBMIT (Confirmed Availability & Email)
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // 1. Database Update (Pehle DB update karein)
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, 
      { amount, description, status: "Quoted" },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "No pending enquiry found for this email." });
    }

    // 2. Prepare Email Template
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Thank you for confirming availability for enquiry ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 25px;">
          <h2 style="color: #2d3454; margin-bottom: 20px; font-size: 24px;">FATHOM MARINE</h2>
          
          <p>Dear ${updatedQuotation.clientName},</p>
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f4f7f8; border-left: 5px solid #5ac8d8; border-radius: 4px;">
            <p style="margin: 8px 0;"><strong>Fathom Marine ref:</strong> ${updatedQuotation.enquiryRef}</p>
            <p style="margin: 8px 0;"><strong>Vessel type:</strong> ${updatedQuotation.shipType || "N/A"}</p>
            <p style="margin: 8px 0;"><strong>Inspection type:</strong> ${updatedQuotation.serviceType || "N/A"}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${updatedQuotation.portCountry || "N/A"}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${updatedQuotation.inspectionDate || "N/A"}</p>
            <p style="margin: 15px 0 0 0; font-size: 1.2em; color: #2d3454;"><strong>Agreed Fee: $${amount}</strong></p>
          </div>

          <p>We will update once we hear further from the client. For assistance, contact operations or call <strong>+44 2920 446 644</strong>.</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.9em; color: #666;">
            Regards,<br>
            <strong>Operations Team</strong><br>
            Fathom Marine Inspection System
          </p>
        </div>
      `
    };

    // 3. Email Send (Try-Catch block for email to prevent 500 error)
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully to:", clientEmail);
    } catch (mailError) {
      console.error("❌ Mail Delivery Failed:", mailError.message);
      // Note: We don't return 500 here because DB is already updated.
    }

    // 4. Send Response
    return res.json({ 
      success: true, 
      message: "Availability confirmed and portal updated!", 
      data: updatedQuotation 
    });

  } catch (error) {
    console.error("❌ Submit Error:", error.message);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/* =========================
   3. GET ALL
========================= */
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};