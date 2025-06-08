const db = require("../db");
const sendEmail = require("../utils/sendEmail");

const addEvent = async (req, res) => {
  const { title, description, date, location, max_seats } = req.body;
  if (!title || !description || !date || !location || !max_seats) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const query = "INSERT INTO events (title, description, date, location, max_seats, available_seats, status, created_at) VALUES (?, ?, ?, ?, ?, ?, 'upcoming', NOW())";
    await db.query(query, [title, description, date, location, max_seats, max_seats]);
    res.status(201).json({ message: "✅ Event added successfully!" });
  } catch (error) {
    console.error("❌ Error adding event:", error);
    res.status(500).json({ message: "Server error while adding event", error });
  }
};
 
const deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  if (!eventId) {
    return res.status(400).json({ message: "❌ Event ID is required." });
  }

  try {
    console.log(`🗑️ Deleting event with ID: ${eventId}`);

    const query = "DELETE FROM events WHERE id = ?";
    
    // ✅ Execute DELETE query
    const result = await db.query(query, [eventId]);

    // ✅ Fix: Ensure proper result structure
    const deleteResult = Array.isArray(result) ? result[0] : result;

    console.log("📌 Query Result:", deleteResult);

    if (!deleteResult || typeof deleteResult.affectedRows === "undefined") {
      throw new Error("Unexpected database response format.");
    }

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: "❌ Event not found" });
    }

    res.json({ message: "✅ Event successfully deleted." });
  } catch (error) {
    console.error("❌ Error deleting event:", error);

    res.status(500).json({ 
      message: "Server error while deleting event", 
      error: error.message || error 
    });
  }
};


const approveVolunteer = async (req, res) => {
  const { user_id } = req.body;  // Ensure frontend sends 'user_id'
  
  if (!user_id) {
      return res.status(400).json({ message: "❌ user_id is required" });
  }

  try {
      console.log("🔍 Received user_id:", user_id);

      // Fetch volunteer request
      const [volunteerRows] = await db.query("SELECT id FROM volunteers WHERE user_id = ?", [user_id]);

      console.log("🟢 Volunteer Query Result:", volunteerRows); // Debugging

      if (volunteerRows.length === 0) {
          return res.status(404).json({ message: "❌ Volunteer request not found for this user" });
      }

      // Approve volunteer
      await db.query("UPDATE volunteers SET status = 'approved' WHERE user_id = ?", [user_id]);

      console.log("🔍 Checking user details for user_id:", user_id);

      // Fetch user email & name
      const userRows = await db.query("SELECT email, name FROM users WHERE id = ? LIMIT 1", [user_id]);

      console.log("🟢 Raw User Query Result:", userRows);
      console.log("🟢 Type of userRows:", typeof userRows);
      console.log("🟢 Is userRows an array?", Array.isArray(userRows));

      // Ensure it's an array before destructuring
      if (!Array.isArray(userRows) || userRows.length === 0) {
          return res.status(404).json({ message: "❌ User email not found" });
      }

      const { email, name } = userRows[0]; // Now safe to destructure

      console.log(`📧 Sending approval email to: ${email}`);

      // Send email notification
      const subject = "Volunteer Approval Notification";
      const message = `Dear ${name},\n\nCongratulations! Your volunteer request has been approved.\nCollege Event Hub Team`;

      await sendEmail(email, subject, message);

      res.json({ message: "✅ Volunteer approved successfully!" });

  } catch (error) {
      console.error("❌ Error approving volunteer:", error);
      res.status(500).json({ message: "Server error while approving volunteer", error: error.message });
  }
};

 

