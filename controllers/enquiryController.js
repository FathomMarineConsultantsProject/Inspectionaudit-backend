const Enquiry = require("../models/Enquiry");
const transporter = require("../config/mailer");
const crypto = require("crypto");

/* ===============================
   CREATE ENQUIRY (Image 1 Email)
================================ */
exports.createEnquiry = async (req, res) => {
  try {
    const { clientName, clientEmail, shipType, serviceType, portCountry, inspectionDate } = req.body;
    const token = crypto.randomBytes(24).toString("hex");

    const enquiry = await Enquiry.create({
      clientName, clientEmail, shipType, serviceType, portCountry, inspectionDate, token
    });

// Use process.env.FRONTEND_URL for production
const frontendUrl = process.env.FRONTEND_URL || "https://inspectionaudit-frontend-dashboard.vercel.app";

const link = `${frontendUrl}/client-enquiry/${token}`;

    await transporter.sendMail({
      to: clientEmail,
      subject: "Action Required: Vessel Inspection Availability",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a2634; max-width: 600px; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1a2634; border-bottom: 2px solid #00b8d4; padding-bottom: 10px;">IDWAL</h2>
          <p>Dear ${clientName},</p>
          <p><b>PLEASE DO NOT RESPOND TO THIS EMAIL</b></p>
          <p>You are invited to confirm your availability for the following assignment:</p>
          <div style="margin: 20px 0;">
            <a href="${link}" style="background-color: #00b8d4; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              CLICK HERE TO INDICATE YOUR AVAILABILITY
            </a>
          </div>
          <p style="font-style: italic; font-size: 12px; color: #7f8c8d;">
            Inspection prices are in the agreed currency (USD, GBP or EUR). This is a lump sum inclusive of time, survey and reporting plus related expenses...
          </p>
          <p style="font-size: 14px;">This enquiry is time sensitive, therefore your swift response is appreciated.</p>
          <hr style="border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #95a5a6;">In case you require any assistance please contact operations.</p>
        </div>
      `,
    });

    res.json({ message: "Enquiry created and invitation email sent", enquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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
      { surveyorFee: fee, status: "confirmed" },
      { new: true }
    );

    if (!enquiry) return res.status(404).json({ message: "Enquiry not found" });

    // Final Confirmation Email (Image 5 Style)
    await transporter.sendMail({
      to: enquiry.clientEmail,
      subject: `Confirmation of Availability - Ref: 113/${enquiry._id.toString().slice(-4)}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #1a2634; border-bottom: 2px solid #00b8d4; padding-bottom: 10px;">Fathom marine consultants</h2>
          <p>Dear ${enquiry.clientName},</p>
          <p>Thank you for confirming availability for enquiry ref: <b>113/${enquiry._id.toString().slice(-4)}</b></p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="margin: 5px 0;"><b>Vessel type:</b> ${enquiry.shipType}</p>
            <p style="margin: 5px 0;"><b>Inspection type:</b> ${enquiry.serviceType}</p>
            <p style="margin: 5px 0;"><b>Location:</b> ${enquiry.portCountry}</p>
            <p style="margin: 5px 0;"><b>Date:</b> ${enquiry.inspectionDate}</p>
            <p style="margin: 5px 0; color: #27ae60;"><b>Agreed Fee:</b> $${fee}</p>
          </div>

          <p>We will update once we hear further from the client.</p>
          <p style="font-size: 12px; color: #7f8c8d; margin-top: 20px;">
            In case you require any assistance please contact operations or call +44 2920 446 644 (UK).
          </p>
        </div>
      `
    });

    res.json({ message: "Confirmed and final email sent", enquiry });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
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