const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();

/* =========================
   CORS
========================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8081",
      // 👉 yaha apna frontend vercel URL add karna
      // "https://your-frontend.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   Logging Middleware
========================= */
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

/* =========================
   Health Check
========================= */
app.get("/", (req, res) => {
  res.json({ message: "API is running ✅" });
});

/* =========================
   ROUTES
========================= */
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/inspectors", userRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/logins", loginRoutes);

/* =========================
   EMAIL SETUP
========================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* =========================
   SEND QUOTATION ROUTE
========================= */
app.post("/send-quotation", async (req, res) => {
  try {
    const { shipType, serviceType, portCountry, inspectionDate } = req.body;

    const htmlContent = `
<div style="font-family: Arial, sans-serif; background-color:#f4f6f9; padding:20px;">
  <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px;">

    <h2 style="color:#0d6efd; text-align:center; margin-bottom:20px;">
      🚢 New Inspection Enquiry
    </h2>

    <p>Hello Team,</p>
    <p>Please find the inspection request details below:</p>

    <table width="100%" border="1" cellspacing="0" cellpadding="12"
      style="border-collapse:collapse; margin-top:20px; font-size:14px;">

      <tr style="background-color:#0d6efd; color:white;">
        <th align="left">Field</th>
        <th align="left">Details</th>
      </tr>

      <tr>
        <td><strong>Ship Type</strong></td>
        <td>${shipType}</td>
      </tr>

      <tr style="background-color:#f9f9f9;">
        <td><strong>Service Type</strong></td>
        <td>${serviceType}</td>
      </tr>

      <tr>
        <td><strong>Port & Country</strong></td>
        <td>${portCountry}</td>
      </tr>

      <tr style="background-color:#f9f9f9;">
        <td><strong>Inspection Date</strong></td>
        <td>${inspectionDate}</td>
      </tr>

    </table>

    <div style="text-align:center; margin-top:25px;">
      <a href="https://www.shipinspectors.com/submit-quotation"
        style="
          background-color:#0d6efd;
          color:white;
          padding:12px 25px;
          text-decoration:none;
          border-radius:5px;
          font-weight:bold;
          display:inline-block;
        ">
        Submit Quotation
      </a>
    </div>

    <p style="margin-top:30px;">
      Regards,<br/>
      <strong>Sinotech Marine</strong>
    </p>

  </div>
</div>
`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "inspection@company.com",
      subject: "New Inspection Enquiry Details",
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: "Email Sent Successfully ✅",
    });

  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "Email sending failed ❌",
    });
  }
});

/* =========================
   DATABASE CONNECTION
========================= */
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DATABASE_URL, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  })
  .then(() => {
    console.log("✅ MongoDB Connected");

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB Error:", err.message);
    process.exit(1);
  });

/* =========================
   404 HANDLER
========================= */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong",
  });
});

module.exports = app;