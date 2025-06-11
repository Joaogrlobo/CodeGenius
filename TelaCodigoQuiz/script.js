function playQuiz() {
  const quizCodeInput = document.getElementById("quizCode");
  const errorMsg = document.getElementById("quizCodeError");
  const code = quizCodeInput.value.trim();

  quizCodeInput.classList.remove("error-border");
  errorMsg.textContent = "";

  if (!code) {
    quizCodeInput.classList.add("error-border");
    errorMsg.textContent = "Digite o código do quiz.";
    return;
  }

  
  window.location.href = `/TelaQuestao/?id=${code}`;
}

function goBack() {
  window.history.back(); 
}

function finalizarQuiz(usuarioId, quizId, pontuacao, acertos) {
  fetch('/api/quizzes/resultado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usuario_id: usuarioId,
      quiz_id: quizId,
      pontuacao: pontuacao,
      acertos: acertos
    })
  })
  .then(res => res.json())
  .then(data => {
    alert('Resultado salvo com sucesso!');
    // Redirecionar ou atualizar a tela, se quiser
  })
  .catch(err => {
    alert('Erro ao salvar resultado!');
    console.error(err);
  });
}

finalizarQuiz(usuarioId, quizId, pontuacao, acertos);
