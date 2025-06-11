document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const params = new URLSearchParams(window.location.search);
  const quizId = params.get('id'); 

  const container = document.getElementById("rankingList");
  const loadingSpinner = document.getElementById("loadingSpinner");
  container.innerHTML = '';
  loadingSpinner.style.display = 'block';

  if (!quizId) {
    loadingSpinner.style.display = 'none';
    container.innerHTML = "<p>Quiz não encontrado!</p>";
    return;
  }

  fetch(`/api/quizzes/${quizId}/ranking`)
    .then(res => res.json())
    .then(users => {
      loadingSpinner.style.display = 'none';
      if (!Array.isArray(users) || users.length === 0) {
        container.innerHTML = "<p>Nenhum usuário completou este quiz ainda.</p>";
        return;
      }

      const quizInfo = document.createElement("div");
      quizInfo.classList.add("quiz-info");
      quizInfo.innerHTML = `<strong>ID do Quiz:</strong> ${quizId}`;
      container.appendChild(quizInfo);

      let foundUser = false;
      users.forEach((user, idx) => {
        const div = document.createElement("div");
        div.classList.add("ranking-item");
        if (userId && String(user.id) === String(userId)) {
          div.classList.add("logged");
          foundUser = true;
        }

        // Add badge for top 3 ranks
        let badgeClass = '';
        let badgeText = '';
        if (idx === 0) {
          badgeClass = 'first';
          badgeText = '1º Lugar';
        } else if (idx === 1) {
          badgeClass = 'second';
          badgeText = '2º Lugar';
        } else if (idx === 2) {
          badgeClass = 'third';
          badgeText = '3º Lugar';
        }

        div.innerHTML = `
          <div class="ranking-info">
            <span class="pos">${idx + 1}º</span>
            <strong>${user.nome}</strong>
            <span>${user.acertos} acertos</span>
            ${badgeText ? `<span class="badge ${badgeClass}">${badgeText}</span>` : ''}
          </div>
        `;
        container.appendChild(div);
      });

      if (userId && !foundUser) {
        const aviso = document.createElement("div");
        aviso.classList.add("ranking-aviso");
        aviso.innerHTML = `<em>Você ainda não completou este quiz.</em>`;
        container.appendChild(aviso);
      }
    })
    .catch(() => {
      loadingSpinner.style.display = 'none';
      container.innerHTML = "<p>Erro ao buscar ranking.</p>";
    });
});

document.getElementById('btn-voltar').onclick = () => {
  window.location.href = '/TelaPaginaInicial/';
};
