const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  inspectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Inspection",
    required: true,
  },
  uri: String,
  description: String,
});

module.exports = mongoose.model("Photo", photoSchema);
