# Synth — web ve stylu Foxyvision

Nový web asistenta Synth. Rozložení a animace pocházejí z webu Foxyvision (hero, pás log, carousel, flip karty, svislý marquee, čísla, kontakt a objednávka). Vzhled a obsah jsou převzaté ze Synthu (`/asistent`): tmavé pozadí, azurová záře, HUD prvky a fonty Chakra Petch a Manrope.

Originální Foxyvision (`/index.html`, `/css`, `/js`) ani stránka `/asistent` se nemění.

## Struktura
```
synth-web/
├── index.html            # stránka: obsah Synthu v rozložení Foxyvision
├── css/style.css         # CSS z Foxyvision přebarvené do palety Synthu
├── css/synth-theme.css   # místo lišek screenshoty aplikace a HUD, tmavé sekce, Ceník + Otázky
├── js/main.js            # main.js z Foxyvision, změněné jsou jen rotující texty
├── js/metaballs.js       # metaballs v azurové
├── js/synth.js           # doplní vybraný balíček do objednávky
├── data/content.js       # karty carouselu „Co umí“ (funkce + screenshoty)
└── img/                  # screenshoty aplikace (kopie z /asistent/img)
```

## Úpravy
- **Funkce v carouselu:** `data/content.js`
- **Rotující slova** (hero, nadpisy): hledej `setupMorph` / `setupTypewriter` a pole `phrases` v `js/main.js`
- **Barvy:** proměnné v `:root` na začátku `css/style.css` a `css/synth-theme.css`

## Objednávky
Formulář posílá data na `/send.php` (stejný skript jako Foxyvision), takže funguje, když web běží na stejné doméně. Balíček se doplní do zprávy automaticky.

## Spuštění
```
php -S localhost:8000   # a otevřít http://localhost:8000/synth-web/
```
