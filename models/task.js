const db = require("../db");

const createTaskTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      volunteer_id INT NOT NULL,
      description TEXT NOT NULL,
      deadline DATETIME NOT NULL,
      status ENUM('pending', 'completed') DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await db.query(sql);
};

module.exports = { createTaskTable };
