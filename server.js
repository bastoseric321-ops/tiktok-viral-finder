const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'público')));

// Banco de dados SQLite
const db = new sqlite3.Database('./ideas.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY AUTOINCREMENT, creator TEXT, niche TEXT, views TEXT, link TEXT)");
});

// Lista de vídeos virais com links reais para assistir no TikTok
const videosLista = [
  { creator: "@whinderssonnunes", niche: "Humor", views: "3.5M", link: "https://www.tiktok.com/@whinderssonnunes" },
  { creator: "@tirullipa", niche: "Humor", views: "2.8M", link: "https://www.tiktok.com/@tirullipa" },
  { creator: "@eulucasalbert", niche: "Humor", views: "1.9M", link: "https://www.tiktok.com/@eulucasalbert" },
  { creator: "@joaoadibe", niche: "Motivacao", views: "1.2M", link: "https://www.tiktok.com/@joaoadibe" },
  { creator: "@mentemilionaria", niche: "Motivacao", views: "950K", link: "https://www.tiktok.com/tag/motivacao" },
  { creator: "@priscilagomes", niche: "Financas", views: "820K", link: "https://www.tiktok.com/tag/financas" },
  { creator: "@nobru", niche: "Games", views: "4.1M", link: "https://www.tiktok.com/@nobru" },
  { creator: "@loud_coringa", niche: "Games", views: "5.0M", link: "https://www.tiktok.com/@loud_coringa" },
  { creator: "@receitasnestle", niche: "Culinaria", views: "1.5M", link: "https://www.tiktok.com/tag/receitas" }
];

// Rota de busca sem falha
app.get('/api/virals', (req, res) => {
  const { niche } = req.query;
  
  if (!niche || niche === 'Todos os Nichos') {
    return res.json(videosLista);
  }

  // Normaliza o texto para ignorar acentos e maiúsculas
  const filtrados = videosLista.filter(v => 
    v.niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
    niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  res.json(filtrados.length > 0 ? filtrados : videosLista);
});

// Salvar ideia
app.post('/api/ideas', (req, res) => {
  const { creator, niche, views, link } = req.body;
  db.run("INSERT INTO ideas (creator, niche, views, link) VALUES (?, ?, ?, ?)", [creator, niche, views, link], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, creator, niche, views, link });
  });
});

// Listar ideias
app.get('/api/ideas', (req, res) => {
  db.all("SELECT * FROM ideas", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
