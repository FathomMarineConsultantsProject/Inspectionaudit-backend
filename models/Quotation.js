const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    shipType: String,
    serviceType: String,
    portCountry: String,
    inspectionDate: Date,
    notes: String,

    // 👇 Jab team quotation submit karegi
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