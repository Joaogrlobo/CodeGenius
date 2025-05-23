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
    res.status(201).json({ message: 'Quiz criado!' });
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


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('DELETE FROM quizzes WHERE id = ?', [id]);
    res.json({ message: 'Quiz deletado!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar quiz' });
  }
});

module.exports = router;