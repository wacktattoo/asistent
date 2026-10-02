# Apex Humanoid

Kopie nasazené verze z https://apex-humanoid.vercel.app/ (produkční Vite build: React + three.js).
Cesty jsou přepsané na relativní, takže složka funguje na libovolné adrese (např. `/apex/`).

- `index.html` – vstup
- `assets/` – zkompilovaný JS bundle + CSS
- `humanoid/` – obrázky postavy (idle / listening / thinking / speaking / assembly) a pozadí

Nejjednodušší: otevři `apex-standalone.html` dvojklikem – vše (JS, CSS, obrázky) je v jednom souboru, funguje i bez serveru.

Spuštění lokálně: `python3 -m http.server` v kořeni repa → http://localhost:8000/apex/
(kamera a mikrofon pro gesta vyžadují HTTPS nebo localhost).

URL parametry: `?auto=1` (přeskočí ENTER), `?skip=1` (bez úvodní animace), `?state=thinking`, `?nobg=1`.
