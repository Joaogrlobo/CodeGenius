const quizRepository = require('../repositories/quizRepository');

async function createQuiz(titulo, nivel, tempo, criado_por, perguntas, iconPath) {
  // Validate user existence
  const userExists = await quizRepository.checkUserExists(criado_por);
  if (!userExists) {
    throw { status: 400, message: 'Usuário criador não existe.' };
  }

  const quizId = await quizRepository.insertQuiz(titulo, nivel, tempo, criado_por, iconPath);

  for (const pergunta of perguntas) {
    const perguntaId = await quizRepository.insertPergunta(quizId, pergunta.enunciado);
    for (const resposta of pergunta.respostas) {
      await quizRepository.insertResposta(perguntaId, resposta.texto, resposta.correta);
    }
  }
  return quizId;
}

async function listQuizzes() {
  return await quizRepository.getAllQuizzes();
}

async function searchQuizzes(query) {
  return await quizRepository.searchQuizzesByTitle(query);
}

async function deleteQuiz(id) {
  await quizRepository.deleteQuizById(id);
}

async function saveResultado(usuario_id, quiz_id, pontuacao, acertos) {
  await quizRepository.insertResultado(usuario_id, quiz_id, pontuacao, acertos);
}

async function getRanking() {
  return await quizRepository.getTopRanking();
}

async function getQuizById(id) {
  const quiz = await quizRepository.findQuizById(id);
  if (!quiz) {
    throw { status: 404, message: 'Quiz não encontrado' };
  }
  return quiz;
}

module.exports = {
  createQuiz,
  listQuizzes,
  searchQuizzes,
  deleteQuiz,
  saveResultado,
  getRanking,
  getQuizById
};
