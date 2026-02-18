const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");


// ============================================
// AUTH MIDDLEWARE - Verify user by ID from header
// ============================================
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized - No token",
    });
  }

  try {
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, "MY_SECRET_KEY");

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized - Invalid token",
    });
  }
};


// ============================================
// ✅ SIGNUP - Only Email & Password
// ============================================
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      isProfileComplete: false,
    });

    res.status(201).json({
      success: true,
      message: "Signup successful",
      userId: user._id,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// ============================================
// ✅ LOGIN
// ============================================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔐 CREATE JWT TOKEN
    const token = jwt.sign(
      { id: user._id },
      "MY_SECRET_KEY",   // later use process.env
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Login success",
      token,   // 🔥 VERY IMPORTANT
      userId: user._id,
      email: user.email,
      isProfileComplete: user.isProfileComplete,
      fullName: user.fullName || "",
      title: user.title || "",
      company: user.company || "",
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


// ============================================
// ✅ GET PROFILE
// ============================================
router.get("/profile", protect, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "user not found",
      });
    }
    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        isProfileComplete: user.isProfileComplete,

        fullName: user.fullName || "",
        title: user.title || "",
        employeeId: user.employeeId || "",
        licenseNumber: user.licenseNumber || "",
        certifications: user.certifications || "",
        experience: user.experience || "",
        company: user.company || "",
        phone: user.phone || "",
         shipSpecialization: user.shipSpecialization || [],
    additionalNotes: user.additionalNotes || "",
    signature: user.signature || "",

        currentVessel: user.currentVessel || {
          name: "",
          imo: "",
          type: "",
        },

        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });

  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});



// ============================================
// ✅ UPDATE PROFILE (Save Profile Button)
// ============================================

// Change path to /profile (remove :id) and add 'protect' middleware
router.put("/profile", protect, async (req, res) => {
  try {
    const updates = {};
    const allowedFields = [
  "fullName",
  "title",
  "employeeId",
  "licenseNumber",
  "certifications",
  "experience",
  "company",
  "phone",
  "email",
  "shipSpecialization",
  "additionalNotes",
  "signature"
];

    // Map top-level strings
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Map nested Vessel fields using dot notation
    if (req.body.currentVessel) {
      if (req.body.currentVessel.name !== undefined) updates["currentVessel.name"] = req.body.currentVessel.name;
      if (req.body.currentVessel.imo !== undefined) updates["currentVessel.imo"] = req.body.currentVessel.imo;
      if (req.body.currentVessel.type !== undefined) updates["currentVessel.type"] = req.body.currentVessel.type;
    }
     updates.isProfileComplete = true;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id, 
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error", 
    });
  }
});







router.delete("/profile", protect, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);

    res.json({
      success: true,
      message: "Account deleted successfully",
    });

  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

module.exports = router;
