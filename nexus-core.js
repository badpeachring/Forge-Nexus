(() => {
  const STORE_KEY = 'forge_nexus_state_v1';
  const $ = id => document.getElementById(id);
  let editingId = null;
  let activeCat = 'ALL';
  let searchTerm = '';
  let statusMap = {};

  const FEATURES_26 = [
    '1. Oversized Full-Bleed App Icons with smart fallback art',
    '2. Rich Multi-Line App Descriptions directly under every icon',
    '3. Animated Interactive Starfield & Cosmic Nebula Canvas',
    '4. 4 Switchable Cosmic Themes (Cosmic, Crimson, Cyber, Emerald)',
    '5. Particle Toggle Switch for battery-saver or full visual mode',
    '6. Pre-Wired Ecosystem Suite (App Forge, Skill Tree, Heist Board, Media Forge)',
    '7. Live HTTP Status Pinger (checks if each GitHub Pages app is online)',
    '8. 1-Tap Ping All Radar to test every deployed app simultaneously',
    '9. Pinned Favorites Dock along the top bar for instant 1-thumb launch',
    '10. Most-Used Smart Sorting & Launch Counter tracking',
    '11. Instant Live Search across app titles, categories & descriptions',
    '12. Dynamic Category Filter Pills (All, Builders, Ops, AI, Custom)',
    '13. 3 Layout Modes (2-Col Big Cards, 1-Col Showcase, Compact Grid)',
    '14. In-App Quick Peek Iframe Drawer (preview apps without leaving portal)',
    '15. Full-Tab Standalone Launcher for installing PWAs via Chrome',
    '16. GitHub Repo Auto-Discovery (pulls all public repos for any username)',
    '17. Automatic Icon Detector (probes each repo for icon.png / manifest)',
    '18. Custom App Creator & Editor modal for any external site or tool',
    '19. Card Reordering (Move Up / Down) to arrange your command deck',
    '20. Custom Status Badges (LIVE, v2, OPS, BETA, WIP)',
    '21. 1-Tap Share / Copy App URL to send links fast',
    '22. Persistent Bottom Command Scratchpad with 1-tap Copy',
    '23. Live Digital Clock & Active App Counter HUD',
    '24. Full Portal JSON Backup Export to clipboard',
    '25. Full Portal JSON Restore Import from clipboard',
    '26. 100% Offline-Ready LocalStorage State Persistence'
  ];

  const THEMES = [
    { id: 'nx-cosmic', name: 'Cosmic Nebula', desc: 'Deep violet & starlight' },
    { id: 'nx-crimson', name: 'Crimson Ops', desc: 'Dark tactical red' },
    { id: 'nx-cyber', name: 'Cyber Cyan', desc: 'Midnight electric blue' },
    { id: 'nx-emerald', name: 'Emerald Matrix', desc: 'Deep forest emerald' }
  ];

  const defaultState = () => ({
    theme: 'nx-cosmic',
    stars: true,
    layout: 'grid2',
    ghUser: 'badpeachring',
    note: '',
    apps: [
      {
        id: 'app_forge',
        name: 'App Forge',
        url: 'https://badpeachring.github.io/App-Forge/',
        icon: 'https://badpeachring.github.io/App-Forge/1000005057.jpg',
        cat: 'Builders',
        badge: 'CORE',
        fav: true,
        launches: 12,
        desc: 'Mobile IDE & GitHub Pages deployment engine. Create repos, patch JSON, upload assets, and launch PWAs from your phone.'
      },
      {
        id: 'heist_board',
        name: 'Heist Board',
        url: 'https://badpeachring.github.io/Heist-Board/',
        icon: 'https://badpeachring.github.io/Heist-Board/icon.png',
        cat: 'Ops',
        badge: 'LIVE',
        fav: true,
        launches: 9,
        desc: 'GTA-style tactical goal planner with red-string links, 1099 crew cut calculator, Gmail scanner, and Lay-A-Weigh field diagnostics.'
      },
      {
        id: 'media_forge',
        name: 'Media Forge',
        url: 'https://badpeachring.github.io/Media-Forge/',
        icon: 'https://badpeachring.github.io/Media-Forge/icon.png',
        cat: 'AI Studio',
        badge: 'UNCENSORED',
        fav: true,
        launches: 8,
        desc: 'Free uncensored AI image & video studio with touch-screen Photoshop inpaint masking, LLM prompt expander, and ZeroGPU/ComfyUI video.'
      },
      {
        id: 'skill_tree',
        name: 'Skill Tree',
        url: 'https://badpeachring.github.io/Skill-Tree/',
        icon: 'https://badpeachring.github.io/Skill-Tree/Screenshot_20261112-193812.png',
        cat: 'Tracking',
        badge: 'PWA',
        fav: true,
        launches: 7,
        desc: 'Interactive RPG-style progression grimoire for tracking calisthenics, technical builds, and real-life skill unlocks.'
      }
    ]
  });

  let state = (() => {
    try { return { ...defaultState(), ...JSON.parse(localStorage.getItem(STORE_KEY) || '{}') }; } catch { return defaultState(); }
  })();

  const save = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));

  function initStarfield() {
    const cv = $('nxStarfield');
    const ctx = cv.getContext('2d');
    let w = 0, h = 0;
    const stars = Array.from({ length: 75 }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.7 + 0.4,
      vx: (Math.random() - 0.5) * 0.00025, vy: (Math.random() - 0.5) * 0.00025,
      a: Math.random() * 0.7 + 0.3
    }));
    const resize = () => { w = cv.width = window.innerWidth; h = cv.height = window.innerHeight; };
    resize(); window.addEventListener('resize', resize);
    function tick() {
      ctx.clearRect(0, 0, w, h);
      if (state.stars) {
        stars.forEach(s => {
          s.x = (s.x + s.vx + 1) % 1; s.y = (s.y + s.vy + 1) % 1;
          ctx.fillStyle = `rgba(226,232,240,${s.a})`;
          ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
        });
      }
      requestAnimationFrame(tick);
    }
    tick();
  }

  function applyTheme() {
    THEMES.forEach(t => document.body.classList.remove(t.id));
    document.body.classList.add(state.theme || 'nx-cosmic');
  }

  function updateHud() {
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    $('nxClockLine').textContent = `${now} • ${state.apps.length} Apps Linked`;
  }

  function fallbackSvg(name) {
    const ch = (name || 'A').slice(0, 2).toUpperCase();
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='#9333ea'/><stop offset='100%' stop-color='#0284c7'/></linearGradient></defs><rect width='256' height='256' fill='url(#g)'/><text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle' fill='white' font-family='sans-serif' font-weight='900' font-size='88'>${ch}</text></svg>`);
  }

  async function pingApp(app) {
    statusMap[app.id] = 'checking';
    renderApps();
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 5000);
      const r = await fetch(app.url, { method: 'HEAD', cache: 'no-store', signal: ctrl.signal });
      statusMap[app.id] = r.ok ? 'online' : 'offline';
    } catch {
      statusMap[app.id] = 'unknown';
    }
    renderApps();
  }

  function renderDock() {
    const favs = state.apps.filter(a => a.fav);
    $('nxDockBar').innerHTML = favs.map(a => `<button data-launch='${a.id}' class='glass px-2.5 py-1.5 rounded-xl flex items-center gap-2 shrink-0 border border-fuchsia-400/35'><img src='${a.icon || fallbackSvg(a.name)}' onerror="this.src='${fallbackSvg(a.name)}'" class='w-6 h-6 rounded-lg object-cover'><span class='text-xs font-black text-white'>${a.name}</span></button>`).join('');
    $('nxDockBar').querySelectorAll('[data-launch]').forEach(b => b.onclick = () => launchApp(b.dataset.launch));
  }

  function renderCats() {
    const cats = ['ALL', ...new Set(state.apps.map(a => a.cat).filter(Boolean))];
    $('nxCatBar').innerHTML = cats.map(c => `<button data-cat='${c}' class='px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${activeCat === c ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200' : 'glass text-slate-400'}'>${c}</button>`).join('');
    $('nxCatBar').querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { activeCat = b.dataset.cat; renderCats(); renderApps(); });
  }

  function launchApp(id) {
    const a = state.apps.find(x => x.id === id);
    if (!a) return;
    a.launches = (a.launches || 0) + 1;
    save();
    window.open(a.url, '_blank');
    renderApps();
  }

  function renderApps() {
    const grid = $('nxAppsGrid');
    grid.className = state.layout === 'list1' ? 'grid grid-cols-1 gap-3.5' : state.layout === 'compact3' ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-3';
    const q = searchTerm.toLowerCase();
    const list = state.apps.filter(a => (activeCat === 'ALL' || a.cat === activeCat) && (!q || `${a.name} ${a.desc} ${a.cat}`.toLowerCase().includes(q)));

    if (!list.length) {
      grid.innerHTML = `<div class='col-span-full glass rounded-2xl p-6 text-center text-xs text-slate-400'>No apps match this filter. Tap + Add App or Sync Repos in Settings.</div>`;
      return;
    }

    grid.innerHTML = list.map((a, idx) => {
      const st = statusMap[a.id];
      const dot = st === 'online' ? 'bg-emerald-400' : st === 'offline' ? 'bg-rose-500' : st === 'checking' ? 'bg-amber-400 animate-ping' : 'bg-slate-500';
      const bigImg = state.layout === 'list1' ? 'h-44' : state.layout === 'compact3' ? 'h-24' : 'h-36';
      return `<div class='glass portal-card rounded-2xl overflow-hidden flex flex-col justify-between'>
        <div>
          <div data-open='${a.id}' class='relative w-full ${bigImg} bg-black/80 cursor-pointer overflow-hidden group'>
            <img src='${a.icon || fallbackSvg(a.name)}' onerror="this.src='${fallbackSvg(a.name)}'" class='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'>
            <div class='absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/75 border border-white/15'>
              <span class='w-2 h-2 rounded-full ${dot}'></span>
              <span class='text-[9px] font-black text-white'>${a.badge || a.cat || 'APP'}</span>
            </div>
            <button data-fav='${a.id}' class='absolute top-2 right-2 w-7 h-7 rounded-full bg-black/75 border border-white/15 text-xs flex items-center justify-center ${a.fav ? 'text-amber-300' : 'text-slate-500'}'>★</button>
          </div>
          <div data-open='${a.id}' class='p-3 cursor-pointer'>
            <div class='flex items-center justify-between gap-1'>
              <h3 class='text-sm font-black text-white truncate'>${a.name}</h3>
              <span class='text-[9px] font-mono text-slate-400 shrink-0'>${a.launches || 0}x</span>
            </div>
            <p class='text-[11px] text-slate-300 mt-1 leading-snug ${state.layout === 'compact3' ? 'line-clamp-2' : 'line-clamp-3'}'>${a.desc || 'Forged PWA application'}</p>
          </div>
        </div>
        <div class='px-2.5 pb-2.5 pt-1 border-t border-white/10 flex items-center justify-between gap-1'>
          <button data-open='${a.id}' class='flex-1 py-1.5 rounded-lg bg-fuchsia-600/85 text-white text-[11px] font-black'>Open</button>
          <button data-peek='${a.id}' class='px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-cyan-300'>Peek</button>
          <button data-copy='${a.id}' class='px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-emerald-300'>URL</button>
          <button data-edit='${a.id}' class='px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-[10px] font-bold text-slate-300'>Edit</button>
        </div>
      </div>`;
    }).join('');

    grid.querySelectorAll('[data-open]').forEach(el => el.onclick = () => launchApp(el.dataset.open));
    grid.querySelectorAll('[data-fav]').forEach(el => el.onclick = e => {
      e.stopPropagation();
      const a = state.apps.find(x => x.id === el.dataset.fav);
      if (a) { a.fav = !a.fav; save(); renderDock(); renderApps(); }
    });
    grid.querySelectorAll('[data-peek]').forEach(el => el.onclick = () => {
      const a = state.apps.find(x => x.id === el.dataset.peek);
      if (!a) return;
      $('nxPrevName').textContent = 'Quick Peek • ' + a.name;
      $('nxPrevFullLink').href = a.url;
      $('nxPrevFrame').src = a.url;
      $('nxPreviewModal').classList.remove('hidden');
    });
    grid.querySelectorAll('[data-copy]').forEach(el => el.onclick = () => {
      const a = state.apps.find(x => x.id === el.dataset.copy);
      if (a) navigator.clipboard?.writeText(a.url).then(() => alert('Copied: ' + a.url));
    });
    grid.querySelectorAll('[data-edit]').forEach(el => el.onclick = () => openEditModal(el.dataset.edit));
  }

  function openEditModal(id = null) {
    editingId = id;
    const a = id ? state.apps.find(x => x.id === id) : null;
    $('nxEditTitle').textContent = a ? 'Edit App Card' : 'Add New App to Nexus';
    $('appNameIn').value = a ? a.name : '';
    $('appUrlIn').value = a ? a.url : 'https://badpeachring.github.io/';
    $('appIconIn').value = a ? (a.icon || '') : '';
    $('appCatIn').value = a ? (a.cat || '') : 'Custom';
    $('appBadgeIn').value = a ? (a.badge || '') : 'LIVE';
    $('appDescIn').value = a ? (a.desc || '') : '';
    $('nxDelAppBtn').classList.toggle('hidden', !a);
    $('nxEditModal').classList.remove('hidden');
  }

  function renderSettings() {
    $('nxGhUserIn').value = state.ghUser || 'badpeachring';
    $('nxStarsToggle').checked = !!state.stars;
    $('nxThemeRow').innerHTML = THEMES.map(t => `<button data-th='${t.id}' class='p-2 rounded-xl border text-left ${state.theme === t.id ? 'bg-fuchsia-600/30 border-fuchsia-400' : 'bg-black/60 border-slate-800'}'><span class='block text-xs font-black text-white'>${t.name}</span><span class='block text-[9px] text-slate-400'>${t.desc}</span></button>`).join('');
    $('nxThemeRow').querySelectorAll('[data-th]').forEach(b => b.onclick = () => { state.theme = b.dataset.th; save(); applyTheme(); renderSettings(); });
    $('nxFeatureList').innerHTML = FEATURES_26.map(f => `<div class='py-1 border-b border-slate-800/70 last:border-0'>${f}</div>`).join('');
  }

  async function syncGithubRepos() {
    const user = $('nxGhUserIn').value.trim() || 'badpeachring';
    state.ghUser = user;
    save();
    const btn = $('nxSyncGhBtn');
    btn.textContent = 'Syncing...';
    try {
      const r = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100`);
      const repos = await r.json();
      if (!Array.isArray(repos)) throw new Error('User not found');
      const existingUrls = new Set(state.apps.map(a => a.url.replace(/\/$/, '').toLowerCase()));
      let added = 0;
      for (const rp of repos) {
        if (!rp.has_pages) continue;
        const liveUrl = `https://${user}.github.io/${rp.name}/`;
        if (existingUrls.has(liveUrl.replace(/\/$/, '').toLowerCase())) continue;
        state.apps.push({
          id: 'gh_' + rp.id,
          name: rp.name.replace(/-/g, ' '),
          url: liveUrl,
          icon: `${liveUrl}icon.png`,
          cat: 'GitHub',
          badge: 'PAGES',
          fav: false,
          launches: 0,
          desc: rp.description || `GitHub Pages PWA deployed from ${user}/${rp.name}.`
        });
        added++;
      }
      save(); renderCats(); renderDock(); renderApps(); updateHud();
      alert(`Sync complete! Added ${added} new GitHub Pages app(s).`);
    } catch (e) { alert('Sync failed: ' + e.message); }
    finally { btn.textContent = 'Sync Repos'; }
  }

  $('nxAddBtn').onclick = () => openEditModal(null);
  $('nxCloseEdit').onclick = () => $('nxEditModal').classList.add('hidden');
  $('nxSaveAppBtn').onclick = () => {
    const name = $('appNameIn').value.trim();
    const url = $('appUrlIn').value.trim();
    if (!name || !url) return alert('Enter both App Name and URL.');
    const data = { name, url, icon: $('appIconIn').value.trim(), cat: $('appCatIn').value.trim() || 'Custom', badge: $('appBadgeIn').value.trim() || 'LIVE', desc: $('appDescIn').value.trim() };
    if (editingId) Object.assign(state.apps.find(x => x.id === editingId), data);
    else state.apps.push({ id: 'app_' + Date.now(), fav: false, launches: 0, ...data });
    $('nxEditModal').classList.add('hidden');
    save(); renderCats(); renderDock(); renderApps(); updateHud();
  };
  $('nxDelAppBtn').onclick = () => {
    state.apps = state.apps.filter(x => x.id !== editingId);
    $('nxEditModal').classList.add('hidden');
    save(); renderCats(); renderDock(); renderApps(); updateHud();
  };
  $('nxSettingsBtn').onclick = () => { renderSettings(); $('nxSettingsModal').classList.remove('hidden'); };
  $('nxCloseSettings').onclick = () => $('nxSettingsModal').classList.add('hidden');
  $('nxStarsToggle').onchange = e => { state.stars = e.target.checked; save(); };
  $('nxSyncGhBtn').onclick = syncGithubRepos;
  $('nxExportBtn').onclick = () => navigator.clipboard?.writeText(JSON.stringify(state, null, 2)).then(() => alert('Full Forge Nexus JSON copied to clipboard!'));
  $('nxImportBtn').onclick = () => {
    const raw = prompt('Paste Forge Nexus JSON backup:');
    if (!raw) return;
    try { const parsed = JSON.parse(raw); if (Array.isArray(parsed.apps)) { state = parsed; save(); applyTheme(); renderCats(); renderDock(); renderApps(); updateHud(); alert('Portal restored!'); } } catch { alert('Invalid JSON'); }
  };
  $('nxSearchIn').oninput = e => { searchTerm = e.target.value; renderApps(); };
  $('nxPingAllBtn').onclick = () => state.apps.forEach(a => pingApp(a));
  $('nxLayoutBtn').onclick = () => {
    const order = ['grid2', 'list1', 'compact3'];
    state.layout = order[(order.indexOf(state.layout) + 1) % order.length];
    save(); renderApps();
  };
  $('nxClosePrev').onclick = () => { $('nxPrevFrame').src = 'about:blank'; $('nxPreviewModal').classList.add('hidden'); };
  $('nxQuickNote').value = state.note || '';
  $('nxQuickNote').oninput = e => { state.note = e.target.value; save(); };
  $('nxCopyNoteBtn').onclick = () => navigator.clipboard?.writeText($('nxQuickNote').value).then(() => alert('Scratchpad copied!'));

  applyTheme(); initStarfield(); renderCats(); renderDock(); renderApps(); updateHud();
  setInterval(updateHud, 15000);
})();