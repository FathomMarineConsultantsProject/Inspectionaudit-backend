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
   SURVEYOR EMAIL LIST
   (You can move this to DB later)
========================= */
const surveyorEmails = [
  "surveyor1@gmail.com",
  "surveyor2@gmail.com",
  "surveyor3@gmail.com",
];

/* =========================
   SEND EMAIL FUNCTION
========================= */
const sendSurveyorEmails = async (quotation) => {
  try {
    const submitLink = `https://inspectionaudit-frontend-dashboard.vercel.app/submit-quotation?email=${quotation.clientEmail}`;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: surveyorEmails.join(","),

      subject: "🚢 New Inspection Enquiry - Submit Quotation",

      html: `
        <div style="font-family:Arial,sans-serif;padding:20px;">
          
          <h2 style="color:#2c5cc5;text-align:center;">
            🚢 New Inspection Enquiry
          </h2>

          <p>Hello Surveyor Team, please review the enquiry details:</p>

          <table width="100%" border="1" cellpadding="10" cellspacing="0" style="border-collapse:collapse;">
            
            <tr style="background:#2c5cc5;color:white;">
              <th align="left">Field</th>
              <th align="left">Details</th>
            </tr>

            <tr>
              <td><strong>Ship Type</strong></td>
              <td>${quotation.shipType || "-"}</td>
            </tr>

            <tr>
              <td><strong>Service Type</strong></td>
              <td>${quotation.serviceType || "-"}</td>
            </tr>

            <tr>
              <td><strong>Port & Country</strong></td>
              <td>${quotation.portCountry || "-"}</td>
            </tr>

            <tr>
              <td><strong>Inspection Date</strong></td>
              <td>${quotation.inspectionDate || "-"}</td>
            </tr>

            <tr>
              <td><strong>Client Email</strong></td>
              <td>${quotation.clientEmail}</td>
            </tr>

          </table>

          <div style="text-align:center;margin-top:30px;">
            <a href="${submitLink}" 
              style="background:#2c5cc5;color:white;
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
    };

    await transporter.sendMail(mailOptions);

    console.log("Surveyor emails sent successfully");

  } catch (error) {
    console.error("Error sending surveyor emails:", error);
  }
};

module.exports = sendSurveyorEmails;