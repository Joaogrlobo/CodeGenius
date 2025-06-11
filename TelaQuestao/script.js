let currentQuestion = 0;
let perguntas = [];

function getQuizIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const quizId = getQuizIdFromUrl();

document.addEventListener('DOMContentLoaded', () => {
  const quizId = getQuizIdFromUrl();
  if (!quizId) {
    alert('Quiz não encontrado!');
    return;
  }
  fetch(`/api/pergunta/${quizId}`)
    .then(res => res.json())
    .then(data => {
      if (data.perguntas && data.perguntas.length > 0) {
        perguntas = data.perguntas;
        showQuestion();
      } else {
        alert('Nenhuma pergunta encontrada para este quiz.');
      }
    })
    .catch(err => {
      console.error('Erro ao buscar perguntas:', err);
      alert('Erro ao carregar quiz.');
    });
});

function showQuestion() {
  if (currentQuestion >= perguntas.length) {
    document.getElementById('pergunta').textContent = 'Quiz finalizado!';
    document.getElementById('respostas').innerHTML = '';

    
    const userId = localStorage.getItem('userId');
    const pontuacao = window.acertos || 0;
    fetch('/api/quizzes/resultado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: userId,
        quiz_id: getQuizIdFromUrl(),
        pontuacao: pontuacao,
        acertos: pontuacao
      })
    }).then(() => {
      setTimeout(() => {
        window.location.href = `/TelaRanking/?id=${getQuizIdFromUrl()}`;
      }, 1500);
    });

    return;
  }

  const pergunta = perguntas[currentQuestion];
  document.getElementById('pergunta').textContent = pergunta.enunciado;
  const respostasDiv = document.getElementById('respostas');
  respostasDiv.innerHTML = '';

  pergunta.respostas.forEach(resposta => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = resposta.texto;
    btn.onclick = () => checkAnswer(btn, resposta.correta);
    respostasDiv.appendChild(btn);
  });
}

function checkAnswer(button, isCorrect) {
  if (isCorrect) {
    button.classList.add("correct");
    alert("Resposta correta!");
    window.acertos = (window.acertos || 0) + 1;
  } else {
    button.classList.add("incorrect");
    alert("Resposta incorreta.");
  }
  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 500);
}