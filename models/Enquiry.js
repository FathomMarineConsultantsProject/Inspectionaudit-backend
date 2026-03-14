const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
    },

    pic: {
      type: String,
    },

    phone: {
      type: String,
    },

    clientEmail: {
      type: String,
      required: true,
    },

    shipType: {
      type: String,
      required: true,
    },

    serviceType: {
      type: String,
    },

    portCountry: {
      type: String,
    },

    inspectionDate: {
      type: String,
    },

    token: {
      type: String,
      unique: true,
    },

    surveyorFee: {
      type: Number,
    },

    status: {
      type: String,
      default: "pending",
    },

    declineReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);