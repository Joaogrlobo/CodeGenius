const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'L0l_bit!',
  database: 'CodeGenius'
});

module.exports = pool;