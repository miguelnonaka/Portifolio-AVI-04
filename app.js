const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const sequelize = require('./config/database');
const Disciplina = require('./models/Disciplina');
const Projeto = require('./models/Projeto');
const session = require('express-session');

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'portfolio-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  res.locals.error = req.session.error;
  delete req.session.message;
  delete req.session.error;
  next();
});

const estudante = {
  nome: "Miguel Tomio Toledo Nonaka",
  curso: "Desenvolvimento de software multiplataforma",
  instituicao: "Fatec - Faculdade de Tecnologia",
  anoIngresso: 2025
};

const tecnologiasMaisUsadas = ["Node.js", "JavaScript", "Python", "CSS", "Typescript"];


app.get('/', (req, res) => {
  res.render('pages/home', { estudante });
});

app.get('/sobre', (req, res) => {
  res.render('pages/sobre', { estudante });
});

app.get('/contato', (req, res) => {
  res.render('pages/contato');
});

app.get('/projetos', async (req, res) => {
  try {
    const projetos = await Projeto.findAll({
      order: [['id', 'ASC']]
    });
    res.render('pages/projetos', { projetos });
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    req.session.error = 'Erro ao carregar projetos!';
    res.redirect('/');
  }
});

app.get('/dashboard', async (req, res) => {
  try {
    const [disciplinas, projetos] = await Promise.all([
      Disciplina.findAll(),
      Projeto.findAll()
    ]);
    
    const totalProjetos = projetos.length;
    const concluidos = projetos.filter(p => p.concluido).length;
    const emAndamento = totalProjetos - concluidos;

    const estatisticas = {
      totalDisciplinas: disciplinas.length,
      tecnologiasMaisUsadas,
      concluidos,
      totalProjetos,
      emAndamento
    };
    
    res.render('pages/dashboard', { estudante, estatisticas });
  } catch (error) {
    console.error("Erro no dashboard:", error);
    req.session.error = 'Erro ao carregar dashboard!';
    res.redirect('/');
  }
});


app.get('/disciplinas', async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      order: [['id', 'ASC']]
    });
    res.render('pages/disciplinas', { disciplinas });
  } catch (error) {
    console.error("Erro ao buscar disciplinas:", error);
    req.session.error = 'Erro ao carregar disciplinas!';
    res.redirect('/');
  }
});

app.post('/disciplinas', async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      req.session.error = 'Nome da disciplina é obrigatório!';
      return res.redirect('/disciplinas');
    }

    await Disciplina.create({ 
      nome: nome.trim() 
    });
    
    req.session.message = 'Disciplina adicionada com sucesso!';
    res.redirect('/disciplinas');
  } catch (error) {
    console.error("Erro ao criar disciplina:", error);
    req.session.error = 'Erro ao adicionar disciplina!';
    res.redirect('/disciplinas');
  }
});

app.put('/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      req.session.error = 'Nome da disciplina é obrigatório!';
      return res.redirect('/disciplinas');
    }

    const disciplina = await Disciplina.findByPk(id);
    
    if (!disciplina) {
      req.session.error = 'Disciplina não encontrada!';
      return res.redirect('/disciplinas');
    }

    disciplina.nome = nome.trim();
    await disciplina.save();
    
    req.session.message = 'Disciplina atualizada com sucesso!';
    res.redirect('/disciplinas');
  } catch (error) {
    console.error("Erro ao atualizar disciplina:", error);
    req.session.error = 'Erro ao atualizar disciplina!';
    res.redirect('/disciplinas');
  }
});

app.delete('/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const disciplina = await Disciplina.findByPk(id);
    
    if (!disciplina) {
      req.session.error = 'Disciplina não encontrada!';
      return res.redirect('/disciplinas');
    }

    await disciplina.destroy();
    req.session.message = 'Disciplina excluída com sucesso!';
    res.redirect('/disciplinas');
  } catch (error) {
    console.error("Erro ao deletar disciplina:", error);
    req.session.error = 'Erro ao excluir disciplina!';
    res.redirect('/disciplinas');
  }
});


