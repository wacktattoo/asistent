/* =========================================================================
   OBSAH CAROUSELU „Co umí“ — jedna položka = jedna funkce asistenta.
   Formát je stejný jako u webu Foxyvision (projects → funkce Synthu).
   Loga v pásu pod hero se berou z markupu (logos: [] = textová loga).
   ========================================================================= */
window.FOXY_CONTENT = {

  logos: [],

  projects: [
    {
      index: "01",
      name: "Rozhovor",
      type: "Pošta · kalendář · grafy",
      desc: "Zeptáte se, co vám dnes přišlo důležitého, a Synth přečte poštu, shrne ji a navrhne odpovědi. Z čísel udělá graf, z popisu obrázek a hlídá vaše schůzky.",
      result: "Jedno okno místo deseti záložek.",
      img: "img/aplikace-rozhovor.jpg",
      tags: ["Gmail", "Google Kalendář", "Grafy", "Obrázky", "Paměť", "Spotify"]
    },
    {
      index: "02",
      name: "Vývoj webů",
      type: "Weby a aplikace · záložka Vývoj",
      desc: "Popíšete web větou a vidíte, jak asistent píše kód, spouští ho a ukazuje výsledek na počítači i v mobilu. Před každou úpravou si udělá zálohu, rozbitý kód sám pozná a opraví.",
      result: "Hotový web za pár minut, bez programování.",
      img: "img/aplikace-vyvoj.jpg",
      tags: ["Živý náhled", "Body obnovy", "Kontrola po úpravě", "Úkol na noc", "Zveřejnění na hosting"]
    },
    {
      index: "03",
      name: "Hlas",
      type: "Mluví a poslouchá česky",
      desc: "Mluvíte s ním jako s člověkem. Česky, mužským i ženským hlasem. Pozná, kdy domluvíte, a když mu skočíte do řeči, ztichne.",
      result: "Asistent, se kterým se opravdu dá mluvit.",
      img: "img/aplikace-hlas.jpg",
      tags: ["Čeština", "Diktování", "Mužský i ženský hlas", "Vlastní jméno"]
    },
    {
      index: "04",
      name: "Plánované úkoly",
      type: "Pracuje 24/7",
      desc: "Každé ráno v 8:00 přehled pošty, v pátek týdenní report, v noci kontrola projektu. Úkol nastavíte jednou a Synth ho dělá sám, i když spíte.",
      result: "Ráno máte hotovo dřív, než otevřete počítač.",
      img: "img/aplikace-prikazy.jpg",
      tags: ["Ranní přehled", "Týdenní report", "Noční úkoly", "Upozornění do mobilu"]
    },
    {
      index: "05",
      name: "V mobilu",
      type: "Asistent v kapse",
      desc: "Spárujete telefon QR kódem a Synth máte s sebou. Zadáváte práci na počítač doma, posíláte fotky jako dotaz a dostáváte upozornění, když je hotovo.",
      result: "Šifrované spojení, i mimo domácí Wi-Fi.",
      img: "img/aplikace-telefon.png",
      tags: ["QR párování", "AES-256", "Diktování", "Fotka jako dotaz", "Náhled webů"]
    }
  ]
};
