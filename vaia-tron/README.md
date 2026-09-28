# VAIA Tron — web ve stylu Foxyvision

Web asistenta VAIA Tron. Rozložení, animace a písma (Archivo Black, Archivo, Satoshi) pocházejí z webu Foxyvision, barvy a obsah jsou pro VAIA Tron.

Originál Foxyvision (`/index.html`, `/css`, `/js`) ani stránka `/asistent` se nemění.

## Spuštění
```
php -S localhost:8000      # nebo: python -m http.server 8000
```
Pak otevři http://localhost:8000/vaia-tron/

## Obrázky — stačí přepsat soubor se stejným názvem v `img/`
| Soubor | Kde je | Doporučeno |
|---|---|---|
| `hero-bg.jpg` | pozadí úvodu (statické) | 1920×1080 |
| `hero-front.png` | popředí úvodu, hýbe se s myší (PNG s průhledností) | 1920×1080 |
| `work-bg.png`, `work-bg2.png` | dekorace v sekci „Co umí“ | 1200×800 |
| `what-bg.png` | pozadí za nadpisem „Schopnosti“ | 1700×900 |
| `box-1.png`, `box-2.png`, `box-3.png` | obrázky ve třech otáčecích boxech | 800×640 |
| `approach-bg.jpg` | pozadí tmavé karty „Proč VAIA Tron“ | 1600×900 |
| `contact-bg.png` | pozadí kontaktu (spodní pás) | 1920×700 |
| `modal.jpg` | obrázek v okně objednávky | ~1200×1400 |
| `aplikace-*.jpg/png` | screenshoty v carouselu „Co umí“ (cesty jsou v `data/content.js`) | 2160×1350 |

Když chceš jiný formát (třeba `.webp`), změň příponu v `css/theme.css` (hlavička souboru obsahuje seznam).

## Texty
- **Pás s napojeními a karty „Co umí“:** `data/content.js`
- **Rotující slova** (hero, nadpisy): pole `phrases` a volání `setupMorph` / `setupTypewriter` v `js/main.js`
- **Ostatní texty** (Bez API, Funkce, Ceník, Otázky): `index.html`

## Objednávky
Formulář posílá data na `/send.php` (stejný skript jako Foxyvision), takže funguje na stejné doméně. Vybraný balíček se doplní do zprávy (`js/vaia.js`).
