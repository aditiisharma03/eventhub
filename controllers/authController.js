const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const crypto = require("crypto");  
const nodemailer = require("nodemailer");   

dotenv.config();

const register = async (req, res) => {
  try {
    const { bvroll, name, class: studentClass, course, email, password, role } = req.body;

    console.log("🔍 Incoming Registration Data:", req.body); // Debug log

    // ✅ Check if any field is missing
    if (!bvroll || !name || !studentClass || !course || !email || !password || !role) {
      console.error("❌ ERROR: Missing required fields!");
      return res.status(400).json({ error: "All fields are required!" });
    }

    // ✅ Validate BV Roll (exactly 7 digits)
    const bvRollPattern = /^\d{7}$/;
    if (!bvRollPattern.test(bvroll)) {
      return res.status(400).json({ error: "BV Roll must be exactly 7 digits" });
    }

    // ✅ Validate Name (only letters and spaces)
    const namePattern = /^[A-Za-z\s]+$/;
    if (!namePattern.test(name)) {
      return res.status(400).json({ error: "Name can only contain letters and spaces" });
    }

    // ✅ Validate Email (must end with @gmail.com or @banasthali.in)
const emailPattern = /^[a-zA-Z0-9._%+-]+@(gmail\.com|banasthali\.in)$/;
if (!emailPattern.test(email)) {
  return res.status(400).json({ error: "Email must end with @gmail.com or @banasthali.in" });
}

    // ✅ Check if email is already registered
    const existingUser = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user into the database
    await db.query(
      "INSERT INTO users (bvroll, name, class, course, email, password, role) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [bvroll, name, studentClass, course, email, hashedPassword, role]
    );

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


const login = async (req, res) => {
  try {
    console.log("🔍 Incoming Login Data:", req.body); // Debugging

    const { bvroll, password, role } = req.body;

    if (!bvroll || !password) {
      return res.status(400).json({ error: "Both BV Roll and password are required." });
    }

    const users = await db.query("SELECT * FROM users WHERE bvroll = ?", [bvroll]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid BV Roll or Password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid BV Roll or Password!" });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: "Role mismatch! Please select the correct role." });
    }

    const token = jwt.sign(
      {
        userId: user.id,  
        role: user.role, 
        bvroll: user.bvroll
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // ✅ Include userId in the response for the frontend
    res.status(200).json({ 
      message: "Login successful!", 
      token, 
      role: user.role,
      userId: user.id // ✅ Fix: Add userId here
    });

  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 
module.exports = { login, register };
