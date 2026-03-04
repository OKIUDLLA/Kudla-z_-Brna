/* ============================================
   KUDLA Z BRNA — v2 JavaScript
   Parallax, scroll reveal, lightbox, nav
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initParallax();
  initReveal();
  initLightbox();
  setActiveNav();
  initDataLoading();
});

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
  const close = () => { toggle.classList.remove('active'); nav.classList.remove('open'); overlay && overlay.classList.remove('active'); document.body.style.overflow = ''; };
  const open = () => { toggle.classList.add('active'); nav.classList.add('open'); overlay && overlay.classList.add('active'); document.body.style.overflow = 'hidden'; };
  toggle.addEventListener('click', () => nav.classList.contains('open') ? close() : open());
  overlay && overlay.addEventListener('click', close);
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
}

function initParallax() {
  const heroBg = document.querySelector('.hero-bg');
  if (!heroBg) return;
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
  const items = document.querySelectorAll('.gallery-item');
  let current = 0;
  const images = [];
  items.forEach((item, i) => {
    const itemImg = item.querySelector('img');
    if (itemImg) {
      images.push(itemImg.dataset.full || itemImg.src);
      item.addEventListener('click', () => { current = i; show(current); lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; });
    }
  });
  function show(idx) { if (images[idx]) img.src = images[idx]; }
  function closeLB() { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
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
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === page || (page === '' && href === 'index.html')) a.classList.add('active');
  });
}

// ============================================
// DATA LOADING & RENDERING
// ============================================

async function loadJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    return await res.json();
  } catch (e) {
    console.warn(`Could not load ${path}:`, e.message);
    return null;
  }
}

// Format date from ISO string to Czech format
function formatDate(dateStr) {
  const d = new Date(dateStr);
  const months = ['Led','Úno','Bře','Dub','Kvě','Čvn','Čvc','Srp','Zář','Říj','Lis','Pro'];
  return {
    day: d.getDate(),
    monthYear: months[d.getMonth()] + ' ' + d.getFullYear()
  };
}

// Check if date is in past
function isPast(dateStr) {
  return new Date(dateStr) < new Date();
}

// CONCERTS
async function loadConcerts() {
  const container = document.getElementById('concerts-list');
  if (!container) return;

  const data = await loadJSON('data/concerts.json');
  if (!data) { container.innerHTML = '<p style="color:var(--grey);text-align:center;">Žádné koncerty k zobrazení.</p>'; return; }

  let html = '';

  // Show upcoming concerts
  if (data.upcoming && data.upcoming.length > 0) {
    data.upcoming.forEach(c => {
      const fd = formatDate(c.date);
      html += `
        <div class="concert-item">
          <div class="concert-date">
            <span class="day">${fd.day}</span>
            <span class="month-year">${fd.monthYear}</span>
          </div>
          <div class="concert-info">
            <h3>${c.title}</h3>
            <p class="venue"><i class="fas fa-map-marker-alt"></i> ${c.venue}</p>
          </div>
          <div class="concert-link">
            ${c.ticketUrl ? `<a href="${c.ticketUrl}" class="btn btn-primary btn-sm" target="_blank">Vstupenky</a>` : '<span class="btn btn-ghost btn-sm" style="opacity:0.5;pointer-events:none;">Brzy</span>'}
          </div>
        </div>`;
    });
  } else {
    html += '<p style="color:var(--grey);text-align:center;padding:2rem 0;">Žádné nadcházející koncerty. Sledujte sociální sítě.</p>';
  }

  container.innerHTML = html;
}

// CONCERTS FULL (for koncerty.html)
async function loadConcertsFull() {
  const upcomingContainer = document.getElementById('concerts-upcoming');
  const pastContainer = document.getElementById('concerts-past');
  if (!upcomingContainer && !pastContainer) return;

  const data = await loadJSON('data/concerts.json');
  if (!data) return;

  if (upcomingContainer && data.upcoming) {
    let html = '';
    data.upcoming.forEach(c => {
      const fd = formatDate(c.date);
      html += `
        <div class="concert-item">
          <div class="concert-date">
            <span class="day">${fd.day}</span>
            <span class="month-year">${fd.monthYear}</span>
          </div>
          <div class="concert-info">
            <h3>${c.title}</h3>
            <p class="venue"><i class="fas fa-map-marker-alt"></i> ${c.venue}</p>
            ${c.note ? `<p class="venue">${c.note}</p>` : ''}
          </div>
          <div class="concert-link">
            ${c.ticketUrl ? `<a href="${c.ticketUrl}" class="btn btn-primary btn-sm" target="_blank">Vstupenky</a>` : ''}
          </div>
        </div>`;
    });
    upcomingContainer.innerHTML = html || '<p style="color:var(--grey);">Žádné nadcházející koncerty.</p>';
  }

  if (pastContainer && data.past) {
    // Group by year
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
              <h3>${c.title}</h3>
              <p class="venue"><i class="fas fa-map-marker-alt"></i> ${c.venue}</p>
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
function playVideo(btn) {
  const wrapper = btn.closest('.video-thumb');
  const id = wrapper.dataset.ytId;
  wrapper.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="Video" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe>`;
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
      <div class="video-thumb bento-main" data-yt-id="${big.youtubeId}">
        <img src="${videoThumbMax(big.youtubeId)}" alt="${big.title}" loading="lazy"
             onerror="this.src='${videoThumb(big.youtubeId)}'">
        ${playBtn}
        <div class="bento-main-info">
          <span class="bento-rank">#1</span>
          <h3>${big.title}</h3>
          <span class="video-views"><i class="fas fa-eye"></i> ${big.description || big.views || ''}</span>
        </div>
      </div>
    </div>
    <div class="bento-side">
      ${small.map((v, i) => `
        <div class="video-thumb bento-item" data-yt-id="${v.youtubeId}">
          <img src="${videoThumb(v.youtubeId)}" alt="${v.title}" loading="lazy">
          ${playBtn}
          <div class="bento-item-info">
            <span class="bento-rank">#${i + 2}</span>
            <h3>${v.title}</h3>
            ${v.views ? `<span class="video-views"><i class="fas fa-eye"></i> ${v.views}</span>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
}
async function loadVideos() {
  const featuredEl = document.getElementById('video-featured');
  const gridEl = document.getElementById('video-grid');
  if (!featuredEl && !gridEl) return;

  const data = await loadJSON('data/videos.json');
  if (!data) return;

  if (featuredEl && data.featured && data.featured.youtubeId) {
    const f = data.featured;
    featuredEl.innerHTML = `
      <div class="video-thumb video-thumb--featured" data-yt-id="${f.youtubeId}">
        <img src="${videoThumb(f.youtubeId)}" alt="${f.title}" loading="lazy">
        <button class="video-play-btn" onclick="playVideo(this)" aria-label="Přehrát video">
          <svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>
        </button>
        <div class="video-thumb-info">
          <h3>${f.title}</h3>
          <span class="video-views"><i class="fas fa-eye"></i> ${f.description}</span>
        </div>
      </div>`;
  }

  if (gridEl && data.videos) {
    const validVideos = data.videos.filter(v => v.youtubeId);
    if (validVideos.length > 0) {
      gridEl.innerHTML = validVideos.map(v => `
        <div class="video-card">
          <div class="video-thumb" data-yt-id="${v.youtubeId}">
            <img src="${videoThumb(v.youtubeId)}" alt="${v.title}" loading="lazy">
            <button class="video-play-btn" onclick="playVideo(this)" aria-label="Přehrát video">
              <svg viewBox="0 0 68 48"><path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z" fill="red"/><path d="M45 24L27 14v20" fill="white"/></svg>
            </button>
            ${v.views ? `<span class="video-badge"><i class="fas fa-eye"></i> ${v.views}</span>` : ''}
          </div>
          <div class="video-card-info">
            <h3>${v.title}</h3>
            <p>${v.description}</p>
          </div>
        </div>`).join('');
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

  grid.innerHTML = data.photos.map(p => `
    <div class="gallery-item">
      <img src="${p.src}" alt="${p.alt}" loading="lazy">
    </div>`).join('');

  // Re-init lightbox after dynamic load
  initLightbox();
}

// SHOP
async function loadShop() {
  const grid = document.getElementById('shop-grid');
  const shippingEl = document.getElementById('shipping-info');
  if (!grid) return;

  const data = await loadJSON('data/shop.json');
  if (!data) return;

  if (data.albums) {
    grid.innerHTML = data.albums.map(a => `
      <div class="album-card">
        <div class="album-cover">
          <img src="${a.image}" alt="${a.title}" onerror="this.parentElement.innerHTML='<div style=\\'display:flex;align-items:center;justify-content:center;height:100%;color:var(--grey);\\'><i class=\\'fas fa-compact-disc\\' style=\\'font-size:3rem;\\'></i></div>'">
        </div>
        <div class="album-info">
          <h3>${a.title}</h3>
          <p class="album-price">${a.price} Kč</p>
          <p class="album-shipping">+ ${a.shipping} Kč poštovné</p>
          <a href="mailto:${a.orderEmail}?subject=Objednávka CD: ${a.title}&body=Dobrý den, rád/a bych si objednal/a CD '${a.title}'." class="btn btn-primary">
            <i class="fas fa-envelope"></i> Objednat
          </a>
        </div>
      </div>`).join('');
  }

  if (shippingEl && data.shippingNote) {
    shippingEl.innerHTML = `<strong><i class="fas fa-truck"></i> Doprava</strong><br>${data.shippingNote}`;
  }
}

// Initialize data loading on page load
function initDataLoading() {
  loadConcerts();
  loadConcertsFull();
  loadVideoTeaser();
  loadVideos();
  loadGallery();
  loadShop();
}
