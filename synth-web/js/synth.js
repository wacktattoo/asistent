// Doplňky pro Synth nad main.js z webu Foxyvision:
// tlačítko balíčku v ceníku otevře objednávku (to řeší main.js přes data-modal-open)
// a tady jen doplníme název balíčku do nadpisu a zprávy.
(function () {
  const nazev = document.querySelector("[data-balicek-nazev]");
  const zprava = document.querySelector("[data-contact-form] textarea[name=message]");
  document.querySelectorAll("[data-modal-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const balicek = btn.getAttribute("data-balicek");
      if (nazev) nazev.textContent = balicek || "Synth";
      if (zprava && balicek && !zprava.value.trim()) zprava.value = "Mám zájem o balíček " + balicek + ".";
    });
  });
})();
