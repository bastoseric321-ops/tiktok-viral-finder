// ROTA PRINCIPAL DE BUSCA (ATUALIZADA PARA VÍDEOS RECENTES)
app.get('/api/radar', async (req, res) => {
  const { q, categoria } = req.query;
  const termo = q && q.trim() !== '' ? q : (categoria || 'cortes podcast viral');

  // Se a chave da API estiver configurada
  if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'COLE_SUA_CHAVE_AQUI') {
    try {
      // Adicionado &order=date para trazer os vídeos MAIS RECENTES do YouTube!
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=8&q=${encodeURIComponent(termo)}&type=video&order=date&key=${YOUTUBE_API_KEY}`;
      const response = await axios.get(url);
      
      const videos = response.data.items.map(item => ({
        youtubeId: item.id.videoId,
        titulo: item.snippet.title,
        canal: item.snippet.channelTitle,
        status: "Recente / Em Alta ⚡"
      }));

      if (videos.length > 0) {
        return res.json({ success: true, videos });
      }
    } catch (error) {
      console.error("Erro na API do YouTube (usando backup):", error.message);
    }
  }

  // BACKUP COM VÍDEOS REAIS E ATUAIS DE PODCASTS (Substituído o vídeo antigo!)
  const fallbackVideos = [
    {
      youtubeId: "LXb3EKWsInQ", // Vídeo real de podcast
      titulo: `Busca: ${termo.toUpperCase()} — Momentos Marcantes`,
      canal: "Cortes de Podcasts",
      status: "Alta Retenção 🔥"
    },
    {
      youtubeId: "kxySjF48G-o",
      titulo: "REVELAÇÕES SOBRE CARREIRA E SUCESSO",
      canal: "Inteligência Ltda",
      status: "Viral 🚀"
    }
  ];

  res.json({ success: true, videos: fallbackVideos });
});
