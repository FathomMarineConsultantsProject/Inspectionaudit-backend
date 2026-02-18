const express = require("express");
const router = express.Router();
const Photo = require("../models/Photo");

router.post("/add", async (req, res) => {
  const { inspectionId, photos } = req.body;

  const saved = await Photo.insertMany(
    photos.map(p => ({
      inspectionId,
      uri: p.uri,
      description: p.description || "",
    }))
  );

  res.json({ message: "Photos saved", count: saved.length });
});

router.get("/:inspectionId", async (req, res) => {
  const photos = await Photo.find({
    inspectionId: req.params.inspectionId,
  });
  res.json(photos);
});

module.exports = router;
