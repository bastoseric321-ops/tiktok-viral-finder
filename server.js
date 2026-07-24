const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'público')));

// Banco de Dados em Memória / Arquivo Seguro (Sem travamentos)
const db = new sqlite3.Database('./ideas.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS ideas (id INTEGER PRIMARY KEY AUTOINCREMENT, creator TEXT, niche TEXT, views TEXT, link TEXT)");
});

// Banco de Dados de Tendências do Radar
const radarDatabase = [
  { creator: "@podpah", niche: "Podcasts", views: "14.2K (Explodindo)", tag: "Corte de Revelação Bombástica", tip: "Corte exatamente quando o convidado hesita antes de falar algo polêmico.", link: "https://www.tiktok.com/@podpah" },
  { creator: "@inteligenciapodcast", niche: "Podcasts", views: "8.9K (Subindo)", tag: "Mistério / Ciência Oculta", tip: "Use legendas grandes em amarelo e fundo de jogo/fundo dinâmico.", link: "https://www.tiktok.com/@inteligenciapodcast" },
  { creator: "@flowpodcast", niche: "Podcasts", views: "25.1K (Alta Retenção)", tag: "Debate Quente de Opinião", tip: "Coloque uma pergunta no topo para fazer as pessoas comentarem.", link: "https://www.tiktok.com/@flowpodcast" },
  { creator: "@ideias_virais", niche: "Negocios", views: "5.4K (Oculto)", tag: "Estratégia Secreta de Vendas", tip: "Revele a dica direto nos primeiros 2 segundos sem enrolar.", link: "https://www.tiktok.com/tag/marketingdigital" },
  { creator: "@financas_express", niche: "Financas", views: "11.1K (Em alta)", tag: "Erro de Dinheiro que Todos Cometem", tip: "Inicie com: 'Se você faz isso com seu dinheiro, pare agora'.", link: "https://www.tiktok.com/tag/financas" },
  { creator: "@humor_br", niche: "Humor", views: "22.3K (Viral)", tag: "Esquete de Cotidiano", tip: "Imite uma situação constrangedora que todo mundo já passou.", link: "https://www.tiktok.com/tag/comedia" },
  { creator: "@tech_misterios", niche: "Tecnologia", views: "7.8K (Achado)", tag: "Site Oculto de IA Grátis", tip: "Grave a tela mostrando a ferramenta funcionando na prática.", link: "https://www.tiktok.com/tag/inteligenciaartificial" }
];

// Rota do Radar Oculto Segura
app.get('/api/radar', (req, res) => {
  try {
    const { niche, q } = req.query;
    let resultados = [...radarDatabase];

    // Filtro por Nicho
    if (niche && niche !== 'Todos' && niche !== 'Todos os Nichos') {
      resultados = resultados.filter(v => 
        v.niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === 
        niche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      );
    }

    // Filtro por Texto Pesquisado
    if (q && q.trim() !== '') {
      const termo = q.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const filtrados = resultados.filter(v => 
        v.tag.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
        v.creator.toLowerCase().includes(termo) ||
        v.tip.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(termo) ||
        v.niche.toLowerCase().includes(termo)
      );

      if (filtrados.length > 0) {
        resultados = filtrados;
      } else {
        // Se pesquisar algo inédito, cria um achado personalizado na hora
        resultados = [{
          creator: `@radar_${q.replace(/\s+/g, '_').toLowerCase()}`,
          niche: niche || 'Podcasts',
          views: '3.5K (Início de Curva)',
          tag: `Busca Oculta Encontrada: "${q}"`,
          tip: `Abra o TikTok, digite "${q}" e ordene por vídeos das últimas 24h para pegar antes de viralizar.`,
          link: `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`
        }];
      }
    }

    res.json(resultados);
  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// Salvar Ideia
app.post('/api/ideas', (req, res) => {
  const { creator, niche, views, link } = req.body;
  db.run("INSERT INTO ideas (creator, niche, views, link) VALUES (?, ?, ?, ?)", [creator, niche, views, link], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID });
  });
});

// Listar Ideias
app.get('/api/ideas', (req, res) => {
  db.all("SELECT * FROM ideas", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
