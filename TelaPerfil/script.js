function goBack() {
  window.history.back();
}

function logout() {
  localStorage.removeItem('userId');
  window.location.href = '/TelaLogin/Cadastro/';
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

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  if (userId) {
    fetch(`/api/usuario/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.nome) {
          document.getElementById('userName').textContent = data.nome;
        }
      });
  }
});
