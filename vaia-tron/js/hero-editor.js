// Editor boxů v úvodu — načte se jen s ?upravit za adresou.
// Box chyť myší a posuň, za modrý roček vpravo dole změníš velikost,
// natočení / zkosení / písmo nastavíš v panelu. „Uložit“ zapíše
// data/hero-layout.js (přes save-layout.php, jen na localhostu),
// „Stáhnout“ ten soubor stáhne, když PHP neběží.
(function () {
  const H = window.VAIA_HERO;
  if (!H) return;
  const { cfg, boxes, apply, wrap, KEYS } = H;
  const stage = wrap.parentElement;                       // .hero-art (plátno 16:9)
  const round = (v) => Math.round(v * 10) / 10;
  let sel = 0;

  document.documentElement.classList.add("hero-editing");
  wrap.classList.add("is-debug");

  // ---- styly editoru ----
  const css = document.createElement("style");
  css.textContent = `
    .hero-editing .hero__inner, .hero-editing .hero__particles, .hero-editing .hero__scroll { pointer-events: none; }
    .hero-editing .hero__inner { opacity: .35; }
    .hero-editing .hero-box { pointer-events: auto; cursor: move; user-select: none; }
    .hero-editing .hero-box.is-sel { outline: 2px solid #0077cc !important; outline-offset: 2px; }
    .he-grip { position: absolute; right: -8px; bottom: -8px; width: 16px; height: 16px; border-radius: 4px;
      background: #0077cc; border: 2px solid #fff; cursor: nwse-resize; box-shadow: 0 2px 6px rgba(0,0,0,.3); }
    .he-panel { position: fixed; left: 16px; bottom: 16px; z-index: 2000; width: 300px; padding: 16px;
      border-radius: 16px; background: #0a1622; color: #e6f5ff; font: 13px/1.4 system-ui, sans-serif;
      box-shadow: 0 20px 50px rgba(0,0,0,.4); }
    .he-panel h4 { margin: 0 0 10px; font-size: 14px; display: flex; justify-content: space-between; align-items: center; }
    .he-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
    .he-tabs button { flex: 1; padding: 6px 0; border-radius: 8px; border: 1px solid #2a4460; background: transparent; color: #e6f5ff; cursor: pointer; font-weight: 700; }
    .he-tabs button.on { background: #0077cc; border-color: #0077cc; }
    .he-row { display: grid; grid-template-columns: 78px 1fr 44px; gap: 8px; align-items: center; margin: 6px 0; }
    .he-row input[type=range] { width: 100%; accent-color: #35a9f0; }
    .he-row output { text-align: right; font-variant-numeric: tabular-nums; color: #9ab8cb; }
    .he-btns { display: flex; gap: 6px; margin-top: 12px; }
    .he-btns button { flex: 1; padding: 9px 0; border-radius: 10px; border: 0; cursor: pointer; font-weight: 700; }
    .he-save { background: #0077cc; color: #fff; }
    .he-alt { background: #1c3350; color: #e6f5ff; }
    .he-msg { margin-top: 8px; min-height: 1.4em; color: #3ecf8e; }
    .he-hint { color: #7f9db1; font-size: 12px; margin: 0 0 10px; }
  `;
  document.head.appendChild(css);

  // ---- panel ----
  const panel = document.createElement("div");
  panel.className = "he-panel";
  const sliders = [
    ["rotate", "Natočení", -30, 30, 0.5, "°"],
    ["skewX", "Zkosení ↔", -30, 30, 0.5, "°"],
    ["skewY", "Zkosení ↕", -30, 30, 0.5, "°"],
    ["size", "Písmo", 0.5, 2, 0.05, "×"],
  ];
  panel.innerHTML =
    '<h4>Boxy v úvodu <a href="?" style="color:#9ab8cb;font-weight:400">zavřít</a></h4>' +
    '<p class="he-hint">Box chyť a posuň, za modrý roček změníš velikost.</p>' +
    '<div class="he-tabs">' + boxes.map((_, i) => '<button data-i="' + i + '">' + (i + 1) + "</button>").join("") + "</div>" +
    sliders.map(([k, l, mn, mx, st, u]) =>
      '<label class="he-row"><span>' + l + '</span><input type="range" data-k="' + k + '" min="' + mn + '" max="' + mx + '" step="' + st + '"><output data-o="' + k + '"></output></label>').join("") +
    '<div class="he-row"><span>Poloha</span><span data-pos style="color:#9ab8cb"></span><span></span></div>' +
    '<div class="he-btns"><button class="he-save" data-save>Uložit</button><button class="he-alt" data-dl>Stáhnout</button><button class="he-alt" data-reset>Vrátit</button></div>' +
    '<div class="he-msg" data-msg></div>';
  document.body.appendChild(panel);
  const msg = (t, err) => { const m = panel.querySelector("[data-msg]"); m.textContent = t; m.style.color = err ? "#ff8a8a" : "#3ecf8e"; };

  const units = Object.fromEntries(sliders.map((s) => [s[0], s[5]]));
  function refresh() {
    const c = cfg[sel];
    panel.querySelectorAll(".he-tabs button").forEach((b) => b.classList.toggle("on", +b.dataset.i === sel));
    panel.querySelectorAll("input[data-k]").forEach((inp) => {
      const k = inp.dataset.k, v = typeof c[k] === "number" ? c[k] : (k === "size" ? 1 : 0);
      inp.value = v; panel.querySelector('[data-o="' + k + '"]').textContent = round(v) + units[k];
    });
    panel.querySelector("[data-pos]").textContent = "x " + round(c.x) + " · y " + round(c.y) + " · " + round(c.w) + "×" + round(c.h) + " %";
    boxes.forEach((b, i) => b.classList.toggle("is-sel", i === sel));
  }
  panel.querySelectorAll(".he-tabs button").forEach((b) => b.addEventListener("click", () => { sel = +b.dataset.i; refresh(); }));
  panel.querySelectorAll("input[data-k]").forEach((inp) => inp.addEventListener("input", () => {
    cfg[sel][inp.dataset.k] = parseFloat(inp.value); apply(boxes[sel], cfg[sel]); refresh();
  }));

  // ---- tažení a změna velikosti ----
  boxes.forEach((box, i) => {
    const grip = document.createElement("span"); grip.className = "he-grip"; box.appendChild(grip);
    box.addEventListener("pointerdown", (e) => {
      e.preventDefault(); sel = i; refresh();
      const r = stage.getBoundingClientRect(), c = cfg[i];
      const sx = e.clientX, sy = e.clientY, start = { x: c.x, y: c.y, w: c.w, h: c.h };
      const resize = e.target === grip;
      const move = (ev) => {
        const dx = (ev.clientX - sx) / r.width * 100, dy = (ev.clientY - sy) / r.height * 100;
        if (resize) { c.w = Math.max(3, round(start.w + dx)); c.h = Math.max(3, round(start.h + dy)); }
        else { c.x = round(start.x + dx); c.y = round(start.y + dy); }
        apply(box, c); refresh();
      };
      const up = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", up); };
      addEventListener("pointermove", move); addEventListener("pointerup", up);
    });
  });

  // šipky na klávesnici = jemný posun vybraného boxu (Shift = větší krok)
  addEventListener("keydown", (e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d || /input|textarea/i.test(document.activeElement.tagName)) return;
    e.preventDefault(); const st = e.shiftKey ? 1 : 0.1, c = cfg[sel];
    c.x = round(c.x + d[0] * st); c.y = round(c.y + d[1] * st); apply(boxes[sel], c); refresh();
  });

  // ---- uložení ----
  const layout = () => cfg.map((c) => Object.fromEntries(KEYS.map((k) => [k, typeof c[k] === "number" ? round(c[k] * 100) / 100 : (k === "size" ? 1 : 0)])));
  const fileText = () =>
    "/* Poloha boxů v úvodu — zapisuje editor (otevři web s ?upravit za adresou).\n" +
    "   Prázdné pole = platí hodnoty z data/content.js → heroBoxes. */\n" +
    "window.VAIA_HERO_LAYOUT = " + JSON.stringify(layout(), null, 2) + ";\n";

  panel.querySelector("[data-save]").addEventListener("click", async () => {
    try {
      const r = await fetch("save-layout.php", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(layout()) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || "HTTP " + r.status);
      msg("Uloženo do data/hero-layout.js ✓");
    } catch (e) {
      msg("Uložit nejde (" + e.message + "). Použij „Stáhnout“ a soubor dej do složky data/.", true);
    }
  });
  panel.querySelector("[data-dl]").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([fileText()], { type: "text/javascript" }));
    a.download = "hero-layout.js"; a.click();
    msg("Stažený soubor přepiš do vaia-tron/data/hero-layout.js");
  });
  panel.querySelector("[data-reset]").addEventListener("click", () => {
    if (confirm("Vrátit boxy na poslední uloženou polohu?")) location.reload();
  });

  refresh();
})();
