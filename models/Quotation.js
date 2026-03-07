const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

// 1. App Password setup (Important!)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL use karein
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Yahan 16-digit App Password hi hona chahiye
  },
  tls: {
    rejectUnauthorized: false // Vercel environment ke liye extra safety
  }
});

// SUBMIT QUOTATION & SEND EMAIL
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // Record dhoondhein aur update karein
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" },
      { amount, description, status: "Quoted" },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "No pending enquiry found." });
    }

    // --- FATHOM MARINE EMAIL DESIGN ---
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Thank you for confirming availability for enquiry ref: ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; color: #333; border: 1px solid #ddd; padding: 20px;">
          <h2 style="color: #2d3454; border-bottom: 2px solid #5ac8d8; padding-bottom: 10px;">FATHOM MARINE</h2>
          <p>Dear ${updatedQuotation.clientName},</p>
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          
          <div style="background: #f4f7f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Vessel:</strong> ${updatedQuotation.shipType || "Bulk Carrier"}</p>
            <p style="margin: 5px 0;"><strong>Inspection:</strong> ${updatedQuotation.serviceType || "Pre-purchase"}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${updatedQuotation.portCountry || "Baltimore, USA"}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${updatedQuotation.inspectionDate}</p>
            <p style="margin: 5px 0; font-size: 18px; color: #2d3454;"><strong>Agreed Fee: $${amount}</strong></p>
          </div>

          <p>We will contact you soon. For help, call +44 2920 446 644.</p>
          <p>Regards,<br><strong>Operations Team</strong></p>
        </div>
      `
    };

    // 2. Email bhejte waqt handle karein
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully to:", clientEmail);
    } catch (mailError) {
      console.error("❌ NodeMailer Error:", mailError.message);
      // Ham response fir bhi success bhejenge kyunki DB update ho gaya hai, 
      // par log mein error dikh jayega.
    }

    res.json({ 
      success: true, 
      message: "Quotation updated and processing email.", 
      data: updatedQuotation 
    });

  } catch (error) {
    console.error("❌ Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};