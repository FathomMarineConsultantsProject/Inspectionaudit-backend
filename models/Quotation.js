const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    // 🔗 Linking fields
    quotationId: {
      type: String,
      required: true,
      unique: true,
    },

    inspectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inspection",
      required: true,
    },

    // 📋 Details shown in Admin table
    name: String,          // ship / client name
    email: String,
    shipType: String,
    serviceType: String,
    portCountry: String,
    inspectionDate: Date,

    // 📝 Quotation data
    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Pending", "Submitted", "Approved", "Rejected"],
      default: "Submitted",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = mongoose.model("Quotation", quotationSchema);