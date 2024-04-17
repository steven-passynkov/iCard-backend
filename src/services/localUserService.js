const pool = require("../db/pool");

const getLocalUsers = (request, response) => {
  const { latitude, longitude } = request.body;

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || isNaN(lon)) {
    response.status(400).json({ error: "Invalid latitude or longitude" });
    return;
  }

  pool.query(
    "SELECT * FROM users WHERE (latitude - $1) <= 1 AND (latitude - $1) >= 0  AND (longitude - $2) <= 1 AND (longitude - $2) >= 0",
    [lat, lon],
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

module.exports = { getLocalUsers };
