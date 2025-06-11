create database CodeGenius;
use CodeGenius;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  senha VARCHAR(255),  
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quizzes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  nivel ENUM('Fácil', 'Médio', 'Difícil') NOT NULL,
  tempo INT NOT NULL, 
  criado_por INT,
  icone VARCHAR(255), 
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (criado_por) REFERENCES usuarios(id)
);

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





