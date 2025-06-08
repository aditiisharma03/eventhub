const mysql = require("mysql2/promise");
require("dotenv").config(); // Load environment variables


// 🛠️ Debugging: Check if environment variables are loaded
console.log("🛠️ DEBUG: Checking environment variables...");
console.log("DB_HOST:", `"${process.env.DB_HOST}"`);
console.log("DB_USER:", `"${process.env.DB_USER}"`);
console.log("DB_NAME:", `"${process.env.DB_NAME}"`);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "✅ Loaded" : "❌ MISSING!");

// 🔹 Validate required environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  console.error("❌ ERROR: Missing database configuration in .env file!");
  process.exit(1);
}

// ✅ Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 50, //  
  queueLimit: 0,
  connectTimeout: 10000,  
});


// 🔍 Function to execute SQL queries safely
const query = async (sql, params = []) => {
  try {
    console.log("📝 Executing SQL:", sql);
    console.log("📌 With Parameters:", params);

    const [rows] = await pool.execute(sql, params); // ✅ Fix: Extract only `rows`
    return rows; // ✅ Return `rows`
  } catch (error) {
    console.error("❌ ERROR: SQL Execution Failed:", error.message);
    throw error;
  }
};

// ✅ Check database connection health
const checkDBConnection = async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection is active!");
  } catch (error) {
    console.error("❌ ERROR: Database health check failed:", error.message);
    process.exit(1); // Exit if DB is unreachable
  }
};

// 🚀 Establish connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Successfully connected to MySQL Database!");
    connection.release();
    await checkDBConnection(); // Run health check
  } catch (err) {
    console.error("❌ ERROR: Database connection failed:", err.message);
    process.exit(1);
  }
})();

// ⚠️ Graceful shutdown handling
process.on("SIGINT", async () => {
  console.log("⚠️ Closing database connection pool...");
  await pool.end();
  console.log("✅ Database pool closed. Exiting process.");
  process.exit(0);
});

// 🏁 Export query function and pool
module.exports = { query, pool };
