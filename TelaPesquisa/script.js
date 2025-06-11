function goBack() {
  window.history.back(); 
}

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.querySelector('.search-container input');
  const searchBtn = document.querySelector('.search-container img');

  function renderQuizzes(data) {
    const facilContainer = document.getElementById('facil-quizzes');
    const medioContainer = document.getElementById('medio-quizzes');
    const dificilContainer = document.getElementById('dificil-quizzes');
    if (!facilContainer || !medioContainer || !dificilContainer) return;
    facilContainer.innerHTML = '';
    medioContainer.innerHTML = '';
    dificilContainer.innerHTML = '';
    data.forEach(quiz => {
      const quizElement = document.createElement('div');
      quizElement.classList.add('quiz-item');
      quizElement.innerHTML = `<img src="${quiz.icone}" alt="Ícone do Quiz"> <span>${quiz.titulo}</span>`;
      quizElement.style.cursor = 'pointer';
      quizElement.onclick = () => {
        window.location.href = `/TelaQuestao/?id=${quiz.id}`;
      };
      switch (quiz.nivel) {
        case 'Fácil':
          facilContainer.appendChild(quizElement);
          break;
        case 'Médio':
          medioContainer.appendChild(quizElement);
          break;
        case 'Difícil':
          dificilContainer.appendChild(quizElement);
          break;
        default:
          facilContainer.appendChild(quizElement);
      }
    });
  }

  function buscarQuizzes(query) {
    const url = query
      ? `/api/quizzes/search?q=${encodeURIComponent(query)}`
      : '/api/quizzes';
    fetch(url)
      .then(res => res.json())
      .then(renderQuizzes)
      .catch(err => {
        console.error('Erro ao buscar quizzes:', err);
      });
  }

  // Evento ao clicar no ícone de pesquisa
  if (searchBtn && searchInput) {
    searchBtn.onclick = () => {
      buscarQuizzes(searchInput.value.trim());
    };
    // Também permite pesquisar ao pressionar Enter
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        buscarQuizzes(searchInput.value.trim());
      }
    });
  }
});

  // Carrega todos os quizzes inicialmente
  buscarQuizzes('');

  document.getElementById('btn-criar-fase').onclick = () => {
    window.location.href = '/TelaCriarQuiz/';
  };
  document.getElementById('btn-jogar').onclick = () => {
    window.location.href = '/TelaCodigoQuiz/';
  };
  document.getElementById('btn-perfil').onclick = () => {
    window.location.href = '/TelaPerfil/';
  };





