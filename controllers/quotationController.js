const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

// Nodemailer setup
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  connectionTimeout: 10000, // 10 seconds timeout for Vercel
});

/* =========================
   SUBMIT QUOTATION LOGIC
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // 1. Find the latest "Pending" enquiry for this specific email
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, 
      { 
        amount: Number(amount), 
        description: description, 
        status: "Quoted" 
      },
      { new: true, sort: { createdAt: -1 } } // Get the most recent one
    );

    if (!updatedQuotation) {
      return res.status(404).json({ 
        success: false, 
        message: "No pending enquiry found for this email. Check if it's already quoted." 
      });
    }

    // 2. Email Template
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Quotation for Enquiry Ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial; border: 1px solid #eee; padding: 25px; max-width: 600px;">
          <h2 style="color: #2d3454;">FATHOM MARINE</h2>
          <hr/>
          <p>Dear ${updatedQuotation.clientName || "Client"},</p>
          <p>We are pleased to provide the quotation for your recent enquiry:</p>
          
          <div style="background: #f4f7f8; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p><strong>Ref:</strong> ${updatedQuotation.enquiryRef}</p>
            <p><strong>Vessel:</strong> ${updatedQuotation.shipType}</p>
            <p><strong>Location:</strong> ${updatedQuotation.portCountry}</p>
            <p style="font-size: 1.2em; color: #2d3454;"><strong>Total Fee: $${amount}</strong></p>
          </div>

          <p><strong>Description/Remarks:</strong><br/>${description}</p>
          
          <p>Please contact us at <strong>+44 2920 446 644</strong> to proceed with this booking.</p>
          <br/>
          <p>Regards,<br/><strong>Operations Team</strong></p>
        </div>
      `
    };

    // 3. Send Email (Async but not blocking the response)
    transporter.sendMail(mailOptions).catch(err => console.error("❌ Email failed:", err.message));

    return res.status(200).json({ 
      success: true, 
      message: "Quotation updated and email triggered!", 
      data: updatedQuotation 
    });

  } catch (error) {
    console.error("❌ Submit Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error occurred." });
  }
};