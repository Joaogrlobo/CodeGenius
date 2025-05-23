document.addEventListener('DOMContentLoaded', () => {
  const seta = document.querySelector('.back-arrow');
  if (seta) {
      seta.onclick = () => {
          window.history.back();
      };
  }

  fetch('/api/quizzes')
    .then(res => res.json())
    .then(data => {
      const lista = document.getElementById('lista-quizzes');
      if (!lista) return;
      lista.innerHTML = '';
      data.forEach(quiz => {
        const li = document.createElement('li');
        li.innerHTML = `<img src="${quiz.icone}" alt="Ícone do Quiz"> ${quiz.titulo} (${quiz.nivel})`;
        lista.appendChild(li);
      });
    })
    .catch(err => {
      console.error('Erro ao buscar quizzes:', err);
    });

  document.getElementById('btn-criar-fase').onclick = () => {
      window.location.href = '/TelaCriarQuiz/';
  };
  document.getElementById('btn-jogar').onclick = () => {
      window.location.href = '/TelaCodigoQuiz/';
  };
  document.getElementById('btn-perfil').onclick = () => {
      window.location.href = '/TelaPerfil/';
  };
});