 const db = require("../db");

 const applyForVolunteer = async (req, res) => {
  try {
      const userId = req.user?.userId; // Safe check for undefined
      const { eventId } = req.body;

      console.log("🔹 Received body:", req.body);
      console.log("🔹 User ID:", userId);

      if (!userId || !eventId) {
          return res.status(400).json({ message: "User ID and Event ID are required." });
      }

      // Check if the event exists
      const [eventRows] = await db.query("SELECT id FROM events WHERE id = ?", [eventId]);
      if (!eventRows || eventRows.length === 0) {
          return res.status(404).json({ message: "Event not found." });
      }

      // Check if the user already applied
      const [existingApplicationRows] = await db.query(
          "SELECT * FROM volunteers WHERE user_id = ? AND event_id = ?",
          [userId, eventId]
      );

      if (existingApplicationRows && existingApplicationRows.length > 0) {
          return res.status(400).json({ message: "You have already applied as a volunteer for this event." });
      }

      // Insert volunteer application
      await db.query("INSERT INTO volunteers (user_id, event_id, status) VALUES (?, ?, 'pending')", [userId, eventId]);

      res.status(201).json({ message: "Applied as a volunteer successfully!" });
  } catch (error) {
      console.error("❌ Error applying as volunteer:", error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getTasks = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const [tasks] = await db.query("SELECT * FROM tasks WHERE volunteer_id = ?", [volunteerId]);

    res.json(tasks);
  } catch (error) {
    console.error("❌ Error fetching tasks:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await db.query("UPDATE tasks SET status = 'completed' WHERE id = ?", [taskId]);

    res.json({ message: "✅ Task marked as completed!" });
  } catch (error) {
    console.error("❌ Error completing task:", error);
    res.status(500).json({ message: "Server error", error });
  }
};


const getAppliedVolunteerEvents = async (req, res) => {
  try {
    const userId = req.user?.userId; // Ensure userId is defined
    console.log("🔹 Debug: userId =", userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const query = `
      SELECT 
        v.user_id, 
        e.id AS event_id, 
        e.title AS event_name, 
        v.created_at AS applied_at, 
        v.status
      FROM volunteers v
      JOIN events e ON v.event_id = e.id
      WHERE v.user_id = ?
      ORDER BY v.created_at DESC
    `;

    const applications = await db.query(query, [userId]);  // Remove array destructuring

    console.log("🔹 Debug: applications =", applications);

    // Check if the response is an array
    if (!Array.isArray(applications)) {
      return res.status(500).json({ message: "Unexpected database response format", data: applications });
    }

    if (applications.length === 0) {
      return res.json({ message: "No volunteer applications found.", data: [] });
    }

    res.json({ data: applications }); // Ensure response is an array
  } catch (error) {
    console.error("❌ Error fetching applied volunteer events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



module.exports = { applyForVolunteer, getTasks, completeTask, getAppliedVolunteerEvents };
