const express = require("express");
const app = express();
const Pool = require("pg").Pool;
const cors = require("cors");
const { validate: uuidValidate } = require("uuid");

const pool = new Pool({
  user: "",
  host: "",
  //host: """,
  database: "",
  password: "",
  dialect: "",
  port: ,
});

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());

// Connect to PostgreSQL and set up notification listener
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }

  // Listen for notifications on the "user_notifications_changed" channel
  client.query("LISTEN user_notifications_changed", (listenErr) => {
    if (listenErr) {
      release(); // Release the client connection in case of an error
      return console.error("Error setting up notification listener", listenErr);
    }
    console.log("Listening for user notifications changes...");
  });

  // Handle incoming notifications
  client.on("notification", (msg) => {
    console.log("Received notification:", msg.payload);

    pool.query(
      "SELECT * FROM users WHERE id = $1::uuid",
      [msg.payload],
      (error, results) => {
        if (error) {
          console.error("Error retrieving user:", error);
          console.log("Failed to retrieve user");
          return;
        }
        if (results.rows.length === 0) {
          console.log("User not found");
          return;
        }
        console.log(results.rows[0]);
      }
    );
  });

  // Handle connection errors
  client.on("error", (error) => {
    console.error("PostgreSQL error on this connection:", error);
    // You can decide whether to continue using this connection or not
  });

  // Release the client connection when done
  release();
});

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

app.get("/user", (request, response) => {
  const { id, username } = request.query;
  if (id) {
    getUserById(request, response);
    return;
  }

  if (username) {
    getUserByUserName(request, response);
    return;
  }
});

app.post("/users", getUsersByIds);

app.post("/localUsers", getLocalUsers);

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Server listening at http://${host}:${port}`);
});
