const express = require("express");
const router = express.Router();
const Login = require("../models/Login");

router.get("/", async (req, res) => {
  try {
    const logins = await Login.find().sort({ createdAt: -1 });
    res.json(logins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;