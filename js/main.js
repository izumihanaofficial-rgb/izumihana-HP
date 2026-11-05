/* ============================================
   衣澄はな - HP
   Main JavaScript
   ============================================ */

/* --- YouTube API 設定 --- */
const YT_CONFIG = {
  apiKey: 'AIzaSyB5X4gIWIy8KSvvnfH1AdJvWZU7hDehyrk',
  playlistId: 'PLdPwo6ZghcrdyuU71MXsRsxhTW453ikLs',
  channelUrl: 'https://www.youtube.com/channel/UCELzzvRnGaEkKQrtYte62rw',
  maxResults: 50,
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initPetals();
  initReveal();

  const discoGrid = document.getElementById('disco-grid');
  if (discoGrid) loadDiscography(discoGrid);

  const latestVideoContainer = document.getElementById('latest-video');
  if (latestVideoContainer) loadLatestVideo(latestVideoContainer);
});

/* --- Header: スクロールで影をつける --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- スクロールでふわっと表示 --- */
let revealObserver = null;
function initReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');
  if (!elements.length) return;

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('visible'));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
  }
  elements.forEach((el) => revealObserver.observe(el));
}

/* --- モバイルメニュー --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-list');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.classList.remove('active');
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    toggle.classList.toggle('active', open);
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

/* --- 舞い落ちる花びら --- */
function initPetals() {
  if (prefersReducedMotion) return;
  const colors = ['#EBD3D3', '#CFE4E1', '#F1E0DF'];

  document.querySelectorAll('.petals').forEach((layer) => {
    const count = Number(layer.dataset.count || 8);
    for (let i = 0; i < count; i++) {
      const petal = document.createElement('div');
      petal.className = 'petal';
      const size = 12 + Math.random() * 9;
      const duration = 17 + Math.random() * 10;
      petal.style.left = `${((i + 0.5) / count) * 100 + (Math.random() * 6 - 3)}%`;
      petal.style.animationDuration = `${duration}s`;
      petal.style.animationDelay = `${-Math.random() * duration}s`;

      const sway = document.createElement('span');
      sway.style.animationDuration = `${5 + Math.random() * 4}s`;
      sway.innerHTML =
        `<svg width="${size}" height="${size * 0.78}" viewBox="0 0 18 14" aria-hidden="true">` +
        `<path d="M1 7C4 0 14 0 17 7C14 14 4 14 1 7Z" fill="${colors[i % colors.length]}"/></svg>`;

      petal.appendChild(sway);
      layer.appendChild(petal);
    }
  });
}

/* --- HTMLエスケープ --- */
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/* --- YouTube Data API: プレイリスト動画取得 --- */
async function fetchPlaylistItems() {
  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet,contentDetails` +
    `&maxResults=${YT_CONFIG.maxResults}` +
    `&playlistId=${YT_CONFIG.playlistId}` +
    `&key=${YT_CONFIG.apiKey}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
  const data = await res.json();

  return (data.items || [])
    .filter((item) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
    .sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
}

/* --- キャッシュ付きプレイリスト取得（30分TTL） --- */
const CACHE_KEY = 'yt_playlist_cache';
const CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchPlaylistItemsCached() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) return data;
    }
  } catch {
    /* キャッシュ読み取り失敗時は無視 */
  }

  const items = await fetchPlaylistItems();

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: items, timestamp: Date.now() }));
  } catch {
    /* ストレージ書き込み失敗は無視 */
  }
  return items;
}

