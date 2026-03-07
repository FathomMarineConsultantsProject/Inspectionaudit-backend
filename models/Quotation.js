const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
 // Client info (optional for submit route)
  shipType: { type: String, required: false },
  serviceType: { type: String, required: false },
  portCountry: { type: String, required: false },
  clientEmail: { type: String, required: false },

  // Team fills these
  amount: { type: Number, required: false },
  description: { type: String, required: false },

  // Status
  status: { type: String, default: "Pending" }, // Default Pending, submit changes to Quoted
}, { timestamps: true });

module.exports = mongoose.model("Quotation", quotationSchema);