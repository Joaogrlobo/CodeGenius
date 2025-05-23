document.addEventListener('DOMContentLoaded', () => {
  const perguntasContainer = document.getElementById('perguntas-container');
  for (let i = 1; i <= 4; i++) {
    const div = document.createElement('div');
    div.className = 'section';
    div.innerHTML = `
      <label>Pergunta ${i}:</label>
      <input type="text" name="pergunta${i}" required>
      <div style="margin-top:8px;">
        <label>Alternativas:</label><br>
        ${[1,2,3,4].map(j => `
          <input type="text" name="alt${i}_${j}" placeholder="Alternativa ${j}" required>
          <input type="radio" name="correta${i}" value="${j}" ${j===1?'required':''}> Correta<br>
        `).join('')}
      </div>
    `;
    perguntasContainer.appendChild(div);
  }

  document.getElementById('quizForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    formData.append('criado_por', 1); 

    const perguntas = [];
    for (let i = 1; i <= 4; i++) {
      const enunciado = form[`pergunta${i}`].value;
      const respostas = [];
      for (let j = 1; j <= 4; j++) {
        respostas.push({
          texto: form[`alt${i}_${j}`].value,
          correta: form[`correta${i}`].value == j
        });
      }
      perguntas.push({ enunciado, respostas });
    }
    formData.append('perguntas', JSON.stringify(perguntas));

    try {
      const res = await fetch('/api/quizzes', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        alert('Quiz criado com sucesso!');
        form.reset();
      } else {
        alert(data.error || 'Erro ao criar quiz');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  });
});