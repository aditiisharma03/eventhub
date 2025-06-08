const db = require("../db");

const createUserTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      BVroll VARCHAR(50) UNIQUE NOT NULL,
      role ENUM('admin', 'student', 'volunteer') NOT NULL DEFAULT 'student',
      class VARCHAR(50) NOT NULL,
      course VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await db.query(sql);
};

module.exports = { createUserTable };