const getStudentRegistrations = async (req, res) => {
  try {
      console.log("🔹 Fetching student registrations...");

      // Fetch data from the database
      const result = await db.query(`
          SELECT 
              e.title AS event_name, 
              u.name AS student_name, 
              u.class, 
              u.course, 
              u.BVroll AS roll_number
          FROM registrations r
          JOIN events e ON r.event_id = e.id
          JOIN users u ON r.user_id = u.id
      `);

      console.log("✅ Raw SQL Query Result:", result);
      console.log("✅ Type of result:", typeof result);

      // Ensure result is an array
      const rows = Array.isArray(result[0]) ? result[0] : result;

      console.log("📤 Sending Response (Length):", rows.length);
      console.log("📤 Sending Response (Data):", JSON.stringify(rows, null, 2));

      if (!rows || rows.length === 0) {
          return res.status(404).json({ message: "No student registrations found." });
      }

      res.json(rows);
  } catch (error) {
      console.error("❌ Internal Server Error:", error.stack);
      res.status(500).json({ error: error.message });
  }
};




const getVolunteerRequests = async (req, res) => {
  try {
    console.log("🔍 Route hit: /api/admin/volunteers/requests");

    const sqlQuery = `
    SELECT u.id, u.name, u.email, u.BVroll,e.title AS event_name
    FROM volunteers v
    JOIN users u ON v.user_id = u.id
    JOIN events e ON v.event_id = e.id
    WHERE v.status = 'pending'
  `;
  

    const rows = await db.query(sqlQuery); // ❌ Fix: Remove the destructuring `[rows]`

    console.log("🔍 Raw Query Result:", JSON.stringify(rows, null, 2));

    if (!rows || rows.length === 0) {
      console.log("❌ No pending volunteers found.");
      return res.status(404).json({ message: "No pending volunteer requests found." });
    }

    return res.json(rows); // ✅ Now sends all pending requests correctly
  } catch (error) {
    console.error("❌ Server error while fetching volunteers:", error);
    return res.status(500).json({ message: "Server error while fetching volunteers", error: error.message });
  }
};

const getApprovedVolunteers = async (req, res) => {
  try {
    console.log("🔍 Fetching approved volunteers...");

    const query = `
      SELECT v.id AS volunteer_id, u.name, u.email, e.title AS event_name, v.event_id
      FROM volunteers v
      JOIN users u ON v.user_id = u.id
      JOIN events e ON v.event_id = e.id
      WHERE v.status = 'approved';
    `;

    const result = await db.query(query);
    console.log("🟢 Raw Query Result:", result);

    // Ensure the correct array format
    const rows = Array.isArray(result[0]) ? result[0] : result;
    console.log("🟢 Processed Rows:", rows);

    if (!Array.isArray(rows) || rows.length === 0) {
      console.log("❌ No approved volunteers found.");
      return res.status(404).json({ message: "No approved volunteers found." });
    }

    console.log("✅ Approved Volunteers Found:", rows);
    res.json(rows);

  } catch (error) {
    console.error("❌ Error fetching approved volunteers:", error);
    res.status(500).json({ message: "Server error while fetching approved volunteers" });
  }
};

const getEventRegistrations = async (req, res) => {
  try {
    console.log("🔍 Fetching all event registrations...");

    const query = `
      SELECT 
        r.id AS registration_id, 
        u.name, 
        u.class, 
        u.course, 
        u.BVroll AS roll_number, 
        e.title AS event_name 
      FROM registrations r
      JOIN users u ON r.user_id = u.id
      JOIN events e ON r.event_id = e.id;
    `;

    const [rows] = await db.query(query);

    console.log("✅ All Registered Students:", JSON.stringify(rows, null, 2));

    if (!rows || rows.length === 0) {
      return res.status(404).json({ message: "❌ No students have registered for any events." });
    }

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching event registrations:", error);
    res.status(500).json({ message: "Server error while fetching registrations", error });
  }
};


// Exporting getStudentRegistrations
module.exports = {
  addEvent,
  deleteEvent,
  approveVolunteer,
  getStudentRegistrations, 
  getVolunteerRequests,
  getApprovedVolunteers,
  getEventRegistrations
};
