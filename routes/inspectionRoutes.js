const express = require("express");
const router = express.Router();
const Inspection = require("../models/Inspection");
const upload = require("../middleware/upload");
const mongoose = require("mongoose");

/* ===============================
    CREATE INSPECTION
================================ */
router.post(
  "/create",
  upload.fields([
    { name: "shipImage", maxCount: 100 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("Incoming Data:", req.body);

      const {
        userId,
        shipName,
        portInspected,  // Frontend field
        location,       // Frontend field
        surveyorName,   // Frontend field
        inspectedDate,  // Frontend field (DD-MM-YYYY)
      } = req.body;

      // User ID validation
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid or Missing User ID" });
      }

      // Date conversion (Frontend se aane wali DD-MM-YYYY string ko Date object mein badalna)
      let finalDate = new Date();
      if (inspectedDate) {
        const parts = inspectedDate.split("-");
        // format: YYYY-MM-DD
        finalDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }

      // Images handling
      let shipImagePaths = [];
      if (req.files?.shipImage) {
        shipImagePaths = req.files.shipImage.map(file => file.path);
      }
      const logoPath = req.files?.logo?.[0]?.path || "";

      // Database mein save karna
      const inspection = await Inspection.create({
        userId,
        shipName,
        portName: portInspected,   // Map frontend 'portInspected' to 'portName'
        location: location,        // Map frontend 'location' to 'location'
        surveyorName: surveyorName,
        inspectionDate: finalDate, // Date object
        shipImage: shipImagePaths,
        logo: logoPath,
        inspectionType: "General"  // Default type
      });

      res.status(201).json({
        success: true,
        message: "Inspection created successfully",
        inspectionId: inspection._id,
      });

    } catch (err) {
      console.error("Error creating inspection:", err);
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

/* ===============================
    GET SINGLE INSPECTION
================================ */
router.get("/:inspectionId", async (req, res) => {
  const { inspectionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }

  try {
    const inspection = await Inspection.findById(inspectionId);
    if (!inspection) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, inspection });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ===============================
    GET ALL INSPECTIONS (For Dashboard)
================================ */
router.get("/all", async (req, res) => {
  try {
    const inspections = await Inspection.find().sort({ createdAt: -1 });
    res.json({ success: true, inspections });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/* ===============================
    UPDATE INSPECTION STATUS
================================ */
router.put("/update/:id", async (req, res) => {
  try {
    const { status, notes } = req.body;
    const updated = await Inspection.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    res.json({ success: true, inspection: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;