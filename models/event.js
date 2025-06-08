const db = require("../db");

const createEventTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      date DATE NOT NULL,
      location VARCHAR(255) NOT NULL,
      max_seats INT NOT NULL,
      available_seats INT NOT NULL,
      status ENUM('upcoming', 'past') DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await db.query(sql);
};

module.exports = { createEventTable };
