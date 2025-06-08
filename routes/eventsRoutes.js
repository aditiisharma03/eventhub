 // routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const db = require("../db");  // ✅ Import database connection


// Example GET route to fetch events
router.get("/", async (req, res) => {
  try {
    // Fetch events from the database
    const events = await db.query("SELECT * FROM events");
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events." });
  }
});

module.exports = router;
