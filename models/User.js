const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  isProfileComplete: { type: Boolean, default: false },

  fullName: { type: String, default: "" },
  title: { type: String, default: "" },
  employeeId: { type: String, default: "" },
  licenseNumber: { type: String, default: "" },
  certifications: { type: String, default: "" },
  experience: { type: String, default: "" },
  company: { type: String, default: "" },
  phone: { type: String, default: "" },

  shipSpecialization: { type: [String], default: [] },

  availability: {
    type: String,
    enum: ["AVAILABLE", "BUSY", "ON LEAVE", "UNAVAILABLE"],
    default: "AVAILABLE"
  },

  location: {
    type: String,
    default: ""
  },

  currentVessel: {
    name: { type: String, default: "" },
    imo: { type: String, default: "" },
    type: { type: String, default: "" }
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);