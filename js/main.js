/* ============================================
   KUDLA Z BRNA — v2 JavaScript
   Parallax, scroll reveal, lightbox, nav
   ============================================ */
// XSS sanitizer — escape HTML entities in user/JSON data
function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}
// Escape for safe use inside HTML attribute values (onclick, etc.)
function escAttr(str) {
  if (!str) return '';
  return str.replace(/[&"'<>]/g, c => ({'&':'&amp;','"':'&quot;',"'":'&#39;','<':'&lt;','>':'&gt;'}[c]));
}
// Validate YouTube ID (11 chars, alphanumeric + dash/underscore)
function isValidYtId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_-]{11}$/.test(id);
}

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initParallax();
  initReveal();
  initLightbox();
  setActiveNav();
  initScrollTop();
  injectSkeletons();
  initDataLoading();
  registerSW();
});

// Service Worker registration
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function initHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const check = () => header.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', check, { passive: true });
  check();
}

function initMobileNav() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  const overlay = document.querySelector('.nav-overlay');
  if (!toggle || !nav) return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'main-nav');
  const close = () => { toggle.classList.remove('active'); nav.classList.remove('open'); overlay && overlay.classList.remove('active'); document.body.style.overflow = ''; toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); };
  const open = () => { toggle.classList.add('active'); nav.classList.add('open'); overlay && overlay.classList.add('active'); document.body.style.overflow = 'hidden'; toggle.setAttribute('aria-expanded', 'true'); const firstLink = nav.querySelector('a'); if (firstLink) firstLink.focus(); };
  toggle.addEventListener('click', () => nav.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) { close(); return; }
    if (e.key === 'Tab' && nav.classList.contains('open')) {
      const focusable = [toggle, ...nav.querySelectorAll('a')];
      const first = focusable[0]; const last = focusable[focusable.length - 1];
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    }
  });
}

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight * 1.5) {
          heroBg.style.transform = `translateY(${scrolled * 0.35}px) scale(1.05)`;
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  elements.forEach(el => observer.observe(el));
}

function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;
  const img = lightbox.querySelector('img');
  const closeBtn = lightbox.querySelector('.lightbox-close');
  const prevBtn = lightbox.querySelector('.lightbox-prev');
  const nextBtn = lightbox.querySelector('.lightbox-next');
  // Create counter element
  let counter = lightbox.querySelector('.lightbox-counter');
  if (!counter) {
    counter = document.createElement('span');
    counter.className = 'lightbox-counter';
    counter.setAttribute('aria-live', 'polite');
    lightbox.appendChild(counter);
  }
  const items = document.querySelectorAll('.gallery-item');
  let current = 0;
  let lastFocused = null;
  const images = [];
  items.forEach((item, i) => {
    const itemImg = item.querySelector('img');
    if (itemImg) {
      images.push(itemImg.dataset.full || itemImg.src);
      const openLB = () => { lastFocused = document.activeElement; current = i; show(current); lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; if (closeBtn) closeBtn.focus(); };
      item.addEventListener('click', openLB);
      item.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLB(); } });
    }
  });
  function show(idx) { if (images[idx]) { img.src = images[idx]; counter.textContent = (idx + 1) + ' / ' + images.length; } }
  function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; if (lastFocused) lastFocused.focus(); }

  // Focus trap inside lightbox
  function trapFocus(e) {
    if (!lightbox.classList.contains('active') || e.key !== 'Tab') return;
    const focusable = lightbox.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }
  document.addEventListener('keydown', trapFocus);

  closeBtn && closeBtn.addEventListener('click', closeLB);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLB(); });
  prevBtn && prevBtn.addEventListener('click', e => { e.stopPropagation(); current = (current - 1 + images.length) % images.length; show(current); });
  nextBtn && nextBtn.addEventListener('click', e => { e.stopPropagation(); current = (current + 1) % images.length; show(current); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLB();
    if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
    if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
  });
}

function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a, .footer-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
  });
}

// ============================================
// DATA LOADING & RENDERING
// ============================================

