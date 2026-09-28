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
