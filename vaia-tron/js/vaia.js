// Doplňky pro VAIA Tron nad main.js z webu Foxyvision:
// tlačítko balíčku v ceníku otevře objednávku (to řeší main.js přes data-modal-open)
// a tady jen doplníme název balíčku do nadpisu a zprávy.
(function () {
  const nazev = document.querySelector("[data-balicek-nazev]");
  const zprava = document.querySelector("[data-contact-form] textarea[name=message]");
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const balicek = btn.getAttribute("data-balicek");
      if (nazev) nazev.textContent = balicek || "VAIA Tron";
      if (zprava && balicek && !zprava.value.trim()) zprava.value = "Mám zájem o balíček " + balicek + ".";
    });
  });
})();

// Tooltipy u funkcí: posun, aby nevyjely z obrazovky, a otevření klepnutím na dotyku.
(function () {
  const skills = document.querySelectorAll(".skill");
  const fit = (el) => {
    const tip = el.querySelector(".skill__tip");
    if (!tip) return;
    // počítá se z nezmenšené šířky (tooltip se při otevírání zvětšuje ze 96 %)
    const box = el.getBoundingClientRect(), w = tip.offsetWidth, m = 12;
    const left = box.left + box.width / 2 - w / 2, right = left + w;
    let shift = 0;
    if (left < m) shift = m - left;
    else if (right > window.innerWidth - m) shift = window.innerWidth - m - right;
    el.style.setProperty("--shift", Math.round(shift) + "px");
  };
  skills.forEach((el) => {
    el.addEventListener("mouseenter", () => fit(el));
    el.addEventListener("focus", () => fit(el));
    el.addEventListener("click", () => {
      const open = !el.classList.contains("is-open");
      skills.forEach((s) => s.classList.remove("is-open"));
      if (open) { el.classList.add("is-open"); fit(el); }
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".skill")) skills.forEach((s) => s.classList.remove("is-open"));
  });
})();

// Přepínač světlé / tmavé varianty (volba se uloží do prohlížeče).
(function () {
  const btn = document.querySelector("[data-theme-toggle]");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try { localStorage.setItem("vaia-theme", next); } catch (e) {}
  });
})();

// Funkce „samy ožívají“: každých pár sekund se náhodná položka zvýrazní
// a ukáže svůj popis, jako by na ni někdo najel myší. Když na mřížku
// najede uživatel nebo na něco klepne, animace se zastaví.
(function () {
  const grid = document.querySelector(".skills__grid");
  if (!grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const items = [...grid.querySelectorAll(".skill")];
  let visible = false, paused = false, last = -1, timer = null, current = null;

  const hide = () => { if (current) current.classList.remove("is-auto"); current = null; };
  const tick = () => {
    hide();
    if (visible && !paused && !grid.querySelector(".skill.is-open")) {
      let i;
      do { i = Math.floor(Math.random() * items.length); } while (i === last && items.length > 1);
      last = i; current = items[i];
      current.dispatchEvent(new Event("mouseenter"));     // dopočítá posun tooltipu u okraje
      current.classList.add("is-auto");
      setTimeout(hide, 2600);
    }
    timer = setTimeout(tick, 3400);
  };

  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible && !timer) timer = setTimeout(tick, 900);
    if (!visible) { clearTimeout(timer); timer = null; hide(); }
  }, { threshold: 0.35 }).observe(grid);

  grid.addEventListener("mouseenter", () => { paused = true; hide(); });
  grid.addEventListener("mouseleave", () => { paused = false; });
  grid.addEventListener("focusin", () => { paused = true; hide(); });
  grid.addEventListener("focusout", () => { paused = false; });
})();

// Úvod: texty ve 4 boxech obrázku se střídají (data/content.js → heroBoxes).
(function () {
  const boxes = document.querySelectorAll("[data-hero-box]");
  const lists = (window.FOXY_CONTENT || {}).heroBoxes;
  if (!boxes.length || !Array.isArray(lists)) return;
  const P = {
    web: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M9 21h6M12 18v3"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    screen: '<rect x="2" y="5" width="12" height="10" rx="1.5"/><rect x="16" y="7" width="6" height="10" rx="1.5"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    plug: '<path d="M9 7V3M15 7V3M6 7h12v4a6 6 0 0 1-12 0zM12 17v4"/>',
    voice: '<path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>',
    memory: '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    code: '<path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/>',
    tag: '<path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/>',
    duo: '<circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/>',
    noapi: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>'
  };
  const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = (it) => '<div class="hero-box__in"><span class="hero-box__ico"><svg viewBox="0 0 24 24">' + (P[it.ico] || P.web) +
    '</svg></span><span><b>' + esc(it.t) + '</b>' + (it.s ? "<small>" + esc(it.s) + "</small>" : "") + "</span></div>";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  boxes.forEach((box) => {
    const list = lists[+box.dataset.heroBox] || [];
    if (!list.length) return;
    let i = 0;
    box.innerHTML = html(list[0]);
    if (reduce || list.length < 2) return;
    const swap = () => {
      box.classList.add("is-out");
      setTimeout(() => {
        i = (i + 1) % list.length;
        box.innerHTML = html(list[i]);
        box.classList.remove("is-out"); box.classList.add("is-in");
        box.offsetWidth;                                   // start z výchozí polohy
        box.classList.remove("is-in");
      }, 460);
    };
    // každý box má jiný rytmus, ať se nemění všechny naráz
    setTimeout(() => setInterval(swap, 3600), 900 + (+box.dataset.heroBox) * 900);
  });
})();
