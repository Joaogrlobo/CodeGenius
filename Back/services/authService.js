const authRepository = require('../repositories/authRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'secreto';

async function registerUser(nome, email, senha) {
  if (!nome || !email || !senha) {
    throw { status: 400, message: 'Preencha todos os campos!' };
  }
  const hash = await bcrypt.hash(senha, 10);
  try {
    await authRepository.insertUser(nome, email, hash);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw { status: 400, message: 'E-mail já cadastrado!' };
    }
    throw { status: 400, message: 'Erro ao cadastrar', details: err.message };
  }
}

async function loginUser(email, senha) {
  const user = await authRepository.findUserByEmail(email);
  if (!user) {
    throw { status: 401, message: 'Usuário não encontrado' };
  }
  const match = await bcrypt.compare(senha, user.senha);
  if (!match) {
    throw { status: 401, message: 'Senha incorreta' };
  }
  const token = jwt.sign({ id: user.id, nome: user.nome }, JWT_SECRET, { expiresIn: '1d' });
  return { token, usuario: { id: user.id, nome: user.nome, email: user.email } };
}

async function getUserById(id) {
  const user = await authRepository.findUserById(id);
  if (!user) {
    throw { status: 404, message: 'Usuário não encontrado' };
  }
  return user;
}

module.exports = {
  registerUser,
  loginUser,
  getUserById
};
