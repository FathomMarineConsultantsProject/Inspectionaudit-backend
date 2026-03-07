const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 1. CREATE (Form fill hone par)
exports.createQuotation = async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate, clientEmail, clientName } = req.body;

    const quotation = await Quotation.create({
      enquiryRef: `FM-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate ref
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

// 2. SUBMIT (Confirmation Email after "YES" in UI Modal)
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

    // --- FATHOM MARINE STYLE EMAIL LOGIC (EXACTLY LIKE IMAGE) ---
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Thank you for confirming availability for enquiry ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6;">
          <p>Dear ${updatedQuotation.clientName},</p>
          
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          
          <p>The enquiry details are as follows for your reference:</p>
          
          <div style="margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-left: 4px solid #5ac8d8;">
            <p style="margin: 5px 0;"><strong>Fathom Marine ref:</strong> ${updatedQuotation.enquiryRef}</p>
            <p style="margin: 5px 0;"><strong>Vessel type:</strong> ${updatedQuotation.shipType || "Bulk Carrier"}</p>
            <p style="margin: 5px 0;"><strong>Inspection type:</strong> ${updatedQuotation.serviceType || "Pre-purchase Inspection"}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${updatedQuotation.portCountry || "Baltimore, United States"}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${updatedQuotation.inspectionDate || "09/03/2026 - 14/03/2026"}</p>
            <p style="margin: 5px 0;"><strong>Agreed Fee:</strong> $${amount}</p>
          </div>

          <p>
            We will update once we hear further from the client. In case you require any assistance 
            please contact operations by reply to this email or call 
            <span style="color: #007bff; text-decoration: none;">+44 2920 446 644 (Global Ops)</span>.
          </p>
          
          <br>
          <p style="margin-top: 20px; font-weight: bold; color: #1a1a1a;">
            Regards,<br>
            Operations Team<br>
            Fathom Marine Inspection System
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ 
      success: true, 
      message: "Quotation updated and Fathom Marine confirmation email sent!", 
      data: updatedQuotation 
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. GET ALL
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    res.json({ success: true, data: quotations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};