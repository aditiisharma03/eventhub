require("dotenv").config(); // Load environment variables

const express = require("express");
const cors = require("cors");
const db = require("./db"); // MySQL connection
const initDatabase = require("./models"); // Database initialization
const bcrypt = require("bcrypt");



// Import routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const studentRoutes = require("./routes/studentRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const eventsRoutes = require("./routes/eventsRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Debugging: Ensure .env variables are loaded
console.log("🛠️ DEBUG: Checking environment variables...");
console.log("DB_HOST:", process.env.DB_HOST ? "✅ Loaded" : "❌ MISSING");
console.log("DB_USER:", process.env.DB_USER ? "✅ Loaded" : "❌ MISSING");
console.log("DB_NAME:", process.env.DB_NAME ? "✅ Loaded" : "❌ MISSING");

if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
  console.error("❌ ERROR: Missing database configuration in .env file!");
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
const path = require("path");
app.use(express.static(path.join(__dirname, "../frontend"))); // Serve frontend files



// ✅ Initialize database tables
initDatabase()
  .then(() => console.log("✅ Database initialized successfully."))
  .catch((err) => console.error("❌ ERROR: Database initialization failed:", err));

// ✅ Test database connection
db.pool.getConnection()
  .then((connection) => {
    console.log("✅ Successfully connected to MySQL Database!");
    connection.release();
  })
  .catch((err) => {
    console.error("❌ ERROR: Database connection failed:", err);
    process.exit(1); // Exit if DB is unreachable
  });

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/events", eventsRoutes);

//  route
 
 

// 404 Not Found Handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError) {
    console.error("❌ ERROR: Invalid JSON received:", err);
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

