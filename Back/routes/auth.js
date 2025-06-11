const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secreto'; 


router.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }
  try {
    const hash = await bcrypt.hash(senha, 10);
    await pool.execute(
      'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, hash]
    );
    res.status(201).json({ message: 'Usuário cadastrado!' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'E-mail já cadastrado!' });
    }
    res.status(400).json({ error: 'Erro ao cadastrar', details: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    if (!rows.length) return res.status(401).json({ error: 'Usuário não encontrado' });

    const usuario = rows[0];
    const match = await bcrypt.compare(senha, usuario.senha);
    if (!match) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: usuario.id, nome: usuario.nome }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email } });
  } catch (err) {
    res.status(500).json({ error: 'Erro no login', details: err.message });
  }
});


router.get('/usuario/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.execute(
      'SELECT id, nome, email FROM usuarios WHERE id = ?',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuário não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
  }
});

module.exports = router;