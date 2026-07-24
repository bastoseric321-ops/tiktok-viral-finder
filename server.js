const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/trending', (req, res) => {
  const { niche, minViews } = req.query;

  const mockVideos = Array.from({ length: 50 }, (_, i) => {
    const niches = ['humor', 'dancinha', 'motivacao', 'culinaria', 'financas', 'games'];
    const selectedNiche = niche && niche !== 'all' ? niche : niches[i % niches.length];
    const views = Math.floor(Math.random() * 900000) + 100000;
    const likes = Math.floor(views * (Math.random() * 0.15 + 0.05));
    const comments = Math.floor(likes * 0.08);
    const growthRate = (Math.random() * 45 + 5).toFixed(1);

    return {
      id: `vid_${1000 + i}`,
      author: `@criador_${i + 1}`,
      description: `Vídeo sobre ${selectedNiche} com alto engajamento! #viral #${selectedNiche}`,
      niche: selectedNiche,
      views,
      likes,
      comments,
      growthRatePerHour: `${growthRate}%`,
      viralPotential: growthRate > 25 ? 'Muito Alto' : 'Alto',
      postedHoursAgo: Math.floor(Math.random() * 48) + 1,
      videoUrl: "https://www.tiktok.com"
    };
  });

  let filtered = mockVideos;
  if (niche && niche !== 'all') {
    filtered = filtered.filter(v => v.niche === niche);
  }
  if (minViews) {
    filtered = filtered.filter(v => v.views >= parseInt(minViews));
  }

  res.json({ success: true, count: filtered.length, data: filtered });
});

app.post('/api/process-cut', (req, res) => {
  const { videoUrl } = req.body;
  if (!videoUrl) return res.status(400).json({ success: false, error: "URL obrigatória" });

  setTimeout(() => {
    res.json({
      success: true,
      message: "Análise concluída!",
      downloadUrl: videoUrl,
      highlights: [
        { start: "00:03", end: "00:15", score: "98% Retenção" },
        { start: "00:28", end: "00:42", score: "91% Retenção" }
      ],
      aspectRatio: "9:16 (TikTok/Reels)"
    });
  }, 1000);
});

app.post('/api/ideas', (req, res) => {
  const { video_id, author, description, niche, views, likes } = req.body;
  const query = `INSERT INTO saved_ideas (video_id, author, description, niche, views, likes) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [video_id, author, description, niche, views, likes], function (err) {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, id: this.lastID });
  });
});

app.get('/api/ideas', (req, res) => {
  db.all(`SELECT * FROM saved_ideas ORDER BY created_at DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