async function loadJSON(path, retries = 1) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Could not load ${path} (attempt ${i + 1}):`, e.message);
      if (i < retries) await new Promise(r => setTimeout(r, 1000));
    }
  }
  return null;
}

// Format date from ISO string to Czech format
const MONTHS_CS = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];
const MONTHS_FULL = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
const DAYS_CS = ['neděle','pondělí','úterý','středa','čtvrtek','pátek','sobota'];

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.getDate(),
    monthYear: MONTHS_CS[d.getMonth()] + ' ' + d.getFullYear()
  };
}

function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

// Concert venue string (handles new city field) — escaped
function concertVenueStr(c) {
  if (c.city) return esc(c.venue) + ', ' + esc(c.city);
  return esc(c.venue);
}

// Czech plural for "den/dny/dní"
function daysPlural(n) {
  if (n === 1) return 'den';
  if (n >= 2 && n <= 4) return 'dny';
  return 'dní';
}

// Countdown text for upcoming concert
function countdownText(dateStr) {
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = target - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return '';
  if (diffDays === 0) return 'DNES!';
  if (diffDays === 1) return 'Zítra';
  if (diffDays <= 7) {
    const dayName = DAYS_CS[target.getDay()];
    return 'Tento ' + dayName;
  }
  if (diffDays <= 30) return 'Za ' + diffDays + ' ' + daysPlural(diffDays);
  return '';
}

// Type badge icons
const TYPE_ICONS = { koncert:'fa-guitar', festival:'fa-music', akce:'fa-glass-cheers', moderovani:'fa-microphone' };

// HOMEPAGE — featured next concert + list
async function loadConcerts() {
  const container = document.getElementById('concerts-list');
  if (!container) return;

  const data = await loadJSON('data/concerts.json');
  if (!data) { container.innerHTML = '<p role="alert" style="color:var(--grey);text-align:center;padding:2rem 0;">Koncerty se nepodařilo načíst. <a href="javascript:location.reload()" style="color:var(--accent-bright)">Zkusit znovu</a></p>'; return; }
  window._concertsData = data;

  if (!data.upcoming || data.upcoming.length === 0) {
    container.innerHTML = '<p style="color:var(--grey);text-align:center;padding:2rem 0;">Žádné nadcházející koncerty. Sledujte sociální sítě.</p>';
    return;
  }

  const next = data.upcoming[0];
  const rest = data.upcoming.slice(1, 4);
  const fd = formatDate(next.date);
  const cd = countdownText(next.date);
  const d = new Date(next.date);

  const nextHasDetail = next.description || next.venueUrl || next.eventUrl;
  let html = `
    <div class="next-concert-card reveal${nextHasDetail ? ' clickable' : ''}" ${nextHasDetail ? `onclick="openConcertDetail('${escAttr(next.id)}')"` : ''} style="cursor:${nextHasDetail ? 'pointer' : 'default'}">
      <div class="next-concert-date">
        <span class="next-day">${fd.day}</span>
        <span class="next-month">${MONTHS_FULL[d.getMonth()]}</span>
        ${cd ? `<span class="next-countdown">${cd}</span>` : ''}
      </div>
      <div class="next-concert-body">
        <div class="next-concert-meta">
          ${next.type ? `<span class="concert-type-tag ${next.type}"><i class="fas ${TYPE_ICONS[next.type] || 'fa-guitar'}"></i> ${next.type === 'koncert' ? 'Koncert' : next.type === 'festival' ? 'Festival' : next.type === 'moderovani' ? 'Moderování' : 'Akce'}</span>` : ''}
          ${next.time ? `<span class="concert-time"><i class="fas fa-clock"></i> ${next.time}</span>` : ''}
        </div>
        <h3 class="next-concert-title">${esc(next.title)}</h3>
        <p class="next-concert-venue"><i class="fas fa-map-marker-alt"></i> ${concertVenueStr(next)}</p>
        ${next.note ? `<p class="next-concert-note">${esc(next.note)}</p>` : ''}
        <div class="next-concert-actions">
          ${next.ticketUrl ? `<a href="${next.ticketUrl}" class="btn btn-primary btn-sm" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()"><i class="fas fa-ticket-alt"></i> Vstupenky</a>` : ''}
          ${nextHasDetail ? `<span class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); openConcertDetail('${escAttr(next.id)}')"><i class="fas fa-info-circle"></i> Detail</span>` : ''}
        </div>
      </div>
    </div>`;

  // Remaining concerts (compact list)
  if (rest.length > 0) {
    html += '<div class="upcoming-list reveal">';
    rest.forEach(c => {
      const rfd = formatDate(c.date);
      const hasDetail = c.description || c.venueUrl || c.eventUrl;
      html += `
        <div class="concert-item${hasDetail ? ' clickable' : ''}" ${hasDetail ? `onclick="openConcertDetail('${escAttr(c.id)}')"` : ''}>
          <div class="concert-date">
            <span class="day">${rfd.day}</span>
            <span class="month-year">${rfd.monthYear}</span>
          </div>
          <div class="concert-info">
            <h3>${esc(c.title)}</h3>
            <p class="venue"><i class="fas fa-map-marker-alt"></i> ${concertVenueStr(c)}</p>
          </div>
          <div class="concert-link">
            ${hasDetail ? '<span class="concert-detail-btn"><i class="fas fa-info-circle"></i></span>' : ''}
          </div>
        </div>`;
    });
    html += '</div>';
  }

  container.innerHTML = html;
  // Re-init reveal for new elements
  container.querySelectorAll('.reveal').forEach(el => {
    el.classList.add('visible');
  });
  initConcertKeyboard();
}

// CONCERTS FULL (for koncerty.html)
async function loadConcertsFull() {
  const upcomingContainer = document.getElementById('concerts-upcoming');
  const pastContainer = document.getElementById('concerts-past');
  if (!upcomingContainer && !pastContainer) return;

  const data = await loadJSON('data/concerts.json');
  if (!data) {
    if (upcomingContainer) upcomingContainer.innerHTML = '<p role="alert" style="color:var(--grey);text-align:center;padding:2rem 0;">Koncerty se nepodařilo načíst. <a href="javascript:location.reload()" style="color:var(--accent-bright)">Zkusit znovu</a></p>';
    return;
  }
  window._concertsData = data;

  if (upcomingContainer && data.upcoming) {
    let html = '';
    data.upcoming.forEach(c => {
      const fd = formatDate(c.date);
      const cd = countdownText(c.date);
      const hasDetail = c.description || c.venueUrl || c.eventUrl;
      html += `
        <div class="concert-item${hasDetail ? ' clickable' : ''}" ${hasDetail ? `onclick="openConcertDetail('${escAttr(c.id)}')"` : ''}>
          <div class="concert-date">
            <span class="day">${fd.day}</span>
            <span class="month-year">${fd.monthYear}</span>
          </div>
          <div class="concert-info">
            <h3>${esc(c.title)}</h3>
            <p class="venue">
              <i class="fas fa-map-marker-alt"></i> ${concertVenueStr(c)}
              ${c.time ? ` <span style="margin-left:0.5rem;"><i class="fas fa-clock"></i> ${esc(c.time)}</span>` : ''}
            </p>
            ${c.note ? `<p class="venue">${esc(c.note)}</p>` : ''}
            ${cd ? `<span class="concert-countdown-badge">${cd}</span>` : ''}
          </div>
          <div class="concert-link">
            ${hasDetail ? '<span class="concert-detail-btn"><i class="fas fa-info-circle"></i></span>' : ''}
          </div>
        </div>`;
    });
    upcomingContainer.innerHTML = html || '<p style="color:var(--grey);">Žádné nadcházející koncerty.</p>';
    initConcertKeyboard();
  }

  // Inject structured data for SEO
  injectConcertJsonLd(data);

  if (pastContainer && data.past) {
    const byYear = {};
    data.past.forEach(c => {
      const year = new Date(c.date).getFullYear();
      if (!byYear[year]) byYear[year] = [];
      byYear[year].push(c);
    });
    let html = '';
    Object.keys(byYear).sort((a,b) => b-a).forEach(year => {
      html += `<h3 class="year-header">${year}</h3>`;
      byYear[year].forEach(c => {
        const fd = formatDate(c.date);
        html += `
          <div class="concert-item past">
            <div class="concert-date">
              <span class="day">${fd.day}</span>
              <span class="month-year">${fd.monthYear}</span>
            </div>
            <div class="concert-info">
              <h3>${esc(c.title)}</h3>
              <p class="venue"><i class="fas fa-map-marker-alt"></i> ${concertVenueStr(c)}</p>
            </div>
          </div>`;
      });
    });
    pastContainer.innerHTML = html || '<p style="color:var(--grey);">Žádné koncerty v archivu.</p>';
  }
}

// VIDEOS — interactive thumbnail cards with lazy iframe load
function videoThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}
function videoThumbMax(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}
function playVideo(el) {
  const wrapper = el.closest('.video-thumb');
  if (!wrapper) return;
  const id = wrapper.dataset.ytId;
  if (!id || !isValidYtId(id)) return;
  wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="Video" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
}

// HOMEPAGE — bento layout with top 5 videos
async function loadVideoTeaser() {
  const bento = document.getElementById('video-bento');
  if (!bento) return;

  const data = await loadJSON('data/videos.json');
  if (!data) return;

  // Collect all: featured + first 4 from grid (top 5 total)
  const all = [];
  if (data.featured && data.featured.youtubeId) all.push(data.featured);
  if (data.videos) data.videos.filter(v => v.youtubeId).forEach(v => all.push(v));
  const top5 = all.slice(0, 5);
  if (top5.length === 0) return;

  const big = top5[0];
  const small = top5.slice(1);

  const playBtn = `<button class="video-play-btn" onclick="playVideo(this)" aria-label="Přehrát"><svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg></button>`;

  bento.innerHTML = `
    <div class="bento-hero">
      <div class="video-thumb bento-main" data-yt-id="${big.youtubeId}" onclick="playVideo(this)">
        <img src="${videoThumbMax(big.youtubeId)}" alt="${esc(big.title)}" width="1280" height="720" loading="lazy" decoding="async"
             onerror="this.src='${videoThumb(big.youtubeId)}'">
        ${playBtn}
        <div class="bento-main-info">
          <span class="bento-rank">#1</span>
          <h3>${esc(big.title)}</h3>
          <span class="video-views"><i class="fas fa-eye"></i> ${esc(big.description || big.views || '')}</span>
        </div>
      </div>
    </div>
    <div class="bento-side">
      ${small.map((v, i) => `
        <div class="video-thumb bento-item" data-yt-id="${v.youtubeId}" onclick="playVideo(this)">
          <img src="${videoThumb(v.youtubeId)}" alt="${esc(v.title)}" width="480" height="360" loading="lazy" decoding="async">
          ${playBtn}
          <div class="bento-item-info">
            <span class="bento-rank">#${i + 2}</span>
            <h3>${esc(v.title)}</h3>
            ${v.views ? `<span class="video-views"><i class="fas fa-eye"></i> ${esc(v.views)}</span>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
}
async function loadVideos() {
  const featuredEl = document.getElementById('video-featured');
  const gridEl = document.getElementById('video-grid');
  if (!featuredEl && !gridEl) return;

  const data = await loadJSON('data/videos.json');
  if (!data) {
    if (featuredEl) featuredEl.innerHTML = '<p role="alert" style="color:var(--grey);text-align:center;padding:2rem 0;">Videa se nepodařilo načíst. <a href="javascript:location.reload()" style="color:var(--accent-bright)">Zkusit znovu</a></p>';
    return;
  }

  if (featuredEl && data.featured && data.featured.youtubeId) {
    const f = data.featured;
    featuredEl.innerHTML = `
      <div class="video-thumb video-thumb--featured" data-yt-id="${f.youtubeId}">
        <img src="${videoThumb(f.youtubeId)}" alt="${esc(f.title)}" width="480" height="360" loading="lazy" decoding="async">
        <button class="video-play-btn" onclick="playVideo(this)" aria-label="Přehrát video">
          <svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>
        </button>
        <div class="video-thumb-info">
          <h3>${esc(f.title)}</h3>
          <span class="video-views"><i class="fas fa-eye"></i> ${esc(f.description)}</span>
        </div>
      </div>`;
  }

  if (gridEl && data.videos) {
    const validVideos = data.videos.filter(v => v.youtubeId);
    if (validVideos.length > 0) {
      gridEl.innerHTML = validVideos.map(v => `
        <div class="video-card">
          <div class="video-thumb" data-yt-id="${v.youtubeId}">
            <img src="${videoThumb(v.youtubeId)}" alt="${esc(v.title)}" width="480" height="360" loading="lazy" decoding="async">
            <button class="video-play-btn" onclick="playVideo(this)" aria-label="Přehrát video">
              <svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>
            </button>
            ${v.views ? `<span class="video-badge"><i class="fas fa-eye"></i> ${v.views}</span>` : ''}
          </div>
          <div class="video-card-info">
            <h3>${esc(v.title)}</h3>
            <p>${esc(v.description)}</p>
          </div>
        </div>`).join('');
    }
  }

  // Inject VideoObject JSON-LD for media page
  if (gridEl) {
    const allVids = [];
    if (data.featured && data.featured.youtubeId) allVids.push(data.featured);
    if (data.videos) data.videos.filter(v => v.youtubeId).forEach(v => allVids.push(v));
    if (allVids.length > 0) {
      const videoLd = allVids.slice(0, 8).map(v => ({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": v.title,
        "description": v.description || v.title,
        "thumbnailUrl": `https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg`,
        "embedUrl": `https://www.youtube.com/embed/${v.youtubeId}`,
        "url": `https://www.youtube.com/watch?v=${v.youtubeId}`,
        "uploadDate": v.date || "2024-01-01",
        "author": { "@type": "MusicGroup", "name": "Kudla z Brna" }
      }));
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(videoLd);
      document.head.appendChild(s);
    }
  }
}

// GALLERY
async function loadGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  const data = await loadJSON('data/gallery.json');
  if (!data || !data.photos || data.photos.length === 0) {
    grid.innerHTML = '<p style="color:var(--grey);text-align:center;grid-column:1/-1;padding:3rem;">Fotogalerie se připravuje.</p>';
    return;
  }

  grid.innerHTML = data.photos.map((p, i) => {
    const webpSrc = p.src.replace(/\.jpg$/, '.webp');
    return `
    <div class="gallery-item" role="button" tabindex="0" aria-label="Zobrazit fotografii ${i + 1}">
      <picture>
        <source type="image/webp" srcset="${webpSrc}">
        <img src="${p.src}" alt="${esc(p.alt)}" loading="lazy" decoding="async" onerror="this.closest('.gallery-item').style.display='none'">
      </picture>
    </div>`;
  }).join('');

  // Re-init lightbox after dynamic load
  initLightbox();

  // Inject ImageGallery JSON-LD
  if (data.photos.length > 0) {
    const galleryLd = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": "Fotogalerie — Kudla z Brna",
      "description": "Černobílé koncertní fotografie Kudly z Brna",
      "url": "https://kudlazbrna.netlify.app/foto.html",
      "numberOfItems": data.photos.length,
      "author": { "@type": "MusicGroup", "name": "Kudla z Brna" }
    };
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(galleryLd);
    document.head.appendChild(s);
  }
}

