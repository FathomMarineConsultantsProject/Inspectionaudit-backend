const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

// SMTP Transporter - Vercel ke liye Port 465 (SSL) sabse best hai
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
});

// Transporter Check (Verify connection on start)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email Config Error:", error);
  } else {
    console.log("✅ Email Server is ready to send messages");
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

    res.json({ success: true, message: "Enquiry Created", data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/* =========================
   2. SUBMIT (Confirmed Availability)
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // Latest Pending Record dhoondhein
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, 
      { amount, description, status: "Quoted" },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "No pending enquiry found." });
    }

    // --- EMAIL TEMPLATE (Exact Image Style) ---
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Thank you for confirming availability for enquiry ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 25px;">
          <h2 style="color: #2d3454; margin-bottom: 20px;">FATHOM MARINE</h2>
          
          <p>Dear ${updatedQuotation.clientName},</p>
          
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          
          <p>The enquiry details are as follows for your reference:</p>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #f4f7f8; border-left: 5px solid #5ac8d8; border-radius: 4px;">
            <p style="margin: 8px 0;"><strong>Fathom Marine ref:</strong> ${updatedQuotation.enquiryRef}</p>
            <p style="margin: 8px 0;"><strong>Vessel type:</strong> ${updatedQuotation.shipType || "Bulk Carrier"}</p>
            <p style="margin: 8px 0;"><strong>Inspection type:</strong> ${updatedQuotation.serviceType || "Pre-purchase Inspection"}</p>
            <p style="margin: 8px 0;"><strong>Location:</strong> ${updatedQuotation.portCountry || "Baltimore, United States"}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${updatedQuotation.inspectionDate || "09/03/2026"}</p>
            <p style="margin: 15px 0 0 0; font-size: 1.1em; color: #2d3454;"><strong>Agreed Fee: $${amount}</strong></p>
          </div>

          <p>
            We will update once we hear further from the client. In case you require any assistance 
            please contact operations by reply to this email or call <strong>+44 2920 446 644</strong>.
          </p>
          
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.9em; color: #666;">
            Regards,<br>
            <strong>Operations Team</strong><br>
            Fathom Marine Inspection System
          </p>
        </div>
      `
    };

    // Email bhejte waqt handle karein
    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "Quotation submitted and confirmation email sent!", 
      data: updatedQuotation 
    });

  } catch (error) {
    console.error("Submit Error:", error);
    res.status(500).json({ success: false, error: error.message });
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