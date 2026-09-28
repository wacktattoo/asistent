/* =========================================================================
   OBSAH WEBU VAIA Tron — formát je stejný jako u webu Foxyvision.

   logos:    pás pod hero. Text = textové logo, { img, alt } = obrázkové logo.
             main.js seznam sám zdvojí, aby smyčka jela plynule dokola.
   projects: karty v carouselu „Co umí“. img = cesta k obrázku v img/.
   ========================================================================= */
window.FOXY_CONTENT = {

  logos: [
    "ChatGPT", "Claude", "Claude Code", "Gmail", "Google Kalendář", "Google Disk",
    "Notion", "Slack", "GitHub", "Figma", "Spotify", "FTP", "MCP"
  ],

  projects: [
    {
      index: "01",
      name: "Vývoj webů",
      type: "Weby a aplikace · okamžitý náhled",
      desc: "Popíšete web nebo aplikaci, klidně i složitější s databází, a vidíte, jak VAIA Tron píše kód, spouští ho a ukazuje výsledek na počítači i v mobilu. Před každou úpravou si drží bod obnovy a historii.",
      result: "Hotový web nahraje rovnou na FTP.",
      img: "img/aplikace-vyvoj.jpg",
      tags: ["Okamžitý náhled", "Databáze", "Body obnovy", "Historie", "Nahrání na FTP"]
    },
    {
      index: "02",
      name: "Dashboard",
      type: "Dokumenty · soubory · grafy",
      desc: "Pracuje s dokumenty, zapisuje a upravuje soubory ve vašem PC, prochází weby a z čísel udělá graf. Dashboard si uspořádáte podle sebe, i na druhou obrazovku, a hudbu ze Spotify ovládáte přímo z něj.",
      result: "Jedno okno místo deseti aplikací.",
      img: "img/aplikace-rozhovor.jpg",
      tags: ["Dokumenty", "Soubory v PC", "Procházení webů", "Grafy", "Spotify Premium", "Druhá obrazovka"]
    },
    {
      index: "03",
      name: "Hlas",
      type: "Rozumí řeči i psaní",
      desc: "Mluvíte s ním jako s člověkem: hlasem, přes mikrofon nebo psaním. Výstupní hlas si upravíte podle sebe a pojmenujete si ho, jak chcete.",
      result: "Asistent, se kterým se opravdu dá mluvit.",
      img: "img/aplikace-hlas.jpg",
      tags: ["Čeština", "Mikrofon", "Nastavitelný hlas", "Vlastní jméno"]
    },
    {
      index: "04",
      name: "Úlohy a nástroje",
      type: "Plánované úlohy · MCP",
      desc: "Naplánované úlohy neustále kontroluje a dělá je sám. Připojíte MCP nástroje z nabídky Claude, ChatGPT nebo vlastní a ChatGPT s Claudem můžou spolupracovat: jeden dělá, druhý kontroluje.",
      result: "Pracuje za vás, i když spíte.",
      img: "img/aplikace-prikazy.jpg",
      tags: ["Kontrola úloh 24/7", "MCP nástroje", "ChatGPT + Claude", "Paměť", "Kontext projektů"]
    },
    {
      index: "05",
      name: "V mobilu",
      type: "Mobilní rozhraní",
      desc: "Asistenta ovládáte z mobilu odkudkoli, včetně vývoje a živých náhledů. Zadáte práci počítači doma a dostanete upozornění, když je hotovo.",
      result: "Váš asistent v kapse.",
      img: "img/aplikace-telefon.png",
      tags: ["Vývoj z mobilu", "Náhledy", "Diktování", "Upozornění"]
    }
  ]
};
