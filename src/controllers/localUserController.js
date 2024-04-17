const express = require("express");
const localUserService = require("../services/localUserService");

const router = express.Router();

router.post("/localUsers", localUserService.getLocalUsers);

module.exports = router;