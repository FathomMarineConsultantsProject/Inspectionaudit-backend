const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

  // === AUTH ===
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },

  password: { 
    type: String 
  },

  isProfileComplete: {
    type: Boolean,
    default: false
  },

  // === PROFILE FIELDS ===
  fullName: { type: String, default: "" },
  title: { type: String, default: "" },
  employeeId: { type: String, default: "" },
  licenseNumber: { type: String, default: "" },
  certifications: { type: String, default: "" },
  experience: { type: String, default: "" },
  company: { type: String, default: "" },
  phone: { type: String, default: "" },

  shipSpecialization: {
    type: [String],
    default: []
  },

  additionalNotes: { type: String, default: "" },
  signature: { type: String, default: "" },

  currentVessel: {
    name: { type: String, default: "" },
    imo: { type: String, default: "" },
    type: { type: String, default: "" }
  }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
