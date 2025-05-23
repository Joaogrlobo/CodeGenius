function toggleScreens() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("registerScreen").style.display = "block";
  clearAllErrors();
}

function clearAllErrors() {
  document.querySelectorAll(".error").forEach(span => span.textContent = "");
  document.querySelectorAll("input").forEach(input => input.classList.remove("error-border"));
}

function validateEmail(email) {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(email);
}

async function handleLogin() {
  clearAllErrors();
  let valid = true;

  const email = document.getElementById("loginEmail");
  const password = document.getElementById("loginPassword");

  if (!email.value.trim()) {
    setError(email, "E-mail inválido", "loginEmailError");
    valid = false;
  } else if (!validateEmail(email.value)) {
    setError(email, "E-mail inválido", "loginEmailError");
    valid = false;
  }

  if (!password.value.trim()) {
    setError(password, "Senha inválida", "loginPasswordError");
    valid = false;
  }

  if (valid) {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.value,
          senha: password.value
        })
      });
      const data = await res.json();
      if (res.ok) {
       
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        localStorage.setItem('userId', data.usuario.id); 
        window.location.href = "/TelaPaginaInicial/index.html";
      } else {
        setError(email, data.error || "E-mail ou senha incorretos", "loginEmailError");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    }
  }
}

async function handleRegister() {
  clearAllErrors();
  let valid = true;

  const name = document.getElementById("registerName");
  const email = document.getElementById("registerEmail");
  const password = document.getElementById("registerPassword");

  if (!name.value.trim()) {
    setError(name, "Nome em branco", "registerNameError");
    valid = false;
  }

  if (!email.value.trim() || !validateEmail(email.value)) {
    setError(email, "E-mail inválido", "registerEmailError");
    valid = false;
  }

  if (!password.value.trim()) {
    setError(password, "Senha inválida", "registerPasswordError");
    valid = false;
  }

  if (valid) {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name.value,
          email: email.value,
          senha: password.value
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Cadastro realizado com sucesso!");
        toggleScreens();
      } else {
        setError(email, data.error || "Erro ao cadastrar", "registerEmailError");
      }
    } catch (err) {
      alert("Erro de conexão com o servidor.");
    }
  }
}

function setError(inputElement, message, errorId) {
  inputElement.classList.add("error-border");
  document.getElementById(errorId).textContent = message;
}
