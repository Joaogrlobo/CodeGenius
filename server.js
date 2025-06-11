const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8080;
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', 
    password: '12345678', 
    database: 'CodeGenius'
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao MySQL:', err);
    } else {
        console.log('Conectado ao MySQL');
    }
});

app.use(cors());
app.use(express.json());

app.use('/TelaCodigoQuiz', express.static(path.join(__dirname, 'TelaCodigoQuiz')));
app.use('/TelaCriarQuiz', express.static(path.join(__dirname, 'TelaCriarQuiz')));
app.use('/TelaEdicao_DeletarQuiz', express.static(path.join(__dirname, 'TelaEdicao_DeletarQuiz')));
app.use('/TelaLogin/Cadastro', express.static(path.join(__dirname, 'TelaLogin/Cadastro')));
app.use('/TelaPaginaInicial', express.static(path.join(__dirname, 'TelaPaginaInicial')));
app.use('/TelaPerfil', express.static(path.join(__dirname, 'TelaPerfil')));
app.use('/TelaPesquisa', express.static(path.join(__dirname, 'TelaPesquisa')));
app.use('/TelaQuestao', express.static(path.join(__dirname, 'TelaQuestao')));
app.use('/TelaRanking', express.static(path.join(__dirname, 'TelaRanking')));
app.use('/TelaVizualizarQuiz', express.static(path.join(__dirname, 'TelaVizualizarQuiz')));


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'TelaLogin','Cadastro', 'index.html'));
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

app.use('/api/auth', require('./Back/routes/auth'));
app.use('/api/quizzes', require('./Back/routes/quiz'));


app.get('/api/pergunta/:quizId', async (req, res) => {
    const quizId = req.params.quizId;
    try {
        const [rows] = await db.promise().query(
            `SELECT p.id as pergunta_id, p.enunciado, r.id as resposta_id, r.texto, r.correta
             FROM perguntas p
             JOIN respostas r ON p.id = r.pergunta_id
             WHERE p.quiz_id = ?
             ORDER BY p.id, r.id`, [quizId]
        );

        
        const perguntasMap = {};
        rows.forEach(row => {
            if (!perguntasMap[row.pergunta_id]) {
                perguntasMap[row.pergunta_id] = {
                    enunciado: row.enunciado,
                    respostas: []
                };
            }
            perguntasMap[row.pergunta_id].respostas.push({
                texto: row.texto,
                correta: !!row.correta
            });
        });

        
        const perguntas = Object.values(perguntasMap).slice(0, 4);

        res.json({ perguntas });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar perguntas', details: err.message });
        console.error(err);
    }
});

app.get('/api/usuario/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.promise().query('SELECT nome FROM usuarios WHERE id = ?', [userId]);
    if (rows.length > 0) {
      res.json({ nome: rows[0].nome });
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
});

app.get('/api/usuario/:id/quizzes', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.promise().query(
      `SELECT q.id, q.titulo, q.nivel, q.icone, r.pontuacao, r.data_execucao
       FROM resultados r
       JOIN quizzes q ON r.quiz_id = q.id
       WHERE r.usuario_id = ?
       ORDER BY r.data_execucao DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar quizzes do usuário', details: err.message });
  }
});

app.get('/api/quizzes/:quizId/ranking', async (req, res) => {
  const quizId = req.params.quizId;
  try {
    const [rows] = await db.promise().query(
      `SELECT u.id, u.nome, MAX(r.acertos) as acertos
       FROM resultados r
       JOIN usuarios u ON r.usuario_id = u.id
       WHERE r.quiz_id = ?
       GROUP BY u.id, u.nome
       ORDER BY acertos DESC`,
      [quizId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar ranking do quiz', details: err.message });
  }
});

app.post('/api/quizzes/resultado', async (req, res) => {
  const { usuario_id, quiz_id, pontuacao, acertos } = req.body;
  try {
    await db.promise().query(
      'INSERT INTO resultados (usuario_id, quiz_id, pontuacao, acertos) VALUES (?, ?, ?, ?)',
      [usuario_id, quiz_id, pontuacao, acertos]
    );
    res.status(201).json({ message: 'Resultado salvo com sucesso!' });
  } catch (err) {
    console.error('Erro ao salvar resultado:', err); 
    res.status(500).json({ error: 'Erro ao salvar resultado', details: err.message });
  }
});


app.get('/api/usuario/:id/criados', async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await db.promise().query(
      'SELECT * FROM quizzes WHERE criado_por = ? ORDER BY criado_em DESC',
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar quizzes criados', details: err.message });
  }
});


app.put('/api/quizzes/:id', async (req, res) => {
  const quizId = req.params.id;
  const { titulo, nivel, tempo, criado_por, perguntas } = req.body;

  try {
    
    const [quizRows] = await db.promise().query(
      'SELECT criado_por FROM quizzes WHERE id = ?', [quizId]
    );
    if (!quizRows.length || String(quizRows[0].criado_por) !== String(criado_por)) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este quiz.' });
    }

    
    await db.promise().query(
      'UPDATE quizzes SET titulo = ?, nivel = ?, tempo = ? WHERE id = ?',
      [titulo, nivel, tempo, quizId]
    );

   
    const [perguntasRows] = await db.promise().query(
      'SELECT id FROM perguntas WHERE quiz_id = ?', [quizId]
    );
    for (const p of perguntasRows) {
      await db.promise().query('DELETE FROM respostas WHERE pergunta_id = ?', [p.id]);
    }
    await db.promise().query('DELETE FROM perguntas WHERE quiz_id = ?', [quizId]);

    
    for (const pergunta of perguntas) {
      const [perguntaResult] = await db.promise().query(
        'INSERT INTO perguntas (quiz_id, enunciado) VALUES (?, ?)',
         [quizId, pergunta.enunciado]
      );
      const perguntaId = perguntaResult.insertId;
      for (const resposta of pergunta.respostas) {
        await db.promise().query(
          'INSERT INTO respostas (pergunta_id, texto, correta) VALUES (?, ?, ?)',
          [perguntaId, resposta.texto, resposta.correta ? 1 : 0]
        );
      }
    }

    res.json({ message: 'Quiz atualizado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar quiz', details: err.message });
  }
});


app.delete('/api/quizzes/:id', async (req, res) => {
  const quizId = req.params.id;
  const { criado_por } = req.body;
  try {
    
    const [quizRows] = await db.promise().query(
      'SELECT criado_por FROM quizzes WHERE id = ?', [quizId]
    );
    if (!quizRows.length || String(quizRows[0].criado_por) !== String(criado_por)) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar este quiz.' });
    }

    
    const [perguntasRows] = await db.promise().query(
      'SELECT id FROM perguntas WHERE quiz_id = ?', [quizId]
    );
    for (const p of perguntasRows) {
      await db.promise().query('DELETE FROM respostas WHERE pergunta_id = ?', [p.id]);
    }
    await db.promise().query('DELETE FROM perguntas WHERE quiz_id = ?', [quizId]);
    await db.promise().query('DELETE FROM quizzes WHERE id = ?', [quizId]);

    res.json({ message: 'Quiz deletado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao deletar quiz', details: err.message });
  }
});

app.get('/api/quizzes/search', async (req, res) => {
  const query = req.query.q || '';
  try {
    const [rows] = await db.promise().query(
      'SELECT id, titulo, nivel, icone FROM quizzes WHERE titulo LIKE ?',
      [`%${query}%`]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar quizzes', details: err.message });
  }
});


