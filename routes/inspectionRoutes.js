const express = require("express");
const router = express.Router();
const Inspection = require("../models/Inspection");
const upload = require("../middleware/upload");
const mongoose = require("mongoose");
/* ===============================
   1️⃣ CREATE INSPECTION (MULTIPLE IMAGES)
================================ */
router.post(
  "/create",
  upload.fields([
    { name: "shipImage", maxCount: 100 },
    { name: "logo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("BODY:", req.body);

      // ✅ Match frontend field names
      const {
        userId,
        shipName,
        portInspected,
        surveyorName,
        inspectedDate,
      } = req.body;

      // Multiple images
      let shipImagePaths = [];
      if (req.files?.shipImage) {
        shipImagePaths = req.files.shipImage.map(file => file.path);
      }

      const logoPath = req.files?.logo?.[0]?.path || "";

      const inspection = await Inspection.create({
        userId,
        shipName,
        portName: portInspected,      // map to schema
        dateText: inspectedDate,      // map to schema
        poweredBy: surveyorName,      // map to schema
        shipImage: shipImagePaths,
        logo: logoPath,
      });

      res.status(201).json({
        success: true,
        inspectionId: inspection._id,
        imageCount: shipImagePaths.length,
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
   3️⃣ GET INSPECTION (LAST!)
================================ */
router.get("/:inspectionId", async (req, res) => {
  const { inspectionId } = req.params;

  // ✅ Prevent "Invalid ID" forever
  if (!mongoose.Types.ObjectId.isValid(inspectionId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid inspection ID format",
    });
  }

  try {
    const inspection = await Inspection.findById(inspectionId);

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found",
      });
    }

    res.json({ success: true, inspection });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
router.get("/", async (req, res) => {
  try {
    const inspections = await Inspection.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: inspections.length,
      inspections,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
