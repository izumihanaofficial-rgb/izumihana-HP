/* ============================================
   衣澄はな - HP / Portfolio
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
  initScrollAnimation();
  initMobileMenu();
  initHeroAnimation();
  initParallax();

  const discoGrid = document.getElementById('disco-grid');
  if (discoGrid) {
    loadDiscography(discoGrid);
  }

  const latestVideoContainer = document.getElementById('latest-video');
  if (latestVideoContainer) {
    loadLatestVideo(latestVideoContainer);
  }
});

/* --- Header scroll effect --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* --- Scroll fade-in animation --- */
function initScrollAnimation() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

/* --- Mobile menu toggle --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-list');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* --- Hero entrance animation (GSAP) --- */
function initHeroAnimation() {
  const subtitle = document.querySelector('.hero-content .subtitle');
  const h1 = document.querySelector('.hero-content h1');
  const description = document.querySelector('.hero-content .description');
  const scrollIndicator = document.querySelector('.hero-scroll');

  if (!subtitle || !h1) return;

  const targets = [subtitle, h1, description, scrollIndicator].filter(Boolean);

  if (prefersReducedMotion) {
    targets.forEach((el) => {
      el.style.visibility = 'visible';
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const tl = gsap.timeline({ delay: 0.3 });

  tl.fromTo(
    subtitle,
    { opacity: 0, y: 30, visibility: 'hidden' },
    { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' }
  )
    .fromTo(
      h1,
      { opacity: 0, y: 50, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 1, ease: 'power3.out' },
      '-=0.4'
    )
    .fromTo(
      description,
      { opacity: 0, y: 30, visibility: 'hidden' },
      { opacity: 1, y: 0, visibility: 'visible', duration: 0.8, ease: 'power3.out' },
      '-=0.5'
    )
    .fromTo(
      scrollIndicator,
      { opacity: 0, visibility: 'hidden' },
      { opacity: 0.7, visibility: 'visible', duration: 1, ease: 'power2.out' },
      '-=0.3'
    );
}

/* --- Parallax scroll effects (GSAP ScrollTrigger) --- */
function initParallax() {
  if (prefersReducedMotion) return;
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  gsap.registerPlugin(ScrollTrigger);

  const heroBg = document.querySelector('.hero-bg');
  const heroContent = document.querySelector('.hero-content');
  const heroScroll = document.querySelector('.hero-scroll');

  const isMobile = window.innerWidth < 768;

  if (heroBg) {
    gsap.to(heroBg, {
      yPercent: isMobile ? 15 : 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  if (heroContent) {
    gsap.to(heroContent, {
      y: isMobile ? 60 : 120,
      opacity: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: '80% top',
        scrub: true,
      },
    });
  }

  if (heroScroll) {
    gsap.to(heroScroll, {
      opacity: 0,
      y: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: '10% top',
        end: '30% top',
        scrub: true,
      },
    });
  }

  if (isMobile) return;

  document.querySelectorAll('.section').forEach((section) => {
    const title = section.querySelector('.section-title');
    const heading = section.querySelector('.section-heading');

    if (title) {
      gsap.fromTo(
        title,
        { y: 30 },
        {
          y: -10,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
          },
        }
      );
    }

    if (heading) {
      gsap.fromTo(
        heading,
        { y: 40 },
        {
          y: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
          },
        }
      );
    }
  });

  document.querySelectorAll('.about-detail-item').forEach((card, i) => {
    gsap.fromTo(
      card,
      { y: 20 + i * 10 },
      {
        y: -(10 + i * 5),
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 90%',
          end: 'top 30%',
          scrub: true,
        },
      }
    );
  });

  document.querySelectorAll('.sns-link').forEach((link, i) => {
    gsap.fromTo(
      link,
      { y: 20 + i * 5 },
      {
        y: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: '.sns-links',
          start: 'top 90%',
          end: 'top 40%',
          scrub: true,
        },
      }
    );
  });
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

  const items = (data.items || [])
    .filter((item) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
    .sort((a, b) => {
      const dateA = new Date(a.snippet.publishedAt);
      const dateB = new Date(b.snippet.publishedAt);
      return dateB - dateA;
    });

  return items;
}

/* --- キャッシュ付きプレイリスト取得（30分TTL） --- */
const CACHE_KEY = 'yt_playlist_cache';
const CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchPlaylistItemsCached() {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL_MS) {
        return data;
      }
    }
  } catch {
    /* キャッシュ読み取り失敗時は無視してAPI呼び出しへ */
  }

  const items = await fetchPlaylistItems();

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data: items, timestamp: Date.now() }));
  } catch {
    /* ストレージ書き込み失敗は無視 */
  }

  return items;
}

