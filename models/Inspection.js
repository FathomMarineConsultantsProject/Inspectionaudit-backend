const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    // 👤 Who created inspection
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 🚢 Inspection Details
    shipName: {
      type: String,
      required: true,
      trim: true,
    },

    portName: {
      type: String,
      required: true,
      trim: true,
    },

    inspectionType: {
      type: String,
      required: true,
    },

    inspectionDate: {
      type: Date,
      required: true,
    },

    // 📌 Inspection lifecycle
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },

    // 🖼 Media
    shipImage: [{ type: String }],
    logo: String,

    // 📄 Report
    reportUrl: {
      type: String,
      default: "",
    },

    notes: {
      type: String,
      default: "",
    },

    // 💰 Quotation Integration
    quotationId: {
      type: String,
      default: null,
    },

    quotationStatus: {
      type: String,
      enum: ["Not Sent", "Pending", "Submitted"],
      default: "Not Sent",
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Inspection", inspectionSchema);