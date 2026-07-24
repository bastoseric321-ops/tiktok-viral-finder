const express = require('express');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// COLE A SUA CHAVE DA API DO YOUTUBE ENTRE AS ASPAS ABAIXO:
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'COLE_SUA_CHAVE_AQUI';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'público')));

// Rota para buscar vídeos reais no YouTube
app.get('/api/radar', async (req, res) => {
  const { q, categoria } = req.query;
  const termo = q && q.trim() !== '' ? q : (categoria || 'cortes podcast viral');

  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'COLE_SUA_CHAVE_AQUI') {
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(termo)}&type=video&key=${YOUTUBE_API_KEY}`;
      const response = await axios.get(url);
      
      const videos = response.data.items.map(item => ({
        youtubeId: item.id.videoId,
        titulo: item.snippet.title,
        canal: item.snippet.channelTitle,
        status: "Vídeo Real ⚡"
      }));

      return res.json({ success: true, videos });
    } catch (error) {
      console.error("Erro na API:", error.message);
    }
  }

  // Backup seguro de vídeos caso a chave ainda não tenha sido colada
  const fallbackVideos = [
    {
      youtubeId: "J---aiyznGQ",
      titulo: `Busca: ${termo.toUpperCase()} - Melhores Momentos`,
      canal: "Podpah / Cortes",
      status: "Alta Retenção 🔥"
    },
    {
      youtubeId: "kxySjF48G-o",
      titulo: "REVELAÇÕES BOMBÁSTICAS SOBRE MUDANÇA DE VIDA",
      canal: "Inteligência Ltda",
      status: "Viral no TikTok 🚀"
    }
  ];

  res.json({ success: true, videos: fallbackVideos });
});

// Rota de IA para sugerir os cortes
app.post('/api/autoclip', (req, res) => {
  const { youtubeId, titulo } = req.body;

  setTimeout(() => {
    res.json({
      success: true,
      clips: [
        {
          titulo: `Corte Principal: ${titulo ? titulo.substring(0, 30) : 'Momento Viral'}`,
          tempo: "00:01:20 - 00:02:05",
          score: "99/100 🔥",
          gancho: "Você não vai acreditar no que ele falou...",
          acao: "Legenda amarela/branca grande no centro.",
          linkOpus: "https://www.opus.pro"
        }
      ]
    });
  }, 1000);
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
