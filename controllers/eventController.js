const db = require("../db");

// Add an event
async function addEvent(eventInput, eventDescription, eventDate, eventTime, eventVenue, eventSeats) {
  const title = eventInput.value.trim();
  const description = eventDescription.value.trim();
  const date = eventDate.value;
  const time = eventTime.value;
  const location = eventVenue.value.trim();
  const max_seats = parseInt(eventSeats.value, 10);
  const available_seats = max_seats; // Default available seats = max seats

  if (!title || !description || !date || !time || !location || isNaN(max_seats) || max_seats <= 0) {
      alert("❌ Please fill in all fields correctly.");
      return;
  }

  try {
      const response = await fetch(`${BASE_URL}/admin/add-event`, { 
          method: "POST",
          headers: { 
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          },
          body: JSON.stringify({ title, description, date, location, max_seats, available_seats })
      });

      const result = await response.json();

      if (!response.ok) {
          throw new Error(result.message || "❌ Failed to add event.");
      }

      addEventToUI(result.eventId, title, description, date, time, location, max_seats);
      
      // ✅ Clear input fields after successful submission
      eventInput.value = "";
      eventDescription.value = "";
      eventDate.value = "";
      eventTime.value = "";
      eventVenue.value = "";
      eventSeats.value = "";

      alert("✅ Event added successfully!");
  } catch (error) {
      console.error("❌ Error adding event:", error);
      alert("❌ Failed to add event. Please try again.");
  }
}


// Delete an event
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  try {
    console.log("🔍 Attempting to delete event with ID:", eventId);

    // Ensure eventId is valid
    if (!eventId || isNaN(eventId)) {
      console.error("❌ Invalid eventId:", eventId);
      return res.status(400).json({ message: "Invalid event ID" });
    }

    // ✅ Execute the SQL query correctly
    const [result] = await db.pool.execute("DELETE FROM events WHERE id = ?", [eventId]);

    console.log("📌 Raw DB Response:", result);

    // ✅ Ensure `affectedRows` is checked correctly
    if (result.affectedRows === 0) {
      console.warn("⚠️ No event found with the given ID.");
      return res.status(404).json({ message: "Event not found." });
    }

    res.json({ message: "✅ Event deleted successfully!" });

  } catch (err) {
    console.error("❌ Error deleting event:", err);
    res.status(500).json({ message: "Server error while deleting event", error: err.message });
  }
};


// Approve a volunteer
const approveVolunteer = async (req, res) => {
  const { volunteerId } = req.params;
  try {
    const result = await db.query(
      "UPDATE volunteers SET status = 'approved' WHERE id = ?",
      [volunteerId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Volunteer not found" });
    }
    res.json({ message: "Volunteer approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error approving volunteer" });
  }
};

// Get all events (Admin)
const getAllEvents = async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events WHERE status = 'upcoming'");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: "Error fetching events" });
  }
};

// Get event details by event ID (Admin)
const getEventById = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await db.query("SELECT * FROM events WHERE id = ?", [eventId]);
    if (event.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching event" });
  }
};
const getVolunteerEvents = async (req, res) => {
  try {
    const events = await db.query("SELECT * FROM events WHERE status = 'upcoming'");
    res.json(events);
  } catch (error) {
    console.error("❌ Error fetching volunteer events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



module.exports = {
  addEvent,
  deleteEvent,
  approveVolunteer,
  getAllEvents,
  getEventById,
  getVolunteerEvents
};
