const mongoose = require("mongoose");

const loginSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String }, // 🌍 IP address track karne ke liye
    userAgent: { type: String }, // 📱 Browser/Device info ke liye
  },
  { timestamps: true }
);

module.exports = mongoose.model("Login", loginSchema);