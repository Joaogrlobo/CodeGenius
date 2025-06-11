const pool = require('../db');

async function checkUserExists(userId) {
  const [rows] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [userId]);
  return rows.length > 0;
}

async function insertQuiz(titulo, nivel, tempo, criado_por, iconPath) {
  const [result] = await pool.execute(
    'INSERT INTO quizzes (titulo, nivel, tempo, criado_por, icone) VALUES (?, ?, ?, ?, ?)',
    [titulo, nivel, tempo, criado_por, iconPath]
  );
  return result.insertId;
}

async function insertPergunta(quizId, enunciado) {
  const [result] = await pool.execute(
    'INSERT INTO perguntas (quiz_id, enunciado) VALUES (?, ?)',
    [quizId, enunciado]
  );
  return result.insertId;
}

async function insertResposta(perguntaId, texto, correta) {
  await pool.execute(
    'INSERT INTO respostas (pergunta_id, texto, correta) VALUES (?, ?, ?)',
    [perguntaId, texto, correta]
  );
}

async function getAllQuizzes() {
  const [rows] = await pool.execute('SELECT * FROM quizzes');
  return rows;
}

async function searchQuizzesByTitle(query) {
  const [rows] = await pool.execute(
    'SELECT * FROM quizzes WHERE titulo LIKE ?',
    [`%${query}%`]
  );
  return rows;
}

async function deleteQuizById(id) {
  await pool.execute('DELETE FROM quizzes WHERE id = ?', [id]);
}

async function insertResultado(usuario_id, quiz_id, pontuacao, acertos) {
  await pool.execute(
    'INSERT INTO resultados (usuario_id, quiz_id, pontuacao, acertos) VALUES (?, ?, ?, ?)',
    [usuario_id, quiz_id, pontuacao, acertos]
  );
}

async function getTopRanking() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nome, MAX(r.pontuacao) as pontuacao
     FROM resultados r
     JOIN usuarios u ON r.usuario_id = u.id
     GROUP BY u.id
     HAVING pontuacao > 0
     ORDER BY pontuacao DESC
     LIMIT 10`
  );
  return rows;
}

async function findQuizById(id) {
  const [rows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [id]);
  return rows[0];
}

module.exports = {
  checkUserExists,
  insertQuiz,
  insertPergunta,
  insertResposta,
  getAllQuizzes,
  searchQuizzesByTitle,
  deleteQuizById,
  insertResultado,
  getTopRanking,
  findQuizById
};
