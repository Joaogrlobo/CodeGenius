document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = "/TelaLogin/Cadastro/index.html";
        return;
    }

    document.getElementById('btn-criar-fase').onclick = () => {
        window.location.href = '/TelaCriarQuiz/';
    };
    document.getElementById('btn-jogar').onclick = () => {
        window.location.href = '/TelaCodigoQuiz/';
    };
    document.getElementById('btn-perfil').onclick = () => {
        window.location.href = '/TelaPerfil/';
    };

    const lupa = document.querySelector('.search-icon');
    if (lupa) {
        lupa.onclick = () => {
            window.location.href = '/TelaPesquisa/';
        };
    }

    fetch('/api/quizzes')
      .then(res => res.json())
      .then(data => {
        const container = document.querySelector('.icons');
        container.innerHTML = '';
        data.forEach(quiz => {
          const img = document.createElement('img');
          img.src = quiz.icone;
          img.alt = quiz.titulo;
          img.style.cursor = 'pointer';
          img.onclick = () => {
            window.location.href = `/TelaQuestao/?id=${quiz.id}`;
          };
          container.appendChild(img);
        });
      });
});