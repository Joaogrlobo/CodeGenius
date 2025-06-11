document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    if (!usuario) {
        window.location.href = "/TelaLogin/Cadastro/index.html";
        return;
    }

    // --- Lógica dos botões do menu ---
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

    // --- Carregamento dos Quizzes ---
    const baseUrl = 'http://localhost:8080'; // Use a URL base do seu servidor

    fetch(`${baseUrl}/api/quizzes`) // Faz a chamada completa para a API
        .then(res => {
            if (!res.ok) {
                throw new Error('Falha ao carregar os quizzes');
            }
            return res.json();
        })
        .then(data => {
            const container = document.querySelector('.icons');
            if (!container) return;

            container.innerHTML = ''; 

            
            const usuarioObj = JSON.parse(localStorage.getItem('usuario'));

            data.forEach(quiz => {
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-item';

                
                const title = document.createElement('p');
                title.textContent = quiz.titulo;
                title.className = 'quiz-title';

                
                const img = document.createElement('img');
                if (quiz.icone && quiz.icone.startsWith('/uploads')) {
                    img.src = baseUrl + quiz.icone;
                } else if (quiz.icone && (quiz.icone.startsWith('http://') || quiz.icone.startsWith('https://'))) {
                    img.src = quiz.icone;
                } else if (quiz.icone) {
                    img.src = baseUrl + '/' + quiz.icone;
                } else {
                    img.src = '';
                }
                img.alt = quiz.titulo;

                
                quizCard.appendChild(title);
                quizCard.appendChild(img);

                
                if (usuarioObj && quiz.criado_por == usuarioObj.id) {
                    const editBtn = document.createElement('button');
                    editBtn.textContent = 'Editar';
                    editBtn.className = 'btn-edit';
                    editBtn.onclick = (e) => {
                        e.stopPropagation();
                        window.location.href = `/TelaEdicao_DeletarQuiz/index.html?quizId=${quiz.id}`;
                    };
                    quizCard.appendChild(editBtn);
                }

                quizCard.style.cursor = 'pointer';
                quizCard.onclick = () => {
                    window.location.href = `/TelaQuestao/?id=${quiz.id}`;
                };

                container.appendChild(quizCard);
            });
        })
        .catch(error => {
            console.error("Erro:", error);
            const container = document.querySelector('.icons');
            if(container) container.innerHTML = "<p>Não foi possível carregar os quizzes.</p>";
        });
});
