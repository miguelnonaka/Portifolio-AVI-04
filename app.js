const express = require('express');
const path = require('path');
const fs = require('fs');
const methodOverride = require('method-override');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method')); 

const disciplinasPath = path.join(process.cwd(), "disciplinas.json"); 

const readDisciplinas = () => {
  try {
    const data = fs.readFileSync(disciplinasPath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Erro ao ler disciplinas:", err);
    return [];
  }
};

const writeDisciplinas = (data) => {
  try {
    fs.writeFileSync(disciplinasPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Erro ao salvar disciplinas:", err);
  }
};

const estudante = {
  nome: "Miguel Tomio Toledo Nonaka",
  curso: "Desenvolvimento de software multiplataforma",
  instituicao: "Fatec - Faculdade de Tecnologia",
  anoIngresso: 2025
};

const projetos = [
{
  nome: "🔍 Reconhecimento de Lixo com YOLOv8",
  descricao: "Sistema de visão computacional que detecta diferentes tipos de resíduos para auxiliar na reciclagem automatizada.",
  participacao: "Treinei o modelo YOLOv8, realizei testes com imagens reais e adaptei o modelo para uso em dispositivos móveis.",
  imagem: null ,
  concluido: 1
},
{
  nome: "📱 App Mobile para leitura de Kanjis com IA",
  descricao: "Aplicativo Android que utiliza um modelo de machine learning para identificar e traduzir Kanjis através da câmera.",
  participacao: "Desenvolvi a interface, integrei o TensorFlow Lite ao app e realizei testes com usuários reais.",
  imagem: "images/tcc.jpeg",
  concluido: 1
},
{
  nome: "🎮 Jogos em Unity",
  descricao: "Desenvolvimento de uma Visual Novel, um FPS e um Bomberman Online como projetos de estudo e prática com Unity e C#.",
  participacao: "Criação de mecânicas de gameplay, UI e multiplayer usando Mirror Networking.",
  imagem: "images/image (1).png",
  concluido: 1
},
{
  nome: "🧮 Validador de CPF em Python e C",
  descricao: "Ferramenta simples para validar números de CPF com base no cálculo dos dígitos verificadores.",
  participacao: "Desenvolvi a lógica em Python e fiz a conversão para linguagem C para comparar desempenho.",
  imagem: null,
  concluido: 1
},
{
  nome: "🌐 API RESTful com PHP, MySQL e JavaScript",
  descricao: "API completa para CRUD de usuários, com banco de dados relacional e integração front-end.",
  participacao: "Desenvolvi toda a API, modelei o banco de dados e criei uma interface web funcional.",
  imagem: null,
  concluido: 1
},
{
  nome: "🌐 API Kernel Panic - FATEC",
  descricao: "Plataforma para análise gráfica de exportações e importações realizadas pelo Estado de São Paulo entre os anos de 2013 e 2023.",
  participacao: "Desenvolvi as primeiras querys iniciais para receber os dados dos bancos. Criação e host das docker images do projeto no AWS",
  imagem: null,
  concluido: 1
}
];

const tecnologiasMaisUsadas = ["Node.js", "JavaScript", "Python", "CSS","Typescript"];

app.get('/', (req, res) => res.render('pages/home', { estudante }));

app.get('/sobre', (req, res) => res.render('pages/sobre', { estudante }));

app.get('/projetos', (req, res) => res.render('pages/projetos', { projetos }));

app.get('/contato', (req, res) => res.render('pages/contato'));

app.get('/dashboard', (req, res) => {
  const disciplinas = readDisciplinas();
  const totalProjetos = projetos.length;
  const concluidos = projetos.filter(p => p.concluido === 1).length;
  const emAndamento = totalProjetos - concluidos;

  const estatisticas = {
    totalDisciplinas: disciplinas.length,
    tecnologiasMaisUsadas,
    concluidos,
    totalProjetos,
    emAndamento
  };
  res.render('pages/dashboard', { estudante, estatisticas });
});

app.get('/disciplinas', (req, res) => {
  const disciplinas = readDisciplinas();
  res.render('pages/disciplinas', { disciplinas });
});

app.post('/disciplinas', (req, res) => {
  const disciplinas = readDisciplinas();
  const nextId = disciplinas.length > 0 ? Math.max(...disciplinas.map(d => d.id)) + 1 : 1;
  const nome = req.body.nome?.trim();
  if (nome) {
    disciplinas.push({ id: nextId, nome });
    writeDisciplinas(disciplinas);
  }
  res.redirect('/disciplinas');
});

app.put('/disciplinas/:id', (req, res) => {
  const disciplinas = readDisciplinas();
  const id = parseInt(req.params.id);
  const disciplina = disciplinas.find(d => d.id === id);
  const nome = req.body.nome?.trim();
  if (disciplina && nome) {
    disciplina.nome = nome;
    writeDisciplinas(disciplinas);
    res.redirect('/disciplinas');
  } else {
    res.status(400).send('Erro ao atualizar disciplina');
  }
});

app.delete('/disciplinas/:id', (req, res) => {
  let disciplinas = readDisciplinas();
  const id = parseInt(req.params.id);
  disciplinas = disciplinas.filter(d => d.id !== id);
  writeDisciplinas(disciplinas);
  res.redirect('/disciplinas');
});

// --- Rotas da API (JSON) ---
app.get('/api/disciplinas', (req, res) => {
  const disciplinas = readDisciplinas();
  res.json(disciplinas);
});

app.post('/api/disciplinas', (req, res) => {
  const disciplinas = readDisciplinas();
  const nextId = disciplinas.length > 0 ? Math.max(...disciplinas.map(d => d.id)) + 1 : 1;
  const nome = req.body.nome?.trim();
  if (nome) {
    const novaDisciplina = { id: nextId, nome };
    disciplinas.push(novaDisciplina);
    writeDisciplinas(disciplinas);
    return res.status(201).json(novaDisciplina);
  }
  res.status(400).json({ error: 'Nome inválido' });
});

app.put('/api/disciplinas/:id', (req, res) => {
  const disciplinas = readDisciplinas();
  const id = parseInt(req.params.id);
  const disciplina = disciplinas.find(d => d.id === id);
  const nome = req.body.nome?.trim();
  if (disciplina && nome) {
    disciplina.nome = nome;
    writeDisciplinas(disciplinas);
    return res.json(disciplina);
  }
  res.status(400).json({ error: 'Disciplina não encontrada ou nome inválido' });
});

app.delete('/api/disciplinas/:id', (req, res) => {
  let disciplinas = readDisciplinas();
  const id = parseInt(req.params.id);
  const exists = disciplinas.some(d => d.id === id);
  if (!exists) return res.status(404).json({ error: 'Disciplina não encontrada' });

  disciplinas = disciplinas.filter(d => d.id !== id);
  writeDisciplinas(disciplinas);
  res.json({ message: 'Disciplina removida', id });
});

// --- Servidor ---
app.listen(port, () => console.log(`✅ Servidor rodando em http://localhost:${port}`));
