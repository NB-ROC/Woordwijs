const mysql = require("mysql2");

const connection = mysql.createPool({
  host: "localhost",
  user: "root",      
  password: "",      
  database: "woordwijs"
});

module.exports = connection;
