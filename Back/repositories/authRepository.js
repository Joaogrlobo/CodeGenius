const pool = require('../db');

async function insertUser(nome, email, senha) {
  await pool.execute(
    'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
    [nome, email, senha]
  );
}

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT * FROM usuarios WHERE email = ?',
    [email]
  );
  return rows[0];
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, nome, email FROM usuarios WHERE id = ?',
    [id]
  );
  return rows[0];
}

module.exports = {
  insertUser,
  findUserByEmail,
  findUserById
};
