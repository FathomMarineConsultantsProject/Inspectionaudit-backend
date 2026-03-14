const express = require("express");

const router = express.Router();

const enquiryController = require("../controllers/enquiryController");

router.post("/enquiry", enquiryController.createEnquiry);

router.get("/enquiry/:token", enquiryController.getEnquiryByToken);

router.post("/enquiry/confirm", enquiryController.confirmAvailability);

router.post("/enquiry/decline", enquiryController.declineEnquiry);

router.get("/admin/enquiries", enquiryController.getAllEnquiries);

module.exports = router;