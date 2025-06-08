const db = require("../db"); // Import the database module
const sendEmail = require("../utils/sendEmail"); // Import email utility (if needed)

// Register for an event
const registerForEvent = async (req, res) => {
  const { user_id, event_id } = req.body; 
  console.log("📥 Incoming Request Body:", req.body);

  if (!user_id || !event_id) {
    return res.status(400).json({ message: "Missing user_id or event_id in request." });
  }

  try {
    // Check if the user is already registered for the event
    const existingRegistration = await db.query(
      "SELECT * FROM registrations WHERE user_id = ? AND event_id = ?", 
      [user_id, event_id]
    );

    if (existingRegistration.length > 0) {
      return res.status(400).json({ message: "You are already registered for this event." });
    }

    // Fetch event details
    const rows = await db.query("SELECT available_seats FROM events WHERE id = ?", [event_id]);

    console.log("🔍 Query Result (Raw):", rows);

    // Ensure event is found
    const event = Array.isArray(rows) ? rows[0] : rows;

    if (!event || event.available_seats === undefined) {
      console.error("🚨 Event Not Found or Missing 'available_seats':", event);
      return res.status(404).json({ message: "Event not found." });
    }

    console.log("✅ Event Found:", event);

    // Check seat availability
    if (event.available_seats <= 0) {
      return res.status(400).json({ message: "Oops! Seats are full." });
    }

    // Register user for event
    await db.query("INSERT INTO registrations (user_id, event_id) VALUES (?, ?)", [user_id, event_id]);

    // Reduce available seats
    await db.query("UPDATE events SET available_seats = available_seats - 1 WHERE id = ?", [event_id]);

    res.json({ message: "Registration successful!" });
  } catch (error) {
    console.error("❌ Error in registerForEvent:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


 
const getUpcomingEvents = async (req, res) => {
  try {
    console.log("📝 Running query to fetch upcoming events...");

    // Correct the query structure
    const events = await db.query(`
      SELECT * FROM events 
      WHERE DATE(date) >= DATE(UTC_TIMESTAMP()) 
      ORDER BY date ASC
    `);

    console.log("📌 Backend fetched events:", JSON.stringify(events, null, 2));
    console.log("🔢 Number of upcoming events:", events.length || events[0]?.length);

    // Ensure correct array access if mysql2 returns a nested array
    const upcomingEvents = Array.isArray(events[0]) ? events[0] : events;

    if (upcomingEvents.length === 0) {
      return res.status(404).json({ message: "No upcoming events found." });
    }

    res.json(upcomingEvents);
  } catch (error) {
    console.error("❌ Error fetching upcoming events:", error);
    res.status(500).json({ message: "Server error fetching upcoming events", error });
  }
};

  
const getPastEvents = async (req, res) => {
  try {
    console.log("📝 Running query to fetch past events...");

    // Corrected query to fetch past events (before today)
    const events = await db.query(`
      SELECT * FROM events 
      WHERE DATE(date) < DATE(UTC_TIMESTAMP()) 
      ORDER BY date DESC
    `);

    console.log("📌 Backend fetched past events:", JSON.stringify(events, null, 2));
    console.log("🔢 Number of past events:", events.length || events[0]?.length);

    // Ensure correct array access if mysql2 returns a nested array
    const pastEvents = Array.isArray(events[0]) ? events[0] : events;

    if (pastEvents.length === 0) {
      return res.status(404).json({ message: "No past events found." });
    }

    res.json(pastEvents);
  } catch (error) {
    console.error("❌ Error fetching past events:", error);
    res.status(500).json({ message: "Server error fetching past events", error });
  }
};

// Get registered events for a student
const getRegisteredEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    // Fetch events the student is registered for
    const events = await db.query(
      "SELECT events.* FROM registrations JOIN events ON registrations.event_id = events.id WHERE registrations.user_id = ?",
      [userId]
    );

    console.log("📌 Backend fetched registered events:", JSON.stringify(events, null, 2));

    if (events.length === 0) {
      return res.status(404).json({ message: "No events registered for this student." });
    }

    // Return the list of registered events
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching registered events for student:", error);
    res.status(500).json({ message: "Server error fetching registered events", error });
  }
};
const getusername = async (req, res) => {
  try {
    console.log("📝 Received ID:", req.params.id);

    const id = Number(req.params.id);
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    // Execute the SQL query
    const query = "SELECT name FROM users WHERE id = ?";
    const result = await db.query(query, [id]);

    console.log("📌 Query Result:", result); // Debugging line

    // Ensure result is in correct format
    const rows = Array.isArray(result) ? result : [result];

    if (rows.length === 0 || !rows[0]?.name) {
      return res.status(404).json({ message: "User not found or has no name." });
    }

    res.json({ name: rows[0].name });
  } catch (error) {
    console.error("❌ SQL Error:", error.message, error);
    res.status(500).json({ message: "Server error fetching user profile", error: error.message });
  }
};


// Export all functions
module.exports = {
  getUpcomingEvents,
  getPastEvents,
  getRegisteredEvents,
  registerForEvent, 
  getusername,
};
