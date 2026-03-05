# Audit webu — Kudla z Brna

**Datum:** 5. března 2026 (aktualizace)
**Web:** https://kudlazbrna.netlify.app
**Repozitář:** OKIUDLLA/Kudla-z_-Brna

---

## KRITICKÉ problémy

### 1. Galerie — rozbitá (nefunkční obrázky) ❌
- `gallery.json` odkazuje na `photo1.jpg`, `photo2.jpg`, `photo3.jpg`
- Skutečné soubory v `img/gallery/` se jmenují `foto-01.jpg` až `foto-09.jpg`
- **Výsledek:** Foto stránka ukazuje jen broken image ikonky, žádné fotky se nenačtou
- **Oprava:** Přepsat `gallery.json` s reálnými názvy souborů

### 2. Admin — hash hesla hardcoded ve zdrojáku
- V `admin.html` (~řádek 396) je fallback hash přímo v kódu:
  `if (fallbackHash === 'b3abc41143...')`
- Kdokoliv si může přečíst zdroják a pokusit se heslo prolomit (rainbow table)
- **Oprava:** Odstranit hardcoded fallback, spoléhat jen na `site.json`

### 3. Admin — client-side autentizace snadno obejitelná
- Autentizace je čistě v prohlížeči (`sessionStorage`)
- Stačí v DevTools zadat `sessionStorage.setItem('kudla_admin','true')` a admin panel se otevře
- **Poznámka:** U statického webu bez backendu je to očekávané omezení. Skutečná ochrana = GitHub token pro publikování.

---

## DŮLEŽITÉ problémy

### 4. Sociální sítě — nekonzistentní URL
- V HTML souborech (header, footer): `facebook.com/kudla.cz`, `youtube.com/@kudla4079`, `bandzone.cz/kudla`
- V `site.json`: `facebook.com/kudlazbrna`, `youtube.com/@kudlazbrna`, `bandzone.cz/kudlazbrna`
- **Oprava:** Ověřit správné URL a sjednotit všude

### 5. Chybí og:image
- Homepage má `og:title` a `og:description`, ale nemá `og:image`
- Při sdílení na sociálních sítích se nezobrazí náhledový obrázek
- **Oprava:** Přidat `<meta property="og:image" content="...">`

### 6. Chybí favicon
- Web nemá žádný favicon — v prohlížeči se zobrazuje výchozí ikona
- **Oprava:** Vytvořit z loga a přidat `<link rel="icon">` do všech stránek

### 7. GitHub token v localStorage
- GitHub Personal Access Token se ukládá v `localStorage` v čitelné podobě
- Při XSS útoku by mohl být kompromitován
- **Poznámka:** Přijatelné riziko pro osobní web jednoho uživatele

### 8. Hero background obrázek nevyužitý
- `img/hero-bg.jpg` (38 KB) existuje ale hero sekce používá jen CSS gradient
- **Oprava:** Buď použít jako pozadí, nebo smazat

---

## MENŠÍ problémy

### 9. Žádné XSS ošetření na veřejném webu
- `main.js` vkládá data z JSON přímo do HTML bez escapování
- Riziko nízké (data jsou z vlastních JSON), admin panel má `esc()` funkci — to je správně

### 10. Chybí robots.txt a sitemap.xml
- Pomohlo by SEO a indexaci vyhledávači

### 11. Nekonzistentní preconnect linky
- Některé stránky mají preconnect pro Google Fonts, jiné ne

### 12. Koncertní data — ukázkové koncerty
- `concerts.json` obsahuje demo koncerty — Kudla musí zadat reálné přes admin

---

## CO FUNGUJE DOBŘE ✅

- **Hero sekce** — logo, animace, CTA tlačítka
- **Video bento** — 5 videí v bento layoutu, všechna klikatelná a přehrávatelná
- **Koncertní sekce homepage** — featured karta s countdown ("Za 10 dní"), type tag, čas
- **Koncerty.html** — nadcházející s badge, archiv seskupený po rocích
- **Admin přihlášení** — jméno + heslo, SHA-256 hash (opraveno z plain textu)
- **Admin koncerty** — přidání/editace/smazání, vizuální karty s type badges
- **Admin účet** — záložka pro změnu přihlašovacích údajů
- **Responsive design** — mobil i tablet v pořádku
- **Shop** — alba s cenou a objednávkovým mailto
- **Biografie, Kontakt** — v pořádku
- **CSS** — čistý, organizovaný, opravený `filter: drop-shadow()` bug

---

## SOUBORY

| Soubor | Stav | Poznámka |
|--------|------|----------|
| index.html | ✅ | Homepage |
| biografie.html | ✅ | Bio stránka |
| media.html | ✅ | Video stránka |
| koncerty.html | ✅ | Koncerty |
| foto.html | ✅ | Galerie (ale gallery.json rozbitý) |
| shop.html | ✅ | Obchod |
| kontakt.html | ✅ | Kontakt |
| admin.html | ⚠️ | Funkční, bezpečnostní omezení viz výše |
| css/style.css | ✅ | ~550 řádků, responsive, nové koncertní styly |
| js/main.js | ✅ | 464 řádků, koncertní karty + countdown |
| data/concerts.json | ✅ | Rozšířený formát (id, time, city, type) |
| data/videos.json | ✅ | 1 featured + 12 videí |
| data/gallery.json | ❌ | Špatné názvy souborů! |
| data/shop.json | ✅ | 2 alba |
| data/bio.json | ✅ | |
| data/site.json | ✅ | Hash hesla místo plain textu |

---

## NEJNALÉHAVĚJŠÍ KROKY

1. **Opravit gallery.json** — přepsat na `foto-01.jpg` až `foto-09.jpg`
2. **Odstranit hardcoded hash** z admin.html fallbacku
3. **Sjednotit social URL** — ověřit správné profily
4. **Přidat favicon a og:image** — pro lepší branding
5. **Pushnout všechny změny** přes GitHub Desktop
