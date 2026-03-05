# Kudla z Brna — Roadmap & Stav webu

## Aktuální stav (Březen 2026)

Web je v solidním stavu. Všechny hlavní optimalizace provedeny:

### Co je hotové

**SEO**
- Canonical URL + OG tags + Twitter Cards na všech stránkách
- sitemap.xml, robots.txt
- BreadcrumbList JSON-LD na podstránkách
- MusicEvent JSON-LD na koncertech
- MusicGroup + WebSite schema na homepage
- Person schema na biografii
- MusicAlbum schema na shop stránce
- Preconnect + dns-prefetch pro všechny external zdroje

**Performance**
- Google Fonts přes `<link>` místo CSS @import
- Font Awesome async loading (media="print" onload)
- Loading skeletons se shimmer animací
- Lazy loading na všech obrázcích
- Cache headers (Netlify _headers + netlify.toml)
- Cache busting (?v=2.2) na CSS/JS
- Automatická minifikace přes Netlify plugin (HTML, CSS, JS)

**Přístupnost (WCAG)**
- Skip link na všech stránkách
- Focus-visible styly pro keyboard navigaci
- Focus trap v lightboxu, concert modalu i order modalu
- Focus return při zavření všech modalů
- aria-current="page" na aktivním nav linku
- aria-expanded na mobile menu toggle
- aria-live regions na dynamicky načítaných sekcích
- role="button" + tabindex na klikacích koncertech
- Keyboard handlers (Enter/Space) na galerii i koncertech
- prefers-reduced-motion — vypíná animace i parallax
- Screen reader labels na všech interaktivních prvcích
- role="alert" na chybových zprávách

**Bezpečnost**
- XSS ochrana: esc() + escAttr() funkce na všech dynamických datech
- isValidYtId() validace YouTube ID před vložením do iframe
- rel="noopener noreferrer" na všech external odkazech
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, X-XSS-Protection
- Content-Security-Policy header
- Noscript fallback na všech stránkách s dynamickým obsahem
- Custom 404 stránka

**UX**
- Scroll-to-top tlačítko
- Page-hero fade-up animace
- Mobile menu s opacity+transform animací a staggered delays
- CSS View Transitions pro plynulé přechody mezi stránkami
- Error handling s retry logikou a "Zkusit znovu" linkem
- Concert detail modal s Google Maps + Calendar linky
- Order formulář s mailto integrací
- Vylepšené tiskové styly (@media print)

**PWA basics**
- manifest.json
- apple-touch-icon (180x180)
- theme-color + color-scheme meta

---

## Fáze 1 — Brzké vylepšení (nízké úsilí, vysoký dopad)

### ~~1.1 Minifikace CSS/JS~~ ✅
- ~~Netlify plugin `netlify-plugin-minify-html`~~

### 1.2 Responzivní obrázky
- Vytvořit srcset verze klíčových obrázků (kudla-portrait, kudla-bio, og-image)
- Přidat `<picture>` element s WebP alternativou
- Nástroj: `sharp` nebo ImageMagick pro batch resize

### 1.3 Spotify / Apple Music linky
- Přidat do footer nebo contact sekce
- Přidat do MusicGroup JSON-LD (sameAs pole)

### 1.4 Analytics
- Google Analytics 4 nebo Plausible (privacy-friendly)
- Přidat consent banner před spuštěním analytics skriptu

---

## Fáze 2 — Střednědobé (střední úsilí)

### 2.1 Service Worker pro offline
- Caching strategie: Network First pro HTML, Cache First pro assets
- Offline fallback stránka
- Dokončení PWA — installable app

### 2.2 Cookie/Consent banner
- GDPR compliance (pokud se přidá analytics)
- Jednoduchý banner s Accept/Decline
- Uložení preference do localStorage

### 2.3 Newsletter / Mailing list
- Integrace s Mailchimp nebo Buttondown
- Formulář v kontakt sekci nebo footer
- Automatický email při novém koncertu

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
