const pool = require("./pool");

function setupNotificationListener() {
  pool.connect((err, client, release) => {
    if (err) {
      return console.error("Error acquiring client", err.stack);
    }

    client.query("LISTEN user_notifications_changed", (listenErr) => {
      if (listenErr) {
        release();
        return console.error(
          "Error setting up notification listener",
          listenErr
        );
      }
      console.log("Listening for user notifications changes...");
    });

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

    client.on("error", (error) => {
      console.error("PostgreSQL error on this connection:", error);
    });
  });
}

module.exports = { setupNotificationListener };
