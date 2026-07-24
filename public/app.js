document.addEventListener("DOMContentLoaded", () => {
  fetchTrending();
});

function switchTab(tabName) {
  document.getElementById("tab-dashboard").classList.add("hidden");
  document.getElementById("tab-cutter").classList.add("hidden");
  document.getElementById("tab-ideas").classList.add("hidden");

  document.getElementById(`tab-${tabName}`).classList.remove("hidden");

  if (tabName === 'ideas') fetchIdeas();
}

async function fetchTrending() {
  const niche = document.getElementById("filter-niche").value;
  const minViews = document.getElementById("filter-views").value;
  const tbody = document.getElementById("trending-table-body");

  tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Buscando vídeos em alta...</td></tr>`;

  try {
    const res = await fetch(`/api/trending?niche=${niche}&minViews=${minViews}`);
    const result = await res.json();

    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum vídeo encontrado.</td></tr>`;
      return;
    }

    tbody.innerHTML = result.data.map(video => `
      <tr class="hover:bg-gray-800/50">
        <td class="p-4 font-semibold text-white">${video.author}</td>
        <td class="p-4"><span class="bg-gray-800 px-2 py-0.5 rounded text-xs capitalize">${video.niche}</span></td>
        <td class="p-4">${video.views.toLocaleString()}</td>
        <td class="p-4 text-green-400 font-mono">+${video.growthRatePerHour}</td>
        <td class="p-4 text-right">
          <button onclick="saveIdea('${video.id}', '${video.author}', '${video.niche}', ${video.views}, ${video.likes})" class="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 px-3 py-1 rounded">
            Salvar
          </button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-400">Erro ao carregar vídeos.</td></tr>`;
  }
}

async function processCut() {
  const url = document.getElementById("video-url-input").value;
  const resultDiv = document.getElementById("cutter-result");

  if (!url) return alert("Insira um link do TikTok.");

  try {
    const res = await fetch('/api/process-cut', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: url })
    });
    const data = await res.json();

    if (data.success) {
      resultDiv.classList.remove("hidden");
      document.getElementById("highlights-list").innerHTML = data.highlights.map(h => `<li>Pico: ${h.start} - ${h.end} (${h.score})</li>`).join('');
      document.getElementById("download-btn").href = data.downloadUrl;
    }
  } catch (err) {
    alert("Erro ao processar vídeo.");
  }
}

async function saveIdea(video_id, author, niche, views, likes) {
  try {
    const res = await fetch('/api/ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ video_id, author, description: `Ideia do nicho ${niche}`, niche, views, likes })
    });
    const data = await res.json();
    if (data.success) alert("Salvo no banco de ideias!");
  } catch (err) {
    alert("Erro ao salvar.");
  }
}

async function fetchIdeas() {
  const grid = document.getElementById("ideas-grid");
  grid.innerHTML = `<p class="text-gray-500">Carregando...</p>`;

  try {
    const res = await fetch('/api/ideas');
    const result = await res.json();

    if (!result.data || result.data.length === 0) {
      grid.innerHTML = `<p class="text-gray-500">Nenhuma ideia salva ainda.</p>`;
      return;
    }

    grid.innerHTML = result.data.map(item => `
      <div class="bg-gray-900 p-4 rounded-xl border border-gray-800 space-y-2">
        <div class="flex justify-between">
          <span class="font-bold text-white">${item.author}</span>
          <span class="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300 capitalize">${item.niche}</span>
        </div>
        <div class="text-xs text-gray-500 flex justify-between pt-2 border-t border-gray-800">
          <span>Views: ${item.views ? item.views.toLocaleString() : 0}</span>
        </div>
      </div>
    `).join('');
  } catch (err) {
    grid.innerHTML = `<p class="text-red-400">Erro ao carregar ideias.</p>`;
  }
}
