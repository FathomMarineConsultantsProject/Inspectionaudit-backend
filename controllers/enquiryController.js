const Enquiry = require("../models/Enquiry");
const transporter = require("../config/mailer");
const crypto = require("crypto");

/* ===============================
   CREATE ENQUIRY
================================ */

exports.createEnquiry = async (req, res) => {
  try {
    const {
      clientName,
      pic,
      phone,
      clientEmail,
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
    } = req.body;

    const token = crypto.randomBytes(24).toString("hex");

    const enquiry = await Enquiry.create({
      clientName,
      pic,
      phone,
      clientEmail,
      shipType,
      serviceType,
      portCountry,
      inspectionDate,
      token,
    });

    const link = `https://inspectionaudit-frontend.vercel.app/quotation/${token}`;

    await transporter.sendMail({
      to: clientEmail,

      subject: "Inspection Availability Request",

      html: `
      <h3>Inspection Availability Request</h3>

      <p>Please confirm your availability for the inspection.</p>

      <p><b>Ship Type:</b> ${shipType}</p>
      <p><b>Inspection Type:</b> ${serviceType}</p>
      <p><b>Location:</b> ${portCountry}</p>
      <p><b>Date:</b> ${inspectionDate}</p>

      <br/>

      <a href="${link}" style="padding:10px 20px;background:#00b894;color:white;text-decoration:none;">
      Confirm Availability
      </a>
      `,
    });

    res.json({
      message: "Enquiry created and email sent",
      enquiry,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   GET ENQUIRY BY TOKEN
================================ */

exports.getEnquiryByToken = async (req, res) => {
  try {
    const enquiry = await Enquiry.findOne({
      token: req.params.token,
    });

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found",
      });
    }

    res.json(enquiry);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   CONFIRM AVAILABILITY
================================ */

exports.confirmAvailability = async (req, res) => {
  try {
    const { token, fee } = req.body;

    const enquiry = await Enquiry.findOneAndUpdate(
      { token },
      {
        surveyorFee: fee,
        status: "confirmed",
      },
      { new: true }
    );

    res.json({
      message: "Surveyor confirmed availability",
      enquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   DECLINE ENQUIRY
================================ */

exports.declineEnquiry = async (req, res) => {
  try {
    const { token, reason } = req.body;

    const enquiry = await Enquiry.findOneAndUpdate(
      { token },
      {
        status: "declined",
        declineReason: reason,
      },
      { new: true }
    );

    res.json({
      message: "Inspection declined",
      enquiry,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

/* ===============================
   ADMIN - GET ALL ENQUIRIES
================================ */

exports.getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });

    res.json(enquiries);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};