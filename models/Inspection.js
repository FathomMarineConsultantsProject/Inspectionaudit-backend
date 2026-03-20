const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipName: {
      type: String,
      required: true,
      trim: true,
    },
    portName: { // Frontend se 'portInspected' yahan aayega
      type: String,
      required: true,
      trim: true,
    },
    location: { // 👈 Location field add kar di gayi hai
      type: String,
      default: "",
    },
    surveyorName: { // 👈 Inspector ka naam save karne ke liye
      type: String,
      default: "",
    },
    inspectionType: {
      type: String,
      default: "General", // Default value set kar di taaki error na aaye
    },
    inspectionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },
    shipImage: [{ type: String }],
    logo: String,
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inspection", inspectionSchema);