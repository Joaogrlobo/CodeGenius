const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


router.post('/', upload.single('quizIcon'), async (req, res) => {
  const { titulo, nivel, tempo, criado_por } = req.body;
  let perguntas = [];
  try {
    perguntas = JSON.parse(req.body.perguntas);
  } catch (e) {
    return res.status(400).json({ error: 'Formato de perguntas inválido.' });
  }
  const iconPath = req.file ? '/uploads/' + req.file.filename : null;

  // Validação: usuário existe?
  const [usuarios] = await pool.execute('SELECT id FROM usuarios WHERE id = ?', [criado_por]);
  if (usuarios.length === 0) {
    return res.status(400).json({ error: 'Usuário criador não existe.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [quizResult] = await conn.execute(
      'INSERT INTO quizzes (titulo, nivel, tempo, criado_por, icone) VALUES (?, ?, ?, ?, ?)',
      [titulo, nivel, tempo, criado_por, iconPath]
    );
    const quizId = quizResult.insertId;

    for (const pergunta of perguntas) {
      const [perguntaResult] = await conn.execute(
        'INSERT INTO perguntas (quiz_id, enunciado) VALUES (?, ?)',
        [quizId, pergunta.enunciado]
      );
      const perguntaId = perguntaResult.insertId;
      for (const resposta of pergunta.respostas) {
        await conn.execute(
          'INSERT INTO respostas (pergunta_id, texto, correta) VALUES (?, ?, ?)',
          [perguntaId, resposta.texto, resposta.correta]
        );
      }
    }
    await conn.commit();
    res.status(201).json({ message: 'Quiz criado!', quizId });
  } catch (err) {
    await conn.rollback();
    console.error(err); 
    res.status(500).json({ error: 'Erro ao criar quiz', details: err.message });
  } finally {
    conn.release();
  }
});


router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM quizzes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao listar quizzes' });
  }
});


router.get('/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Parâmetro de busca não informado.' });
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM quizzes WHERE titulo LIKE ?",
      [`%${q}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar quizzes' });
  }
});


router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Exemplo: pegue o id do usuário autenticado (via sessão, token, etc)
    // const usuarioId = req.usuario.id;
    // Aqui, só como exemplo, não está implementado autenticação:
    try {
        // Primeiro, busque o quiz
        const [rows] = await pool.execute('SELECT criado_por FROM quizzes WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Quiz não encontrado' });

        // Se quiser checar o criador, faça aqui (exemplo):
        // if (rows[0].criado_por !== usuarioId) return res.status(403).json({ error: 'Sem permissão' });

        await pool.execute('DELETE FROM quizzes WHERE id = ?', [id]);
        res.json({ message: 'Quiz deletado!' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar quiz' });
    }
});


router.post('/resultado', async (req, res) => {
  const { usuario_id, quiz_id, pontuacao, acertos } = req.body;
  try {
    await pool.execute(
      'INSERT INTO resultados (usuario_id, quiz_id, pontuacao, acertos) VALUES (?, ?, ?, ?)',
      [usuario_id, quiz_id, pontuacao, acertos]
    );
    res.status(201).json({ message: 'Resultado salvo com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao salvar resultado', details: err.message });
  }
});


router.get('/ranking', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.nome, MAX(r.pontuacao) as pontuacao
       FROM resultados r
       JOIN usuarios u ON r.usuario_id = u.id
       GROUP BY u.id
       HAVING pontuacao > 0
       ORDER BY pontuacao DESC
       LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ranking', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.execute('SELECT * FROM quizzes WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Quiz não encontrado' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar quiz' });
    }
});

module.exports = router;