const Enquiry = require("../models/Enquiry");
const transporter = require("../config/mailer");
const crypto = require("crypto");


/* ===============================
   CREATE ENQUIRY
================================ */

exports.createEnquiry = async (req, res) => {
  try {

    const {
      surveyorName,
      surveyorEmail,
      shipType,
      serviceType,
      portCountry,
      inspectionFrom,
      inspectionTo,
      recommendedFee
    } = req.body;

    const token = crypto.randomBytes(24).toString("hex");

    const enquiry = await Enquiry.create({
      surveyorName,
      surveyorEmail,
      shipType,
      serviceType,
      portCountry,
      inspectionFrom,
      inspectionTo,
      recommendedFee,
      token
    });

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "https://inspectionaudit-frontend-dashboard.vercel.app";

    const link = `${frontendUrl}/client-enquiry/${token}`;

    await transporter.sendMail({
      to: surveyorEmail,
      subject: "Action Required: Vessel Inspection Availability",
      html: `
      <div style="font-family: Arial, sans-serif; color:#1a2634; max-width:600px; border:1px solid #eee; padding:20px;">

        <h2 style="border-bottom:2px solid #00b8d4; padding-bottom:10px;">
        Fathom Marine Consultation
        </h2>

        <p>Dear ${surveyorName},</p>

        <p><b>PLEASE DO NOT RESPOND TO THIS EMAIL</b></p>

        <p>You are invited to confirm your availability for the following inspection:</p>

        <p><b>Vessel Type:</b> ${shipType}</p>
        <p><b>Inspection Type:</b> ${serviceType}</p>
        <p><b>Location:</b> ${portCountry}</p>
        <p><b>Inspection Window:</b> ${inspectionFrom} - ${inspectionTo}</p>

        <div style="margin:20px 0;">
          <a href="${link}"
          style="background:#00b8d4;color:white;padding:12px 25px;text-decoration:none;border-radius:4px;font-weight:bold;">
          CLICK HERE TO INDICATE YOUR AVAILABILITY
          </a>
        </div>

        <p style="font-size:13px;color:#7f8c8d;">
        This enquiry is time sensitive, therefore your swift response is appreciated.
        </p>

        <hr/>

        <p style="font-size:12px;color:#95a5a6;">
        Fathom Marine Consultation – Operations Team
        </p>

      </div>
      `
    });

    res.json({
      message: "Enquiry created and email sent",
      enquiry
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server error"
    });

  }
};



/* ===============================
   GET ENQUIRY BY TOKEN
================================ */

exports.getEnquiryByToken = async (req, res) => {
  try {

    const enquiry = await Enquiry.findOne({
      token: req.params.token
    });

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found"
      });
    }

    res.json(enquiry);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
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
        status: "confirmed"
      },
      { new: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        message: "Enquiry not found"
      });
    }

    await transporter.sendMail({
      to: enquiry.surveyorEmail,
      subject: `Availability Confirmed - Ref ${enquiry._id.toString().slice(-4)}`,
      html: `
      <div style="font-family:Arial;max-width:600px;border:1px solid #eee;padding:20px;">

      <h2 style="border-bottom:2px solid #00b8d4;padding-bottom:10px;">
      Fathom Marine Consultation
      </h2>

      <p>Dear ${enquiry.surveyorName},</p>

      <p>Thank you for confirming availability for the following inspection.</p>

      <div style="background:#f9f9f9;padding:15px;margin-top:15px;border-radius:4px;">

      <p><b>Vessel Type:</b> ${enquiry.shipType}</p>
      <p><b>Inspection Type:</b> ${enquiry.serviceType}</p>
      <p><b>Location:</b> ${enquiry.portCountry}</p>
      <p><b>Date:</b> ${enquiry.inspectionFrom} - ${enquiry.inspectionTo}</p>

      <p style="color:#27ae60;"><b>Agreed Fee:</b> $${fee}</p>

      </div>

      <p style="margin-top:20px;">
      We will update you once we hear further from the client.
      </p>

      </div>
      `
    });

    res.json({
      message: "Availability confirmed",
      enquiry
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
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
        declineReason: reason
      },
      { new: true }
    );

    res.json({
      message: "Inspection declined",
      enquiry
    });

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};



/* ===============================
   ADMIN GET ALL ENQUIRIES
================================ */

exports.getAllEnquiries = async (req, res) => {

  try {

    const enquiries = await Enquiry
      .find()
      .sort({ createdAt: -1 });

    res.json(enquiries);

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    });

  }

};