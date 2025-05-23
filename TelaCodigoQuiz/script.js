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

  
  if (code !== "12345") {
    quizCodeInput.classList.add("error-border");
    errorMsg.textContent = "Código inválido.";
    return;
  }

  alert("Código aceito! Iniciando o quiz...");
    window.location.href = '/TelaQuestao/';
}

function goBack() {
  window.history.back(); 
}