// SHOP
async function loadShop() {
  const grid = document.getElementById('shop-grid');
  const shippingEl = document.getElementById('shipping-info');
  if (!grid) return;

  const data = await loadJSON('data/shop.json');
  if (!data) {
    grid.innerHTML = '<p role="alert" style="color:var(--grey);text-align:center;padding:2rem 0;">Obchod se nepodařilo načíst. <a href="javascript:location.reload()" style="color:var(--accent-bright)">Zkusit znovu</a></p>';
    return;
  }
  window._shopData = data;

  if (data.albums) {
    grid.innerHTML = data.albums.map((a, i) => {
      const webpSrc = a.image.replace(/\.jpg$/, '.webp');
      return `
      <div class="album-card">
        <div class="album-cover">
          <picture>
            <source type="image/webp" srcset="${webpSrc}">
            <img src="${a.image}" alt="${esc(a.title)}" width="800" height="793" loading="lazy" decoding="async" onerror="this.closest('.album-cover').innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--grey);\\'><i class=\\'fas fa-compact-disc\\' style=\\'font-size:3rem;\\'></i></div>'">
          </picture>
        </div>
        <div class="album-info">
          <h3>${esc(a.title)}</h3>
          <p class="album-desc">${esc(a.description)}</p>
          <p class="album-price">${a.price} Kč <span class="album-shipping">+ ${a.shipping} Kč poštovné</span></p>
          <button class="btn btn-primary" onclick="openOrderForm('${escAttr(a.title)}', ${i})">
            <i class="fas fa-shopping-cart"></i> Objednat
          </button>
        </div>
      </div>`}).join('');
  }

  if (shippingEl && data.shippingNote) {
    shippingEl.innerHTML = `<i class="fas fa-truck"></i> ${data.shippingNote}`;
  }
}

