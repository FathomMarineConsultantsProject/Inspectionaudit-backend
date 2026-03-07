const Quotation = require("../models/Quotation");
const nodemailer = require("nodemailer");

// SMTP Transporter - Vercel ke liye single connection mode zyada stable hai
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-digit App Password
  },
  // Vercel/Serverless ke liye timeouts badhana zaroori hai
  connectionTimeout: 10000, 
  socketTimeout: 10000,
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

    return res.status(201).json({ success: true, message: "Enquiry Created", data: quotation });
  } catch (error) {
    console.error("❌ Create Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to create enquiry" });
  }
};

/* =========================
   2. SUBMIT (Confirmed Availability & Email)
========================= */
exports.submitQuotation = async (req, res) => {
  try {
    const { clientEmail, amount, description } = req.body;

    // 1. Database Update
    const updatedQuotation = await Quotation.findOneAndUpdate(
      { clientEmail: clientEmail, status: "Pending" }, 
      { amount, description, status: "Quoted" },
      { new: true, sort: { createdAt: -1 } }
    );

    if (!updatedQuotation) {
      return res.status(404).json({ success: false, message: "No pending enquiry found for this email." });
    }

    // 2. Prepare Email
    const mailOptions = {
      from: `"Fathom Marine Operations" <${process.env.EMAIL_USER}>`,
      to: clientEmail,
      subject: `Availability Confirmed: Enquiry ref ${updatedQuotation.enquiryRef}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333; line-height: 1.6; border: 1px solid #eee; padding: 25px;">
          <h2 style="color: #2d3454; margin-bottom: 20px;">FATHOM MARINE</h2>
          <p>Dear ${updatedQuotation.clientName},</p>
          <p>Thank you for confirming availability for enquiry ref: <strong>${updatedQuotation.enquiryRef}</strong></p>
          <div style="margin: 25px 0; padding: 20px; background-color: #f4f7f8; border-left: 5px solid #5ac8d8; border-radius: 4px;">
             <p><strong>Ref:</strong> ${updatedQuotation.enquiryRef}</p>
             <p><strong>Vessel:</strong> ${updatedQuotation.shipType || "N/A"}</p>
             <p><strong>Location:</strong> ${updatedQuotation.portCountry || "N/A"}</p>
             <p style="font-size: 1.2em; color: #2d3454;"><strong>Agreed Fee: $${amount}</strong></p>
          </div>
          <p>Regards,<br><strong>Operations Team</strong></p>
        </div>
      `
    };

    // 3. Email Send (Await inside try-catch to prevent crashing the whole request)
    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent successfully");
    } catch (mailError) {
      console.error("❌ Mail Delivery Failed:", mailError.message);
      // Ham yahan response 200 hi bhejenge kyunki Database update ho chuka hai
    }

    return res.status(200).json({ 
      success: true, 
      message: "Quotation updated successfully!", 
      data: updatedQuotation 
    });

  } catch (error) {
    console.error("❌ Submit Error:", error.message);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

/* =========================
   3. GET ALL
========================= */
exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    return res.json({ success: true, data: quotations });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};