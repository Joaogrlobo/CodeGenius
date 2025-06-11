document.addEventListener('DOMContentLoaded', () => {
    const baseUrl = 'http://localhost:8080';
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('quizId'); // <-- Corrija para 'quizId'
    const usuario = localStorage.getItem('usuario'); // Assuming user info is stored here as JSON string

    if (!quizId) {
        alert('ID do quiz não fornecido.');
        window.location.href = '/TelaPaginaInicial/';
        return;
    }

    if (!usuario) {
        alert('Usuário não autenticado.');
        window.location.href = '/TelaLogin/Cadastro/index.html';
        return;
    }

    const usuarioObj = JSON.parse(usuario);
    const usuarioId = usuarioObj.id;

    // Elements
    const btnSave = document.querySelector('.btn-save');
    const btnDelete = document.querySelector('.btn-delete');

    // Load quiz data
    fetch(`${baseUrl}/api/quizzes/${quizId}`)
        .then(res => {
            if (!res.ok) throw new Error('Erro ao carregar quiz');
            return res.json();
        })
        .then(quiz => {
            if (String(quiz.criado_por) !== String(usuarioId)) {
                alert('Você não tem permissão para editar este quiz.');
                window.location.href = '/TelaPaginaInicial/';
                return;
            }
            // Populate fields
            document.getElementById('quiz-title').value = quiz.titulo || '';
            document.getElementById('quiz-image').value = quiz.icone || '';
            document.getElementById('quiz-level').value = quiz.nivel || 'Fácil';
            document.getElementById('quiz-time').value = quiz.tempo || 60;

            // Load questions and answers
            fetch(`${baseUrl}/api/pergunta/${quizId}`)
                .then(res => res.json())
                .then(data => {
                    const questionsContainer = document.getElementById('questions-container');
                    questionsContainer.innerHTML = '';
                    data.perguntas.forEach((pergunta, index) => {
                        const questionDiv = document.createElement('div');
                        questionDiv.className = 'question';

                        const questionLabel = document.createElement('label');
                        questionLabel.textContent = `Fase ${index + 1} - Enunciado:`;
                        const questionInput = document.createElement('input');
                        questionInput.type = 'text';
                        questionInput.value = pergunta.enunciado;
                        questionInput.className = 'question-enunciado';

                        questionDiv.appendChild(questionLabel);
                        questionDiv.appendChild(questionInput);

                        pergunta.respostas.forEach((resposta, rIndex) => {
                            const answerDiv = document.createElement('div');
                            answerDiv.className = 'answer';

                            const answerLabel = document.createElement('label');
                            answerLabel.textContent = `Resposta ${rIndex + 1}:`;
                            const answerInput = document.createElement('input');
                            answerInput.type = 'text';
                            answerInput.value = resposta.texto;
                            answerInput.className = 'answer-texto';

                            const correctLabel = document.createElement('label');
                            correctLabel.textContent = 'Correta';
                            const correctCheckbox = document.createElement('input');
                            correctCheckbox.type = 'checkbox';
                            correctCheckbox.checked = resposta.correta;
                            correctCheckbox.className = 'answer-correta';

                            answerDiv.appendChild(answerLabel);
                            answerDiv.appendChild(answerInput);
                            answerDiv.appendChild(correctLabel);
                            answerDiv.appendChild(correctCheckbox);

                            questionDiv.appendChild(answerDiv);
                        });

                        questionsContainer.appendChild(questionDiv);
                    });
                });
        })
        .catch(err => {
            alert('Erro ao carregar quiz: ' + err.message);
            window.location.href = '/TelaPaginaInicial/';
        });

    // Save changes
    btnSave.addEventListener('click', () => {
        // Collect updated quiz data from inputs
        const titulo = document.getElementById('quiz-title').value;
        const icone = document.getElementById('quiz-image').value;
        const nivel = document.getElementById('quiz-level').value;
        const tempo = parseInt(document.getElementById('quiz-time').value, 10);

        const questionsContainer = document.getElementById('questions-container');
        const questionDivs = questionsContainer.querySelectorAll('.question');

        const perguntas = Array.from(questionDivs).map(qDiv => {
            const enunciado = qDiv.querySelector('.question-enunciado').value;
            const answerDivs = qDiv.querySelectorAll('.answer');
            const respostas = Array.from(answerDivs).map(aDiv => {
                return {
                    texto: aDiv.querySelector('.answer-texto').value,
                    correta: aDiv.querySelector('.answer-correta').checked
                };
            });
            return { enunciado, respostas };
        });

        const updatedQuiz = {
            titulo,
            icone,
            nivel,
            tempo,
            criado_por: usuarioId,
            perguntas
        };

        fetch(`${baseUrl}/api/quizzes/${quizId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedQuiz)
        })
        .then(res => {
            if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao salvar quiz'); });
            alert('Quiz salvo com sucesso!');
            window.location.href = '/TelaPaginaInicial/';
        })
        .catch(err => {
            alert('Erro ao salvar quiz: ' + err.message);
        });
    });

    // Delete quiz
    btnDelete.addEventListener('click', () => {
        if (!confirm('Tem certeza que deseja deletar este quiz?')) return;

        fetch(`${baseUrl}/api/quizzes/${quizId}`, {
            method: 'DELETE'
        })
        .then(res => {
            if (!res.ok) return res.json().then(data => { throw new Error(data.error || 'Erro ao deletar quiz'); });
            alert('Quiz deletado com sucesso!');
            window.location.href = '/TelaPaginaInicial/';
        })
        .catch(err => {
            alert('Erro ao deletar quiz: ' + err.message);
        });
    });
});