function formatDate(isoString) {
  const d = new Date(isoString);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function getVideoId(item) {
  return item.contentDetails?.videoId || item.snippet.resourceId?.videoId;
}

function getThumbnail(item) {
  const t = item.snippet.thumbnails || {};
  return t.maxres?.url || t.high?.url || t.medium?.url || t.default?.url || '';
}

function iframeHtml(videoId, title) {
  return `<iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1" title="${title}"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen></iframe>`;
}

const PLAY_SVG = '<svg viewBox="0 0 12 14" aria-hidden="true"><path d="M1.5 1l9.5 6-9.5 6z"/></svg>';

/* --- 楽曲カード --- */
function createVideoCard(item, index, total) {
  const videoId = getVideoId(item);
  const title = escapeHtml(item.snippet.title);
  const date = formatDate(item.snippet.publishedAt);
  const no = String(total - index).padStart(2, '0');

  const card = document.createElement('article');
  card.className = 'disco-card reveal';
  card.style.transitionDelay = `${(index % 3) * 0.12}s`;
  card.innerHTML = `
    <div class="thumbnail" role="button" tabindex="0" aria-label="${title} を再生">
      <img src="${getThumbnail(item)}" alt="" loading="lazy">
      <span class="t-ring" aria-hidden="true"></span>
      <span class="t-ring" aria-hidden="true"></span>
      <span class="play">${PLAY_SVG}</span>
    </div>
    <div class="card-info">
      <span class="card-no">${no}</span>
      <div class="card-body">
        <h3 class="card-title">${title}</h3>
        <span class="card-meta">${date}</span>
      </div>
    </div>
  `;

  const thumb = card.querySelector('.thumbnail');
  let playing = false;
  const play = () => {
    if (playing) return;
    playing = true;
    thumb.innerHTML = iframeHtml(videoId, title);
  };
  thumb.addEventListener('click', play);
  thumb.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
  });

  return card;
}

function createSkeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="disco-card" aria-hidden="true">
        <div class="thumbnail skeleton"></div>
        <div class="card-info">
          <div class="card-body" style="width:100%">
            <div class="skeleton" style="height:1rem;width:80%;border-radius:4px;margin:6px 0"></div>
            <div class="skeleton" style="height:.75rem;width:40%;border-radius:4px"></div>
          </div>
        </div>
      </div>`;
  }
  return html;
}

/* --- Discography ページ --- */
async function loadDiscography(gridEl) {
  gridEl.innerHTML = createSkeletonCards(6);

  try {
    const items = await fetchPlaylistItemsCached();
    gridEl.innerHTML = '';

    if (items.length === 0) {
      gridEl.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:var(--sub)">動画がまだありません</p>';
      return;
    }

    items.forEach((item, i) => gridEl.appendChild(createVideoCard(item, i, items.length)));
    initReveal();
  } catch (err) {
    console.error('YouTube API fetch failed:', err);
    showFallbackEmbed(gridEl);
  }
}

function showFallbackEmbed(gridEl) {
  gridEl.style.display = 'block';
  gridEl.innerHTML = `
    <div style="max-width:880px;margin:0 auto">
      <div class="video-embed">
        <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${YT_CONFIG.playlistId}"
          title="衣澄はな - オリジナル曲プレイリスト"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen></iframe>
      </div>
    </div>`;
}

/* --- Top ページ: 最新動画 --- */
async function loadLatestVideo(container) {
  try {
    const items = await fetchPlaylistItemsCached();
    if (items.length === 0) return showLatestFallback(container);

    const latest = items[0];
    const videoId = getVideoId(latest);
    const title = escapeHtml(latest.snippet.title);

    container.innerHTML = `
      <div class="video-embed video-embed--lazy" role="button" tabindex="0" aria-label="${title} を再生">
        <img src="${getThumbnail(latest)}" alt="">
        <span class="play-circle">${PLAY_SVG}</span>
      </div>
      <p class="video-caption">${title}</p>
    `;

    const thumbEl = container.querySelector('.video-embed--lazy');
    let playing = false;
    const play = () => {
      if (playing) return;
      playing = true;
      thumbEl.classList.remove('video-embed--lazy');
      thumbEl.removeAttribute('role');
      thumbEl.removeAttribute('tabindex');
      thumbEl.innerHTML = iframeHtml(videoId, title);
    };
    thumbEl.addEventListener('click', play);
    thumbEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); }
    });
  } catch {
    showLatestFallback(container);
  }
}

function showLatestFallback(container) {
  container.innerHTML = `
    <div class="video-embed">
      <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=${YT_CONFIG.playlistId}"
        title="衣澄はな - 最新動画"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen></iframe>
    </div>
    <p class="video-caption"><a href="${YT_CONFIG.channelUrl}" target="_blank" rel="noopener">YouTube チャンネルで全ての楽曲を視聴 &rarr;</a></p>
  `;
}
