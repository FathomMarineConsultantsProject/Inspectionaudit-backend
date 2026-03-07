const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// CREATE (Form fill hone par)
exports.createQuotation = async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate, clientEmail, clientName } = req.body;

    const quotation = await Quotation.create({
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      clientEmail,
      clientName: clientName || "Nipun Chatrath",
      status: "Pending",
    });

    res.json({ success: true, message: "Enquiry Created", data: quotation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// SUBMIT (Jab team fee confirm karegi - IDWAL Style Email)
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, 
      { amount, description, status: "Quoted" },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "No pending enquiry found." });
    }

    // --- IDWAL STYLE EMAIL LOGIC ---
    const mailOptions = {
      from: `"Idwal Marine" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Thank you for confirming availability for enquiry ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
          <p>Dear ${updatedQuotation.clientName},</p>
          
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          
          <p>The enquiry details are as follows for your reference:</p>
          
          <div style="margin: 20px 0; line-height: 1.8;">
            <strong>Idwal ref:</strong> ${updatedQuotation.enquiryRef}<br>
            <strong>Vessel type:</strong> ${updatedQuotation.shipType || "Bulk Carrier"}<br>
            <strong>Inspection type:</strong> ${updatedQuotation.serviceType || "Pre-purchase Inspection"}<br>
            <strong>Location:</strong> ${updatedQuotation.portCountry || "New Haven; Conn, United States"}<br>
            <strong>Date:</strong> ${updatedQuotation.inspectionDate || "09/03/2026 - 14/03/2026"}
          </div>

          <p>
            We will update once we hear further from the client. In case you require any assistance 
            please contact operations by reply to this email or call 
            <span style="color: #007bff;">+44 2920 446 644 (UK)</span> and 
            <span style="color: #007bff;">+86 21 62195047 (China)</span>.
          </p>
          
          <p style="margin-top: 30px; font-size: 0.9em; color: #777;">
            Sent via IDWAL Marine Inspection System
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.log("Mail delivery failed:", err);
    }

    res.json({ 
      success: true, 
      message: "Quotation updated and IDWAL confirmation email sent!", 
      data: updatedQuotation 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET ALL
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};