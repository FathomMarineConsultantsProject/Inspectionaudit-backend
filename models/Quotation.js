const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
{
  shipType: { type: String },
  serviceType: { type: String },
  portCountry: { type: String },
  inspectionDate: { type: String },   // ADD THIS
  clientEmail: { type: String },
  clientName: { type: String },       // ADD THIS

  amount: { type: Number },
  description: { type: String },

  status: { type: String, default: "Pending" }
},
{ timestamps: true }
);

module.exports = mongoose.model("Quotation", quotationSchema);