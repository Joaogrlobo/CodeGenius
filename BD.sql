use CodeGenius;



CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(255),  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios (nome, email, senha) VALUES ('Admin', 'admin@email.com', '123456');

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  nivel ENUM('Fácil', 'Médio', 'Difícil') NOT NULL,
  tempo INT NOT NULL, 
  criado_por INT,
  icone VARCHAR(255), -- Adiciona aqui
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

ALTER TABLE quizzes ADD COLUMN icone VARCHAR(255);

INSERT INTO quizzes (titulo, nivel, tempo, criado_por) VALUES ('Quiz de Java Básico', 'Fácil', 10, 1);

CREATE TABLE perguntas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  quiz_id INT NOT NULL,
  enunciado TEXT NOT NULL,
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE respostas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pergunta_id INT NOT NULL,
  texto TEXT NOT NULL,
  correta BOOLEAN NOT NULL DEFAULT FALSE,
  FOREIGN KEY (pergunta_id) REFERENCES perguntas(id) ON DELETE CASCADE
);

INSERT INTO perguntas (quiz_id, enunciado) VALUES (1, 'O que é uma variável em Java?');
INSERT INTO respostas (pergunta_id, texto, correta) VALUES (1, 'Um espaço na memória para armazenar valores', TRUE);
INSERT INTO respostas (pergunta_id, texto, correta) VALUES (1, 'Um tipo de dado', FALSE);
INSERT INTO respostas (pergunta_id, texto, correta) VALUES (1, 'Uma lista de dados', FALSE);
INSERT INTO respostas (pergunta_id, texto, correta) VALUES (1, 'Uma linguagem', FALSE);

CREATE TABLE resultados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  quiz_id INT NOT NULL,
  pontuacao INT NOT NULL,
  acertos INT NOT NULL,
  data_execucao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);