// ORDER FORM
let _orderModalTrigger = null;
function orderModalKeyHandler(e) {
  const modal = document.getElementById('order-modal');
  if (!modal) return;
  if (e.key === 'Escape') { closeOrderForm(); return; }
  if (e.key === 'Tab') {
    const focusable = modal.querySelectorAll('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }
}
function openOrderForm(albumTitle, albumIndex) {
  // Remove existing modal if any
  const existing = document.getElementById('order-modal');
  if (existing) existing.remove();
  _orderModalTrigger = document.activeElement;

  const modal = document.createElement('div');
  modal.id = 'order-modal';
  modal.className = 'order-modal';
  modal.innerHTML = `
    <div class="order-modal-backdrop" onclick="closeOrderForm()"></div>
    <div class="order-modal-content">
      <button class="order-modal-close" onclick="closeOrderForm()" aria-label="Zavřít">&times;</button>
      <h3><i class="fas fa-compact-disc"></i> Objednávka CD</h3>
      <p class="order-album-title">${esc(albumTitle)}</p>
      <form id="order-form" onsubmit="submitOrder(event, ${albumIndex})">
        <input type="hidden" name="album" value="${escAttr(albumTitle)}">
        <div class="form-group">
          <label for="order-name">Jméno a příjmení *</label>
          <input type="text" id="order-name" name="name" required placeholder="Jan Novák">
        </div>
        <div class="form-group">
          <label for="order-email">E-mail *</label>
          <input type="email" id="order-email" name="email" required placeholder="jan@email.cz">
        </div>
        <div class="form-group">
          <label for="order-address">Adresa pro zaslání *</label>
          <textarea id="order-address" name="address" required rows="3" placeholder="Ulice 123&#10;602 00 Brno"></textarea>
        </div>
        <div class="form-group">
          <label for="order-note">Poznámka</label>
          <input type="text" id="order-note" name="note" placeholder="Např. věnování, počet kusů...">
        </div>
        <button type="submit" class="btn btn-primary btn-full">
          <i class="fas fa-paper-plane"></i> Odeslat objednávku
        </button>
      </form>
      <div id="order-success" class="order-success" style="display:none">
        <i class="fas fa-check-circle"></i>
        <h4>Objednávka odeslána!</h4>
        <p>Kudla se vám ozve na zadaný e-mail s platebními údaji.</p>
        <button class="btn btn-primary" onclick="closeOrderForm()">Zavřít</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('active'));
  document.getElementById('order-name').focus();
  document.addEventListener('keydown', orderModalKeyHandler);
}

function closeOrderForm() {
  const modal = document.getElementById('order-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.removeEventListener('keydown', orderModalKeyHandler);
  if (_orderModalTrigger) { _orderModalTrigger.focus(); _orderModalTrigger = null; }
}

function submitOrder(e, albumIndex) {
  e.preventDefault();
  const form = e.target;
  const album = form.album.value;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const address = form.address.value.trim();
  const note = form.note.value.trim();

  const shopData = window._shopData;
  const orderEmail = shopData && shopData.albums && shopData.albums[albumIndex] ? shopData.albums[albumIndex].orderEmail : 'm.kudlicka@seznam.cz';

  const subject = encodeURIComponent('Objednávka CD: ' + album);
  const body = encodeURIComponent(
    'Nová objednávka z webu kudlazbrna.cz\n' +
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n' +
    'CD: ' + album + '\n' +
    'Jméno: ' + name + '\n' +
    'E-mail: ' + email + '\n' +
    'Adresa:\n' + address +
    (note ? '\n\nPoznámka: ' + note : '') +
    '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
    'Odesláno z webu kudlazbrna.cz'
  );

  // Open email client with pre-filled data
  window.location.href = `mailto:${orderEmail}?subject=${subject}&body=${body}`;

  // Show success state
  form.style.display = 'none';
  document.getElementById('order-success').style.display = 'flex';
}

// CONCERT DETAIL MODAL
function openConcertDetail(concertId) {
  const data = window._concertsData;
  if (!data) return;
  const all = [...(data.upcoming || []), ...(data.past || [])];
  const c = all.find(x => x.id === concertId);
  if (!c) return;

  const existing = document.getElementById('concert-modal');
  if (existing) existing.remove();

  const d = new Date(c.date);
  const dayName = DAYS_CS[d.getDay()];
  const dateStr = d.getDate() + '. ' + MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear();
  const cd = countdownText(c.date);
  const typeLabel = c.type === 'koncert' ? 'Koncert' : c.type === 'festival' ? 'Festival' : c.type === 'akce' ? 'Akce' : 'Událost';
  const icon = TYPE_ICONS[c.type] || 'fa-guitar';

  // Google Maps link for venue
  const mapQuery = encodeURIComponent((c.venue ? c.venue + ', ' : '') + (c.city || ''));
  const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' + mapQuery;

  // Google Calendar link
  const calDate = c.date.replace(/-/g, '');
  const calTimeStart = c.time ? c.time.replace(':', '') + '00' : '190000';
  const calHour = c.time ? parseInt(c.time.split(':')[0]) : 19;
  const calTimeEnd = (calHour + 2 < 24 ? String(calHour + 2).padStart(2,'0') : '23') + (c.time ? c.time.split(':')[1] : '00') + '00';
  const calStart = calDate + 'T' + calTimeStart;
  const calEnd = calDate + 'T' + calTimeEnd;
  const calTitle = encodeURIComponent(c.title + ' — Kudla z Brna');
  const calLocation = encodeURIComponent((c.venue ? c.venue + ', ' : '') + (c.city || ''));
  const calUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${calTitle}&dates=${calStart}/${calEnd}&location=${calLocation}`;

  let linksHtml = '';
  if (c.venueUrl) {
    linksHtml += `<a href="${c.venueUrl}" class="concert-detail-link" target="_blank" rel="noopener noreferrer"><i class="fas fa-globe"></i> Web místa konání</a>`;
  }
  if (c.ticketUrl) {
    linksHtml += `<a href="${c.ticketUrl}" class="concert-detail-link ticket" target="_blank" rel="noopener noreferrer"><i class="fas fa-ticket-alt"></i> Vstupenky</a>`;
  }
  if (c.eventUrl) {
    linksHtml += `<a href="${c.eventUrl}" class="concert-detail-link event" target="_blank" rel="noopener noreferrer"><i class="fab fa-facebook"></i> Událost na Facebooku</a>`;
  }

  const modal = document.createElement('div');
  modal.id = 'concert-modal';
  modal.className = 'concert-modal';
  modal.innerHTML = `
    <div class="concert-modal-backdrop" onclick="closeConcertDetail()"></div>
    <div class="concert-modal-content">
      <button class="concert-modal-close" onclick="closeConcertDetail()" aria-label="Zavřít">&times;</button>

      <div class="concert-detail-header">
        <span class="concert-type-tag ${c.type}"><i class="fas ${icon}"></i> ${typeLabel}</span>
        ${cd ? `<span class="concert-countdown-badge">${cd}</span>` : ''}
      </div>

      <h3 class="concert-detail-title">${esc(c.title)}</h3>

      <div class="concert-detail-meta">
        <a href="${calUrl}" class="concert-detail-row concert-detail-row--link" target="_blank" rel="noopener noreferrer" title="Přidat do Google Kalendáře">
          <i class="fas fa-calendar-alt"></i>
          <span>${dayName}, ${dateStr}${c.time ? ' — ' + c.time : ''}</span>
          <i class="fas fa-plus-circle concert-detail-action-icon"></i>
        </a>
        <a href="${mapsUrl}" class="concert-detail-row concert-detail-row--link" target="_blank" rel="noopener noreferrer" title="Otevřít v Mapách">
          <i class="fas fa-map-marker-alt"></i>
          <span>${c.venue ? concertVenueStr(c) : c.city}</span>
          <i class="fas fa-external-link-alt concert-detail-action-icon"></i>
        </a>
        ${c.note ? `<div class="concert-detail-row"><i class="fas fa-info-circle"></i><span>${esc(c.note)}</span></div>` : ''}
      </div>

      ${c.description ? `<p class="concert-detail-desc">${esc(c.description)}</p>` : ''}

      ${linksHtml ? `<div class="concert-detail-links">${linksHtml}</div>` : ''}
    </div>`;
  document.body.appendChild(modal);
  window._concertModalTrigger = document.activeElement;
  requestAnimationFrame(() => { modal.classList.add('active'); modal.querySelector('.concert-modal-close').focus(); });
  document.addEventListener('keydown', concertModalKeyHandler);
}

function closeConcertDetail() {
  const modal = document.getElementById('concert-modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 300);
  }
  document.removeEventListener('keydown', concertModalKeyHandler);
  if (window._concertModalTrigger) { window._concertModalTrigger.focus(); window._concertModalTrigger = null; }
}

function concertModalKeyHandler(e) {
  if (e.key === 'Escape') { closeConcertDetail(); return; }
  // Focus trap
  if (e.key === 'Tab') {
    const modal = document.getElementById('concert-modal');
    if (!modal) return;
    const focusable = modal.querySelectorAll('a[href], button, input, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
    else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
  }
}

// STRUCTURED DATA — inject JSON-LD for concerts
function injectConcertJsonLd(data) {
  if (!data || !data.upcoming || !document.getElementById('concerts-upcoming')) return;
  const events = data.upcoming.slice(0, 10).map(c => ({
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    "name": c.title + " — Kudla z Brna",
    "startDate": c.date + (c.time ? 'T' + c.time + ':00' : ''),
    "location": {
      "@type": "Place",
      "name": c.venue || c.city,
      "address": { "@type": "PostalAddress", "addressLocality": c.city || '' }
    },
    "performer": { "@type": "MusicGroup", "name": "Kudla z Brna" },
    "url": "https://kudlazbrna.netlify.app/koncerty.html"
  }));
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(events);
  document.head.appendChild(script);
}

// BREADCRUMB JSON-LD for subpages
function injectBreadcrumb() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (page === 'index.html' || page === '' || page === '404.html' || page === 'admin.html') return;

  const names = {
    'biografie.html': 'Biografie',
    'media.html': 'Media',
    'koncerty.html': 'Koncerty',
    'foto.html': 'Foto',
    'shop.html': 'Shop',
    'kontakt.html': 'Kontakt'
  };
  const name = names[page];
  if (!name) return;

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Kudla z Brna", "item": "https://kudlazbrna.netlify.app/" },
      { "@type": "ListItem", "position": 2, "name": name, "item": "https://kudlazbrna.netlify.app/" + page }
    ]
  };
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(breadcrumb);
  document.head.appendChild(script);
}

