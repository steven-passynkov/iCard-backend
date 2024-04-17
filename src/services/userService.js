const pool = require("../db/pool");

const getUserById = (request, response) => {
  const id = request.query.id;
  if (!uuidValidate(id)) {
    response.status(400).json({ error: "Invalid user ID" });
    return;
  }
  pool.query("SELECT * FROM users WHERE id = $1", [id], (error, results) => {
    if (error) {
      response.status(500).json({ error: "Failed to retrieve user" });
      return;
    }
    response.status(200).json(results.rows);
  });
};

const getUsersByIds = (request, response) => {
  const { ids } = request.body;
  pool.query(
    "SELECT * FROM users WHERE id = ANY($1::uuid[])",
    [ids],
    (error, results) => {
      if (error) {
        console.error("Error retrieving users:", error);
        response.status(500).json({ error: "Failed to retrieve users" });
        return;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getUserByUserName = (request, response) => {
  const username = request.query.username;
  pool.query(
    "SELECT * FROM users WHERE username = $1",
    [username],
    (error, results) => {
      if (error) {
        console.error("Error retrieving users:", error);
        response.status(500).json({ error: "Failed to retrieve users" });
        return;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = { getUserById, getUserByUserName, getUsersByIds };