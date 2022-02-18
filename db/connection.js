const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Blad3Strong77',
  database: 'employees'
});




module.exports = db;