/* --- 日付フォーマット --- */
function formatDate(isoString) {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/* --- 動画カードHTML生成 --- */
function createVideoCard(item, index) {
  const videoId = item.contentDetails?.videoId || item.snippet.resourceId?.videoId;
  const title = item.snippet.title;
  const date = formatDate(item.snippet.publishedAt);
  const thumbnail =
    item.snippet.thumbnails?.maxres?.url ||
    item.snippet.thumbnails?.high?.url ||
    item.snippet.thumbnails?.medium?.url ||
    item.snippet.thumbnails?.default?.url ||
    '';

  const delayClass = `fade-in-delay-${Math.min((index % 6) + 1, 6)}`;

  const card = document.createElement('div');
  card.className = `disco-card fade-in ${delayClass}`;
  card.innerHTML = `
    <div class="thumbnail" data-video-id="${videoId}">
      <img src="${thumbnail}" alt="${title}" loading="lazy">
      <div class="play-overlay">
        <div class="play-btn">
          <svg viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      </div>
    </div>
    <div class="card-info">
      <div class="card-title">${title}</div>
      <div class="card-meta">${date}</div>
    </div>
  `;

  card.addEventListener('click', () => {
    const thumbEl = card.querySelector('.thumbnail');
    thumbEl.innerHTML = `
      <div style="position:absolute;inset:0;">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"
          title="${title}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          style="width:100%;height:100%;border:none;"
        ></iframe>
      </div>
    `;
  });

  return card;
}

/* --- ローディングスケルトン生成 --- */
function createSkeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    const delayClass = `fade-in-delay-${(i % 6) + 1}`;
    html += `
      <div class="disco-card fade-in visible ${delayClass}">
        <div class="thumbnail">
          <div class="skeleton-pulse" style="position:absolute;inset:0;background:linear-gradient(90deg,var(--bg-glass) 25%,var(--bg-glass-hover) 50%,var(--bg-glass) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;"></div>
        </div>
        <div class="card-info">
          <div style="height:1rem;width:80%;background:var(--bg-glass-hover);border-radius:4px;margin-bottom:0.5rem;"></div>
          <div style="height:0.75rem;width:40%;background:var(--border);border-radius:4px;"></div>
        </div>
      </div>
    `;
  }
  return html;
}

/* --- Discography ページ: 動画一覧を読み込み --- */
async function loadDiscography(gridEl) {
  gridEl.innerHTML = createSkeletonCards(6);

  if (YT_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    gridEl.innerHTML = '';
    showFallbackEmbed(gridEl);
    return;
  }

  try {
    const items = await fetchPlaylistItemsCached();

    gridEl.innerHTML = '';

    if (items.length === 0) {
      gridEl.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:4rem 0;color:var(--text-muted);">
          <p>動画がまだありません</p>
        </div>
      `;
      return;
    }

    items.forEach((item, i) => {
      gridEl.appendChild(createVideoCard(item, i));
    });

    initScrollAnimation();
  } catch (err) {
    console.error('YouTube API fetch failed:', err);
    gridEl.innerHTML = '';
    showFallbackEmbed(gridEl);
  }
}

/* --- フォールバック: API key未設定時はプレイリスト埋め込みで展開表示 --- */
function showFallbackEmbed(gridEl) {
  gridEl.style.display = 'block';
  gridEl.innerHTML = `
    <div class="fade-in visible" style="max-width:800px;margin:0 auto;">
      <div class="video-embed">
        <iframe
          src="https://www.youtube-nocookie.com/embed/videoseries?list=${YT_CONFIG.playlistId}"
          title="衣澄はな - オリジナル曲プレイリスト"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    </div>
  `;
}

/* --- Top ページ: 最新動画を読み込み（サムネイルクリックで展開） --- */
async function loadLatestVideo(container) {
  if (YT_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    showLatestFallback(container);
    return;
  }

  try {
    const items = await fetchPlaylistItemsCached();
    if (items.length === 0) {
      showLatestFallback(container);
      return;
    }

    const latest = items[0];
    const videoId = latest.contentDetails?.videoId || latest.snippet.resourceId?.videoId;
    const title = latest.snippet.title;
    const thumbnail =
      latest.snippet.thumbnails?.maxres?.url ||
      latest.snippet.thumbnails?.high?.url ||
      latest.snippet.thumbnails?.medium?.url ||
      latest.snippet.thumbnails?.default?.url ||
      '';

    container.innerHTML = `
      <div class="video-embed video-embed--lazy fade-in" id="latest-video-thumb" role="button" tabindex="0" aria-label="${title} を再生">
        <img src="${thumbnail}" alt="${title}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;">
        <div class="video-embed-play">
          <svg viewBox="0 0 68 48" width="68" height="48">
            <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55c-2.93.78-4.64 3.26-5.42 6.19C.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/>
            <path d="M45 24L27 14v20" fill="#fff"/>
          </svg>
        </div>
      </div>
      <p class="video-caption fade-in fade-in-delay-1">${title}</p>
    `;

    const thumbEl = document.getElementById('latest-video-thumb');
    const playHandler = () => {
      thumbEl.outerHTML = `
        <div class="video-embed fade-in visible">
          <iframe
            src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1"
            title="${title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      `;
    };
    thumbEl.addEventListener('click', playHandler);
    thumbEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); playHandler(); }
    });

    initScrollAnimation();
  } catch {
    showLatestFallback(container);
  }
}

function showLatestFallback(container) {
  container.innerHTML = `
    <div class="video-embed fade-in visible">
      <iframe
        src="https://www.youtube-nocookie.com/embed/videoseries?list=${YT_CONFIG.playlistId}"
        title="衣澄はな - 最新動画"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    <p class="video-caption fade-in visible fade-in-delay-1">
      <a href="${YT_CONFIG.channelUrl}" target="_blank" rel="noopener">
        YouTube チャンネルで全ての楽曲を視聴 &rarr;
      </a>
    </p>
  `;
}