app.get('/api/disciplinas', async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      order: [['id', 'ASC']]
    });
    res.json(disciplinas);
  } catch (error) {
    console.error("Erro na API de disciplinas:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.post('/api/disciplinas', async (req, res) => {
  try {
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });
    }

    const novaDisciplina = await Disciplina.create({ 
      nome: nome.trim() 
    });
    
    res.status(201).json(novaDisciplina);
  } catch (error) {
    console.error("Erro ao criar disciplina via API:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.put('/api/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    
    if (!nome || !nome.trim()) {
      return res.status(400).json({ error: 'Nome da disciplina é obrigatório' });
    }

    const disciplina = await Disciplina.findByPk(id);
    
    if (!disciplina) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    disciplina.nome = nome.trim();
    await disciplina.save();
    
    res.json(disciplina);
  } catch (error) {
    console.error("Erro ao atualizar disciplina via API:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/disciplinas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const disciplina = await Disciplina.findByPk(id);
    
    if (!disciplina) {
      return res.status(404).json({ error: 'Disciplina não encontrada' });
    }

    await disciplina.destroy();
    res.json({ message: 'Disciplina removida com sucesso', id });
  } catch (error) {
    console.error("Erro ao deletar disciplina via API:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.get('/api/projetos', async (req, res) => {
  try {
    const projetos = await Projeto.findAll({
      order: [['id', 'ASC']]
    });
    res.json(projetos);
  } catch (error) {
    console.error("Erro na API de projetos:", error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});


async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com MySQL estabelecida com sucesso.');
    
    await sequelize.sync({ force: false });
    console.log('Modelos sincronizados com o banco de dados.');
    
    await seedInitialData();
    
    app.listen(port, () => {
      console.log(`Servidor rodando em http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Erro ao inicializar a aplicação:', error);
    process.exit(1);
  }
}

async function seedInitialData() {
  try {
    const projetoCount = await Projeto.count();
    if (projetoCount === 0) {
      const projetosIniciais = [
        {
          nome: "🔍 Reconhecimento de Lixo com YOLOv8",
          descricao: "Sistema de visão computacional que detecta diferentes tipos de resíduos para auxiliar na reciclagem automatizada.",
          participacao: "Treinei o modelo YOLOv8, realizei testes com imagens reais e adaptei o modelo para uso em dispositivos móveis.",
          imagem: null,
          concluido: true
        },
        {
          nome: "📱 App Mobile para leitura de Kanjis com IA",
          descricao: "Aplicativo Android que utiliza um modelo de machine learning para identificar e traduzir Kanjis através da câmera.",
          participacao: "Desenvolvi a interface, integrei o TensorFlow Lite ao app e realizei testes com usuários reais.",
          imagem: "images/tcc.jpeg",
          concluido: true
        },
        {
          nome: "🎮 Jogos em Unity",
          descricao: "Desenvolvimento de uma Visual Novel, um FPS e um Bomberman Online como projetos de estudo e prática com Unity e C#.",
          participacao: "Criação de mecânicas de gameplay, UI e multiplayer usando Mirror Networking.",
          imagem: "images/image (1).png",
          concluido: true
        },
        {
          nome: "🧮 Validador de CPF em Python e C",
          descricao: "Ferramenta simples para validar números de CPF com base no cálculo dos dígitos verificadores.",
          participacao: "Desenvolvi a lógica em Python e fiz a conversão para linguagem C para comparar desempenho.",
          imagem: null,
          concluido: true
        },
        {
          nome: "🌐 API RESTful com PHP, MySQL e JavaScript",
          descricao: "API completa para CRUD de usuários, com banco de dados relacional e integração front-end.",
          participacao: "Desenvolvi toda a API, modelei o banco de dados e criei uma interface web funcional.",
          imagem: null,
          concluido: true
        },
        {
          nome: "🌐 API Kernel Panic - FATEC",
          descricao: "Plataforma para análise gráfica de exportações e importações realizadas pelo Estado de São Paulo entre os anos de 2013 e 2023.",
          participacao: "Desenvolvi as primeiras querys iniciais para receber os dados dos bancos. Criação e host das docker images do projeto no AWS",
          imagem: null,
          concluido: true
        }
      ];
      
      await Projeto.bulkCreate(projetosIniciais);
      console.log('✅ Dados iniciais de projetos inseridos com sucesso.');
    }

    const disciplinaCount = await Disciplina.count();
    if (disciplinaCount === 0) {
      const disciplinasIniciais = [
        { nome: "Algoritmos e Lógica de Programação" },
        { nome: "Banco de Dados" },
        { nome: "Desenvolvimento Web I" },
        { nome: "Engenharia de Software I" },
        { nome: "Matemática para Computação" },
        { nome: "Estrutura de Dados" },
        { nome: "Desenvolvimento Web II" },
        { nome: "Redes de Computadores" },
        { nome: "Sistemas Operacionais" },
        { nome: "Mobile Development" }
      ];
      
      await Disciplina.bulkCreate(disciplinasIniciais);
      console.log('✅ Disciplinas iniciais inseridas com sucesso.');
    }
    
    console.log('✅ Verificação de dados iniciais concluída.');
  } catch (error) {
    console.error('❌ Erro ao inserir dados iniciais:', error);
  }
}

app.use((req, res) => {
  res.status(404).render('pages/error', { 
    error: 'Página não encontrada' 
  });
});

app.use((error, req, res, next) => {
  console.error('Erro global:', error);
  res.status(500).render('pages/error', { 
    error: 'Erro interno do servidor' 
  });
});

process.on('SIGINT', async () => {
  console.log('\n🔄 Encerrando servidor...');
  await sequelize.close();
  console.log('✅ Conexão com o banco fechada.');
  process.exit(0);
});

initializeDatabase();