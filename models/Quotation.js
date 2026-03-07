const mongoose = require("mongoose");

const QuotationSchema = new mongoose.Schema({
  enquiryRef: { type: String, required: true, unique: true },
  clientName: { type: String, default: "Valued Client" },
  clientEmail: { type: String, required: true },
  shipType: { type: String, required: true },
  serviceType: { type: String, required: true },
  portCountry: { type: String, required: true },
  inspectionDate: { type: String, required: true },
  amount: { type: Number },
  description: { type: String },
  status: { type: String, default: "Pending" }, // Pending -> Quoted
}, { timestamps: true });

module.exports = mongoose.model("Quotation", QuotationSchema);