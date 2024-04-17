const express = require("express");
const { validate: uuidValidate } = require("uuid");
const userService = require("../services/userService");

const router = express.Router();

router.get("/user", (request, response) => {
  const { id, username } = request.query;
  if (id) {
    userService.getUserById(request, response);
    return;
  }

  if (username) {
    userService.getUserByUserName(request, response);
    return;
  }
});

router.post("/users", userService.getUsersByIds);

module.exports = router;
