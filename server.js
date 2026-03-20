const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config(); // ✅ ALWAYS TOP

const app = express();

/* =========================
   CORS (FIXED)
========================= */
app.use(
  cors({
   origin: [
  "http://localhost:5173",
  "http://localhost:5175", // ✅ ADD THIS
  "http://localhost:3000",
  "http://localhost:8081",
  "http://localhost:8080",
  "https://inspectionaudit-frontend-dashboard.vercel.app"
],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Preflight support (NOW IN RIGHT PLACE)
app.options("*", cors());

app.use(express.json());

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
const quotationRoutes = require("./routes/quotationRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/inspectors", userRoutes);
app.use("/api/logins", loginRoutes);
app.use("/api/inspections", inspectionRoutes);
app.use("/api/quotation", quotationRoutes);
app.use("/api", enquiryRoutes);

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