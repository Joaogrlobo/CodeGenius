const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 8080;
const mysql = require('mysql2');
const db = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root', 
    password: 'L0l_bit!', 
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


