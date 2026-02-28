const mongoose = require("mongoose");

const inspectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipName: { type: String, required: true },
    portName: { type: String, required: true },
    
    // 👇 Status field (Crucial for filtering "Pending" inspections)
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
    },

    // 👇 Inspection type
    inspectionType: { type: String, required: true }, 

    inspectionDate: { type: Date, required: true }, // 📅 Use Date object instead of String

    shipImage: [{ type: String }],
    logo: String,
    
    // 👇 Report URL (After inspection is done)
    reportUrl: { type: String, default: "" }, 

    // 👇 Inspector Notes
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inspection", inspectionSchema);