const { Pool } = require("pg");

const pool = new Pool({
    user: "",
    host: "",
    //host: "",
    database: "",
    password: "",
    dialect: "",
    port: ,
  });

module.exports = pool;