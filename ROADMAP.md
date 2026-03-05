# Kudla z Brna — Roadmap & Stav webu

## Aktuální stav (Březen 2026)

Web je v solidním stavu. Všechny hlavní optimalizace provedeny:

### Co je hotové

**SEO**
- Canonical URL + OG tags + Twitter Cards na všech stránkách
- sitemap.xml s lastmod daty, robots.txt
- BreadcrumbList JSON-LD na podstránkách
- MusicEvent JSON-LD na koncertech
- MusicGroup + WebSite schema na homepage
- Person schema na biografii
- MusicAlbum schema na shop stránce (s obrázky, žánrem, popisem)
- ContactPoint schema na kontakt stránce (booking, email, telefon)
- ImageGallery JSON-LD na fotogalerii
- VideoObject JSON-LD na media stránce (až 8 videí)
- Preconnect + dns-prefetch pro všechny external zdroje
- Footer navigace s interními linky + aria-current na všech stránkách
- Spotify profily v sameAs JSON-LD (oba profily)

**Performance**
- Google Fonts přes `<link>` místo CSS @import
- Font Awesome async loading (media="print" onload)
- Loading skeletons se shimmer animací
- Lazy loading na všech obrázcích (včetně footer log s width/height)
- Cache headers (Netlify _headers + netlify.toml)
- Cache busting (?v=2.7) na CSS/JS
- `defer` atribut na main.js pro neblokující rendering
- Automatická minifikace přes Netlify plugin (HTML, CSS, JS)
- Preload hints na critical CSS na všech stránkách + hero background (LCP)
- fetchpriority="high" na LCP obrázcích
- width/height atributy na všech obrázcích (prevence CLS)
- decoding="async" na všech lazy-loaded obrázcích
- CSS contain + content-visibility na heavy sections

**Přístupnost (WCAG)**
- Skip link na všech stránkách
- Focus-visible styly pro keyboard navigaci
- Focus trap v lightboxu, concert modalu, order modalu i mobile nav
- Focus return při zavření všech modalů
- aria-current="page" na aktivním nav linku
- aria-expanded na mobile menu toggle
- aria-live regions na dynamicky načítaných sekcích
- role="button" + tabindex na klikacích koncertech
- Keyboard handlers (Enter/Space) na galerii i koncertech
- prefers-reduced-motion — vypíná animace i parallax
- Screen reader labels na všech interaktivních prvcích
- role="alert" na chybových zprávách
- Footer nav s aria-label="Patička"

**Bezpečnost**
- XSS ochrana: esc() + escAttr() funkce na všech dynamických datech
- isValidYtId() validace YouTube ID před vložením do iframe
- rel="noopener noreferrer" na všech external odkazech
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection
- Content-Security-Policy header (frame-ancestors, base-uri, form-action, upgrade-insecure-requests)
- Noscript fallback na všech stránkách s dynamickým obsahem
- Custom 404 stránka s quick links gridem

**UX**
- Scroll-to-top tlačítko
- Page-hero fade-up animace
- Mobile menu s opacity+transform animací a staggered delays
- CSS View Transitions pro plynulé přechody mezi stránkami
- Error handling s retry logikou a "Zkusit znovu" linkem
- Concert detail modal s Google Maps + Calendar linky
- Order formulář s mailto integrací
- Vylepšené tiskové styly (@media print) — kontakty, galerie, album karty
- Lightbox počítadlo fotek (3 / 23) s aria-live
- Footer s navigací pro lepší orientaci
- Spotify ikona v header, footer i kontakt social sekcích
- Newsletter formulář ve footeru (Netlify Forms, AJAX submit, success zpráva)

**PWA**
- manifest.json s shortcuts (Koncerty, Shop, Kontakt), maskable icon, scope, id
- apple-touch-icon (180x180)
- theme-color + color-scheme meta
- Service Worker s offline podporou (Network First HTML, Cache First assets)
- Vlastní offline.html fallback stránka s retry tlačítkem

**Caching**
- Long-term immutable cache headers pro img/, css/, js/ (max-age=1 rok)
- Cache busting (?v=2.7) pro bezpečné aktualizace

**Obrázky**
- WebP verze všech klíčových obrázků (hero-bg, kudla-portrait, kudla-bio, album covers, 23 gallery photos)
- Responsive `<picture>` element se srcset a mobile verzemi (400w)
- `<picture>` s WebP i pro album covery v shopu a galerii
- Hero background-image s CSS fallbackem

---

## Fáze 1 — Brzké vylepšení (nízké úsilí, vysoký dopad)

### ~~1.1 Minifikace CSS/JS~~ ✅
### ~~1.2 Responzivní obrázky~~ ✅
### ~~1.3 Preload & CLS prevence~~ ✅
### ~~1.4 ContactPoint schema & image decoding~~ ✅

### ~~1.5 Spotify linky~~ ✅
- ~~Přidat do header, footer i contact social sekce~~
- ~~Přidat do MusicGroup + Person JSON-LD (sameAs pole)~~

### 1.6 Analytics
- Google Analytics 4 nebo Plausible (privacy-friendly)
- Přidat consent banner před spuštěním analytics skriptu

---

## Fáze 2 — Střednědobé (střední úsilí)

### ~~2.1 Service Worker pro offline~~ ✅

### 2.2 Cookie/Consent banner
- GDPR compliance (pokud se přidá analytics)
- Jednoduchý banner s Accept/Decline
- Uložení preference do localStorage

### ~~2.3 Newsletter / Odběr novinek~~ ✅
- ~~Netlify Forms formulář ve footeru na všech stránkách~~
- ~~AJAX submit s loading spinner a success zprávou~~
- ~~Responsivní design (stacked na mobilu)~~

### 2.4 Automatický deploy pipeline
- GitHub Actions: lint HTML, validate JSON, minify, deploy
- Automatické bumpy cache-busting verze

---

## Fáze 3 — Dlouhodobé (vyšší úsilí)

### 3.1 Vlastní doména
- Přejít z kudlazbrna.netlify.app na kudlazbrna.cz
- Nastavit DNS, SSL, redirecty
- Aktualizovat všechny canonical/OG URL, sitemap, robots

### 3.2 Song lyrics / texty písní
- Nová stránka texty.html
- JSON data soubor s texty
- Hledání/filtrování podle alba

### 3.3 Blog / Novinky
- Jednoduchý blog systém (JSON data + šablona)
- RSS feed pro čtenáře

### 3.4 Záznam z koncertů
- Audio player pro ukázky písniček
- Integrace se SoundCloud / Bandcamp

### 3.5 Vícejazyčnost (EN verze)
- Základní EN verze pro zahraniční publikum
- hreflang tagy
- Přepínač jazyků v headeru

---

## Údržba (průběžně)

- **Koncerty**: Aktualizovat data/concerts.json (přesouvat minulé do past)
- **Fotky**: Přidávat nové fotky do data/gallery.json
- **Videa**: Přidávat nová videa do data/videos.json
- **Cache busting**: Při změnách CSS/JS zvýšit ?v= parametr
- **Závislosti**: Kontrolovat aktualizace Font Awesome, Google Fonts
- **Lighthouse audit**: Spustit 1x měsíčně pro kontrolu skóre
- **Sitemap**: Aktualizovat lastmod při změnách obsahu
