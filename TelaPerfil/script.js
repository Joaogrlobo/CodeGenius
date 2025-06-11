function goBack() {
  window.location.href = '/TelaPaginaInicial/index.html';
}

function logout() {
  localStorage.removeItem('userId');
  window.location.href = '/TelaLogin/Cadastro/index.html';
}

function editName() {
  const currentName = document.getElementById("userName").textContent;
  const newName = prompt("Digite o novo nome:", currentName);
  if (newName) {
    document.getElementById("userName").textContent = newName;
  }
}

function editPhoto() {
  const newUrl = prompt("URL da nova foto de perfil:");
  if (newUrl) {
    document.getElementById("userPhoto").src = newUrl;
  }
}

async function carregarQuizzesUsuario() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  try {
    const res = await fetch(`/api/usuario/${userId}/quizzes`);
    const quizzes = await res.json();
    const historySection = document.querySelector('.history');
    if (!historySection) return;

    // Limpa quizzes antigos
    historySection.querySelectorAll('.quiz-item').forEach(el => el.remove());

    if (quizzes.length === 0) {
      const vazio = document.createElement('div');
      vazio.textContent = 'Nenhum quiz realizado ainda.';
      historySection.appendChild(vazio);
      return;
    }

    quizzes.forEach(quiz => {
      const div = document.createElement('div');
      div.className = 'quiz-item';
      div.innerHTML = `
        <img src="${quiz.icone || 'https://via.placeholder.com/36'}" alt="${quiz.titulo}">
        <span>${quiz.titulo}</span>
        <span style="margin-left:auto;">${quiz.nivel}</span>
        <span style="margin-left:16px;">${quiz.pontuacao} pts</span>
        <span style="margin-left:16px; font-size:12px; color:#888;">${new Date(quiz.data_execucao).toLocaleDateString()}</span>
      `;
      historySection.appendChild(div);
    });
  } catch (err) {
    console.error('Erro ao carregar quizzes do usuário:', err);
  }
}

async function carregarNomeUsuario() {
  const userId = localStorage.getItem('userId');
  if (!userId) return;
  try {
    const res = await fetch(`/api/auth/usuario/${userId}`);
    if (!res.ok) return;
    const usuario = await res.json();
    document.getElementById('userName').textContent = usuario.nome;
  } catch (err) {
    console.error('Erro ao carregar nome do usuário:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const seta = document.querySelector('.back-btn');
  if (seta) {
    seta.onclick = goBack;
  }
  carregarQuizzesUsuario();
  carregarNomeUsuario();
});
