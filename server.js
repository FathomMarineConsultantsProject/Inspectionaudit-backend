const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/authRoutes");

const app = express();

// ✅ CORS (put real origins if possible)
app.use(
  cors({
    origin: [
      "http://localhost:8081",
      "http://localhost:3000",
      "https://inspectionaudit-backend.vercel.app", // (optional)
      // add your frontend vercel domain here
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.options("*", cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "API is running", status: "healthy" });
});

// Routes
app.use("/api/auth", authRoutes);
const userRoutes = require("./routes/userRoutes");
const loginRoutes = require("./routes/loginRoutes");
const inspectionRoutes = require("./routes/inspectionRoutes");

app.use("/api/inspectors", userRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/logins", loginRoutes);

// DB
const PORT = process.env.PORT || 5000;
const DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/your-database-name";

mongoose.set("strictQuery", true);

mongoose
  .connect(DATABASE_URL, {
    serverSelectionTimeoutMS: 8000,
    connectTimeoutMS: 8000,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // ✅ Only listen locally. On Vercel, do NOT listen.
    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📝 API available at http://localhost:${PORT}/api/auth`);
      });
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error FULL:", err);
    console.error("❌ Message:", err.message);
    process.exit(1);
  });

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

module.exports = app;

app.post("/send-quotation", async (req, res) => {
  try {
    const {
      shipType,
      serviceType,
      portCountry,
      inspectionDate
    } = req.body;

    const htmlContent = `
    <div style="font-family: Arial, sans-serif;">

      <p><strong>Greetings from Sinotech Marine!</strong></p>

      <p>
        We request your best quotation & availability for new inspection enquiry 
        as per details given below:
      </p>

      <h3>New Inspection Enquiry Details</h3>

      <table style="border-collapse: collapse; width: 100%; max-width:600px;" border="1" cellpadding="8">
        <tr>
          <td><strong>Ship Type</strong></td>
          <td>${shipType}</td>
        </tr>
        <tr>
          <td><strong>Service Type</strong></td>
          <td>${serviceType}</td>
        </tr>
        <tr>
          <td><strong>Port & Country</strong></td>
          <td>${portCountry}</td>
        </tr>
        <tr>
          <td><strong>On Around Inspection</strong></td>
          <td>${inspectionDate}</td>
        </tr>
      </table>

      <br/>

      <a href="https://www.shipinspectors.com/submit-quotation"
         style="display:inline-block;padding:12px 25px;background:#007bff;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;">
         Submit Quotation
      </a>

      <br/><br/>

      <p>Kind Regards,<br/>Sinotech Marine</p>

    </div>
    `;

    await transporter.sendMail({
      from: '"Sinotech Marine" <yourgmail@gmail.com>',
      to: "inspection@company.com",
      subject: "New Inspection Enquiry Details",
      html: htmlContent,
    });

    res.status(200).json({ message: "Email Sent Successfully" });

  } catch (error) {
    res.status(500).json({ error: "Email sending failed" });
  }
});