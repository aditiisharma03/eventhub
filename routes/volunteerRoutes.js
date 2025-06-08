const express = require("express");
const { 
    applyForVolunteer, 
    getAppliedVolunteerEvents, 
    getTasks // ✅ Added getTasks route
} = require("../controllers/volunteerController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/apply", verifyToken, applyForVolunteer);  
router.get("/applied-events", verifyToken, getAppliedVolunteerEvents); // ✅ Fetch applied volunteer events
router.get("/tasks/:volunteerId", verifyToken, getTasks); // ✅ Fetch tasks for a volunteer

module.exports = router;
