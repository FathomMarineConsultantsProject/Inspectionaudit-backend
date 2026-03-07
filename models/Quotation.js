const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    enquiryRef: { type: String, default: "113/4086" }, // Based on your image
    clientName: { type: String, default: "Nipun Chatrath" },
    shipType: { type: String, required: false }, // Vessel Type
    serviceType: { type: String, required: false }, // Inspection Type
    portCountry: { type: String, required: false }, // Location
    inspectionDate: { type: String, required: false },
    clientEmail: { type: String, required: false },
    amount: { type: Number, required: false },
    description: { type: String, required: false },
    status: { type: String, default: "Pending" },
  }, { timestamps: true });

module.exports = mongoose.model("Quotation", quotationSchema);