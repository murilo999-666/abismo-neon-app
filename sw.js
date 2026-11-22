// cache offline do Abismo Neon 2 (gerado)
const CACHE = 'abismo-neon-eb0e0a8503';
const ARQUIVOS = ["./","index.html","manifest.webmanifest","icone-180.png","icone-192.png","icone-512.png"];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const pagina = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  if (pagina) {
    // com internet: confere se tem versão nova (304 se não tiver); sem internet ou demorando: abre a do aparelho
    const daRede = fetch(e.request, { cache: 'no-cache' }).then((r) => {
      if (r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put('index.html', c)); }
      return r;
    });
    const doCache = caches.match('index.html');
    e.respondWith(new Promise((ok) => {
      let feito = false;
      const usar = (r) => { if (!feito && r) { feito = true; ok(r); } };
      const t = setTimeout(() => doCache.then(usar), 2500);
      daRede.then((r) => { clearTimeout(t); usar(r); }).catch(() => doCache.then((r) => usar(r || Response.error())));
    }));
    return;
  }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then((r) => r || fetch(e.request)));
});
