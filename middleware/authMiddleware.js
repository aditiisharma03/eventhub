const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);

    if (!verified.userId || !verified.role) { // ✅ Ensure token contains userId & role
      return res.status(403).json({ message: "Invalid token structure. Missing userId or role." });
    }

    req.user = verified; // ✅ Attach user object to req
    console.log("✅ JWT Verified:", verified);

    next();
  } catch (err) {
    console.error("❌ JWT Verification Failed:", err.message);
    res.status(403).json({ message: "Invalid or expired token." });
  }
};


module.exports = { verifyToken };
