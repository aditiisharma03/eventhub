const { createUserTable } = require("./User");
const { createEventTable } = require("./Event");
const { createVolunteerTable } = require("./volunteer");
const { createTaskTable } = require("./Task");
const { createRegistrationTable } = require("./Registration");

const initDatabase = async () => {
  try {
    await createUserTable();
    await createEventTable();
    await createVolunteerTable();
    await createTaskTable();
    await createRegistrationTable();
    console.log("All tables created successfully.");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
};

module.exports = initDatabase;
