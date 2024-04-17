const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const userController = require("./controllers/userController");
const localUserController = require("./controllers/localUserController");
const { setupMessageListener } = require("./db/messages");
const { setupNotificationListener } = require("./db/notifications");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(userController);
app.use(localUserController);

setupMessageListener();
setupNotificationListener();

const server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;
  console.log(`Server listening at http://${host}:${port}`);
});
