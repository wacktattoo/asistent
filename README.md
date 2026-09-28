# Foxyvision — UX/UI Studio

Statický motion-led one-page web. HTML + CSS + vanilla JS, **GSAP** (scroll reveals, kinetická typografie) a **Lenis** (smooth scroll) z CDN.

## Spuštění
Stačí otevřít `index.html` v prohlížeči, nebo lokální server:
```
php -S localhost:8000   # nebo libovolný static server
```

## Struktura
```
Foxyvision/
├── index.html        # celá stránka (hero, práce, co děláme, přístup, kontakt)
├── css/style.css     # paper base · ink · terakota · layout + motion helpers
├── js/main.js        # Lenis, GSAP reveals, custom kurzor, magnet. tlačítka, fox parallax
└── assets/           # OBRÁZKY (viz níže)
```

## Obrázky (assets/)
Web funguje i bez nich (lišky mají SVG fallback, karty mají gradient placeholder),
ale pro finální vzhled doplň:

| Soubor                  | Co to je                                    | Doporučeno |
|-------------------------|---------------------------------------------|------------|
| `fox-hero.png`          | Hero liška (PNG s průhledným pozadím)       | ~1200×1400 |
| `fox-run.png`           | Běžící liška do contact sekce (transparent) | ~1400×900  |
| `work-deertone.jpg`     | Náhled DEERTONE                             | 1600×900   |
| `work-tetoo.jpg`        | Náhled Tetoo.cz                             | 1200×750   |
| `work-platbi.jpg`       | Náhled Platbi.cz                            | 1200×750   |
| `work-slagr.jpg`        | Náhled Šlágr TV                             | 1400×875   |
| `work-pivo.jpg`         | Náhled Letající pivo                        | 1200×750   |

## Fonty
- **Body:** Satoshi (Fontshare CDN)
- **Display/Headings:** Archivo Black (velké titulky + wordmark) + Archivo (menší nadpisy) — Google Fonts, náhrada za Suisse Int'l
Žádná instalace, vše z CDN.

## Motion (co kde dělá)
- **Hero:** kinetická typografie — titulek se odhaluje po řádcích maskou; liška reaguje na pohyb kurzoru (parallax/tilt) a slunce + liška se na scroll posouvají do hloubky.
- **Smooth scroll** přes Lenis (inertia), scroll-driven reveals s jemným staggerem.
- **Portfolio:** velké interaktivní karty; na hover se náhled zvětší a kurzor se promění na „Případovka →".
- **Magnetická tlačítka** + custom kurzor.
- Vše respektuje `prefers-reduced-motion`.
