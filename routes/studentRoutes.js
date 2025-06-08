const express = require("express");
const { registerForEvent, getUpcomingEvents, getPastEvents, getRegisteredEvents, getusername } = require("../controllers/studentController");

const router = express.Router();

router.post("/register-event", registerForEvent);  // Register for an event
router.get("/upcoming-events", getUpcomingEvents); // Fetch upcoming events
router.get("/past-events", getPastEvents);         // Fetch past events
router.get("/events/:userId", getRegisteredEvents); // Fetch registered events
router.get("/getusername/:id",getusername); 

module.exports = router;