// SCROLL TO TOP button
function initScrollTop() {
  const btn = document.createElement('button');
  btn.className = 'scroll-top';
  btn.setAttribute('aria-label', 'Zpět nahoru');
  btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
  document.body.appendChild(btn);

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        btn.classList.toggle('visible', window.scrollY > 400);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// LOADING SKELETONS — show placeholders while data loads
function injectSkeletons() {
  const concertsList = document.getElementById('concerts-list');
  if (concertsList && !concertsList.children.length) {
    concertsList.innerHTML = `
      <div class="skeleton skeleton-card"></div>
      <div class="skeleton skeleton-card" style="height:80px"></div>
      <div class="skeleton skeleton-card" style="height:80px"></div>`;
  }

  const concertsUpcoming = document.getElementById('concerts-upcoming');
  if (concertsUpcoming && !concertsUpcoming.children.length) {
    let s = '';
    for (let i = 0; i < 5; i++) s += '<div class="skeleton skeleton-card" style="height:80px"></div>';
    concertsUpcoming.innerHTML = s;
  }

  const bento = document.getElementById('video-bento');
  if (bento && !bento.children.length) {
    bento.innerHTML = '<div class="skeleton skeleton-video"></div>';
  }

  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid && !galleryGrid.children.length) {
    let s = '';
    for (let i = 0; i < 6; i++) s += '<div class="skeleton" style="aspect-ratio:1;border-radius:8px"></div>';
    galleryGrid.innerHTML = s;
  }
}

// Make clickable concert items keyboard-accessible
function initConcertKeyboard() {
  document.querySelectorAll('.concert-item.clickable, .next-concert-card.clickable').forEach(el => {
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
    });
  });
}

// Initialize data loading on page load
function initDataLoading() {
  loadConcerts();
  loadConcertsFull();
  loadVideoTeaser();
  loadVideos();
  loadGallery();
  loadShop();
  injectBreadcrumb();
}
