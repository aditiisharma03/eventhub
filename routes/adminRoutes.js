const express = require("express");
require("dotenv").config(); // Load environment variables

const router = express.Router();
const adminController = require("../controllers/adminController");

// 🔍 Debugging: Check if adminController is properly imported
console.log("🔍 Debug adminController:", adminController);

router.post("/add-event", adminController.addEvent);
router.delete("/delete-event/:eventId", adminController.deleteEvent);
router.post("/approve-volunteer", adminController.approveVolunteer);
router.get("/registrations", adminController.getStudentRegistrations);
router.get("/volunteers/requests", adminController.getVolunteerRequests);
router.get("/approved-volunteers", adminController.getApprovedVolunteers);
 

module.exports = router;
