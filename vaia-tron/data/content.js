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

  /* ===== BOXY V ÚVODU =====================================================
     4 boxy s texty, které leží na skleněných boxech v img/backbg.png.
     Čísla jsou v % obrázku 1920×1080 — vlevo nahoře je 0/0, vpravo dole 100/100:
       x, y      levý horní roh boxu
       w, h      šířka a výška boxu
       rotate    natočení ve stupních (kladné = po směru hodinek)
       skewX     zkosení do strany ve stupních (kladné = horní hrana doprava)
       skewY     zkosení nahoru/dolů ve stupních (kladné = pravá strana dolů)
       size      velikost písma (1 = normální, 1.2 = o 20 % větší…)
       glass     false = bez vlastní skleněné plochy (jen text na boxu z obrázku)
     Tip: otevři web s ?boxy za adresou (…/vaia-tron/?boxy) a uvidíš červené
     obrysy boxů i jejich čísla — podle toho doladíš polohu.

     items: texty, které se v boxu střídají. ico = ikona:
       web | doc | folder | image | clock | globe | music | screen | phone | mic |
       chart | upload | restore | plug | voice | memory | code | tag | duo | noapi
     ======================================================================= */
  /* jak dlouho (v sekundách) drží každý box svůj text, než se vymění */
  heroBoxSeconds: 9,

  heroBoxes: [
    { x: 46.4, y: 34.0, w: 10.3, h: 12.2, rotate: 1.5, skewX: 0, skewY: 0, size: 1,
      items: [
        { ico: "web", t: "Weby a aplikace", s: "i s databází, okamžitý náhled" },
        { ico: "upload", t: "Nahrání na FTP", s: "hotový web rovnou na hosting" },
        { ico: "restore", t: "Body obnovy", s: "historie každé úpravy" },
        { ico: "code", t: "Zná vaše projekty", s: "z Claude Code i ChatGPT" } ] },
    { x: 47.4, y: 49.8, w: 9.9, h: 13.0, rotate: 1.5, skewX: 0, skewY: 0, size: 1,
      items: [
        { ico: "doc", t: "Práce s dokumenty", s: "čte, shrnuje, připravuje" },
        { ico: "folder", t: "Soubory ve vašem PC", s: "zapisuje i upravuje" },
        { ico: "chart", t: "Vytváření grafů", s: "z čísel přehledný graf" },
        { ico: "image", t: "Tvorba obrázků", s: "s aplikací ChatGPT" } ] },
    { x: 51.4, y: 66.8, w: 9.7, h: 14.6, rotate: 4, skewX: 0, skewY: 0, size: 1,
      items: [
        { ico: "clock", t: "Plánované úlohy", s: "neustálá kontrola 24/7" },
        { ico: "globe", t: "Procházení webů", s: "najde, co potřebujete" },
        { ico: "plug", t: "MCP nástroje", s: "z Claude, ChatGPT i vlastní" },
        { ico: "duo", t: "ChatGPT + Claude", s: "jeden dělá, druhý kontroluje" } ] },
    { x: 81.4, y: 63.2, w: 12.1, h: 15.4, rotate: 6, skewX: 0, skewY: 0, size: 1,
      items: [
        { ico: "mic", t: "Rozumí řeči", s: "hlas, mikrofon i psaní" },
        { ico: "phone", t: "Ovládání z mobilu", s: "včetně vývoje a náhledů" },
        { ico: "music", t: "Hudba na dashboardu", s: "Spotify Premium" },
        { ico: "noapi", t: "Bez API tokenů", s: "stačí aplikace ChatGPT / Claude" } ] }
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
