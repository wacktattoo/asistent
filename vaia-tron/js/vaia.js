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
