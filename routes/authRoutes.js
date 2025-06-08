const express = require("express");
const { register, login, forgotPassword, resetPassword} = require("../controllers/authController"); // Ensure the path is correct

const router = express.Router();

// POST route for registration
router.post("/register", register);

// POST route for login
router.post("/login", login);
 
module.exports = router;
