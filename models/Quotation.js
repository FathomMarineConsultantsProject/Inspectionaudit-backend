const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    shipType: String,
    serviceType: String,
    portCountry: String,
    inspectionDate: Date,
    
// ✅ Client email
    clientEmail: {
      type: String,
      required: true,
    },

    // Team fills later
    amount: Number,
    description: String,
    status: {
      type: String,
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);