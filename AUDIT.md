# Audit webu — Kudla z Brna

**Datum:** 5. března 2026
**URL:** https://kudlazbrna.netlify.app
**Repozitář:** OKIUDLLA/Kudla-z_-Brna

---

## KRITICKÉ problémy

### 1. Heslo adminu v plain textu
- **`data/site.json`** obsahuje `"adminPassword": "kudla2026"` — kdokoli si může přečíst JSON soubor přímo z webu (`/data/site.json`)
- **`admin.html`** řádek 278 — hardcoded fallback heslo `'kudla2026'`
- **Riziko:** Kdokoli může získat přístup k admin panelu a pak s GitHub tokenem pushovat na repo
- **Řešení:** Přesunout autentizaci na server-side (např. Netlify Functions + env variable), nebo alespoň odstranit heslo ze site.json a použít hash

### 2. Nepushnuté commity — živý web je zastaralý
- V lokálním repozitáři je **5 nepushnutých commitů** s klíčovými změnami (videa, bento layout, sociální sítě)
- Na živém webu se zobrazuje "Video bude brzy k dispozici" místo skutečných videí
- Netlify je potřeba připojit k novému repozitáři `Kudla-z_-Brna`
- **Řešení:** Pushnout přes GitHub Desktop a přepojit Netlify

---

## DŮLEŽITÉ problémy

### 3. Portrétní fotka je placeholder
- `img/kudla-portrait.jpg` existuje ale na živém webu zobrazuje "KUDLA PORTRAIT" text — je to placeholder, nikoli skutečná fotografie
- Zobrazuje se na hlavní stránce v sekci "O mně"
- **Řešení:** Nahradit skutečnou portrétní fotkou

### 4. Galerie — data nesouhlasí se soubory
- `gallery.json` odkazuje na 3 fotky: `photo1.jpg`, `photo2.jpg`, `photo3.jpg`
- Ve složce `img/gallery/` je ve skutečnosti 9 fotek: `foto-01.jpg` až `foto-09.jpg`
- Žádná z referencí v JSON se neshoduje se skutečnými soubory!
- **Řešení:** Aktualizovat `gallery.json` na `foto-01.jpg` až `foto-09.jpg`

### 5. Chybí favicon
- Žádná ze stránek nemá `<link rel="icon">` — prohlížeč zobrazuje výchozí ikonu
- **Řešení:** Vytvořit favicon z loga a přidat do všech HTML souborů

### 6. Social URL v site.json neodpovídají HTML
- `site.json` má staré/špatné URL: `facebook.com/kudlazbrna`, `youtube.com/@kudlazbrna`, `bandzone.cz/kudlazbrna`
- HTML soubory mají správné URL: `facebook.com/kudla.cz`, `youtube.com/@kudla4079`, `bandzone.cz/kudla`
- Admin panel čte z site.json — pokud by se z něj generovaly odkazy, budou špatné
- **Řešení:** Aktualizovat site.json na správné URL

### 7. Chybí OG image
- `index.html` má og:title a og:description, ale chybí `og:image`
- Ostatní stránky nemají OG tagy vůbec
- Při sdílení na sociálních sítích se nezobrazí náhledový obrázek
- **Řešení:** Přidat og:image na všechny stránky

### 8. Hero background obrázek nevyužitý
- `img/hero-bg.jpg` (38 KB) existuje ale CSS hero-bg používá jen CSS gradient, ne tento obrázek
- **Řešení:** Buď použít jako pozadí hero sekce, nebo smazat nepotřebný soubor

---

## MENŠÍ problémy

### 9. Nekonzistentní načítání fontů
- `index.html` a `koncerty.html` nemají Google Fonts `<link>` tagy (font se načte přes CSS @import)
- Ostatní stránky (biografie, media, foto, shop, kontakt) mají navíc `<link>` tagy pro Google Fonts
- CSS už má `@import url('https://fonts.googleapis.com/...')` — dvojité načítání na některých stránkách
- **Řešení:** Sjednotit — buď všude `<link>` tagy (rychlejší), nebo jen CSS @import

### 10. Admin panel — XSS potenciál
- V admin.html se data z inputů vkládají přímo do HTML přes template literals bez escapování
- Např. `<h4>${c.title}</h4>` — pokud by někdo zadal `<script>` tag jako název koncertu, spustí se
- Riziko je nižší protože data zadává sám admin, ale stále je to špatná praxe
- **Řešení:** Escapovat HTML entity v renderovacích funkcích

### 11. Chybějící `lang` atribut v admin.html
- admin.html nemá `<html lang="cs">` — jen `<html>`... vlastně má, zkontroloval jsem znovu a je to OK

### 12. CSS — nevalidní hodnota u site-logo hover
- Řádek 95: `.site-logo:hover img { drop-shadow(0 0 8px rgba(56,182,255,0.4)); }` — chybí `filter:`
- Mělo by být: `filter: drop-shadow(...)`
- **Řešení:** Opravit na `filter: drop-shadow(...)`

### 13. Koncertní data — ukázkové koncerty
- `concerts.json` obsahuje fiktivní koncerty ("Jarní koncert", "Hudební festival Brno") — potřeba nahradit skutečnými daty
- **Řešení:** Kudla musí zadat reálné koncerty přes admin panel

---

## DOPORUČENÍ (nice-to-have)

### 14. Přidat structured data (JSON-LD)
- Schema.org markup pro MusicGroup by pomohl ve vyhledávačích
- Event schema pro koncerty by umožnila zobrazení v Google Events

### 15. Přidat sitemap.xml a robots.txt
- Chybí obě pro lepší indexaci vyhledávači

### 16. Optimalizace SVG loga
- `logo.svg` má 95 KB — velmi velký pro SVG soubor
- Lze optimalizovat pomocí SVGO (typicky 50-80% úspora)

### 17. Přidat lazy loading na více obrázků
- Portrét na hlavní stránce nemá `loading="lazy"` (ale je above the fold, takže ok)
- Gallery items mají lazy loading — OK

### 18. Přidat preload pro hero logo
- Hero logo je kritický LCP element — `<link rel="preload" href="img/logo.svg" as="image">` by zrychlil rendering

---

## Souhrn

| Kategorie | Počet |
|-----------|-------|
| Kritické | 2 |
| Důležité | 6 |
| Menší | 4 |
| Doporučení | 5 |

**Nejnaléhavější kroky:**
1. Pushnout 5 commitů přes GitHub Desktop
2. Připojit Netlify k novému repozitáři
3. Opravit gallery.json (foto-01 až foto-09)
4. Aktualizovat site.json (správné social URL + řešit heslo)
5. Nahradit placeholder portrét skutečnou fotkou
