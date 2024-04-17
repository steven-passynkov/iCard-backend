const pool = require("./pool");

function setupMessageListener() {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }

    client.query("LISTEN user_messages_changed", (listenErr) => {
      if (listenErr) {
        release();
        return console.error("Error setting up messages listener", listenErr);
      }
      console.log("Listening for user messages changes...");
    });

    client.on("messages", (msg) => {
      console.log("Received messages:", msg.payload);

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

    client.on("error", (error) => {
      console.error("PostgreSQL error on this connection:", error);
    });
  });
}

module.exports = { setupMessageListener };
