let currentQuestion = 0;
let perguntas = [];

function getQuizIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

const quizId = getQuizIdFromUrl();

document.addEventListener('DOMContentLoaded', () => {
  if (!quizId) {
    document.getElementById('pergunta').textContent = 'Quiz não encontrado.';
    return;
  }
  fetch(`/api/pergunta/${quizId}`)
    .then(res => res.json())
    .then(data => {
      perguntas = data.perguntas || [data];
      showQuestion();
    })
    .catch(err => {
      document.getElementById('pergunta').textContent = 'Erro ao carregar pergunta.';
      console.error('Erro ao buscar pergunta:', err);
    });
});

function showQuestion() {
  
  if (currentQuestion >= 4 || currentQuestion >= perguntas.length) {
    document.getElementById('pergunta').textContent = 'Quiz finalizado!';
    document.getElementById('respostas').innerHTML = '';
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
  } else {
    button.classList.add("incorrect");
    alert("Resposta incorreta.");
  }
  setTimeout(() => {
    currentQuestion++;
    showQuestion();
  }, 500);
}
