// Synth -- landing page. Vsechno je jen vylepseni: obsah je videt i bez
// JS a bez animaci (viz html.anim v synth.css).
import { LOGA } from './loga.js'

const $ = (s, el = document) => el.querySelector(s)
const $$ = (s, el = document) => [...el.querySelectorAll(s)]
const klid = matchMedia('(prefers-reduced-motion: reduce)').matches
const dotyk = matchMedia('(hover: none)').matches

// ── odhalovani pri posouvani ─────────────────────────────────────────────
// Skryta stranka (nahled, karta na pozadi) dusi animace -- pak radsi hned
// vsechno ukazat, nez nechat obsah viset v opacity 0.
function ukazVse () {
  for (const el of $$('.odhal')) { el.style.transition = 'none'; el.classList.add('je-videt') }
}
if (!klid && document.visibilityState === 'visible' && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('anim')
  const pozor = new IntersectionObserver((zaznamy) => {
    for (const z of zaznamy) if (z.isIntersecting) { z.target.classList.add('je-videt'); pozor.unobserve(z.target) }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
  $$('.odhal').forEach((el, i) => { el.style.transitionDelay = (el.closest('.bento, .ceny, .faq, .kroky, .vyvoj-vlastnosti') ? (i % 4) * 70 : 0) + 'ms'; pozor.observe(el) })
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') ukazVse() })
  setTimeout(() => $$('.hero .odhal').forEach(el => el.classList.add('je-videt')), 60)
}

// ── plynule posouvani (Lenis, kdyz se nacetl) ────────────────────────────
addEventListener('load', () => {
  if (klid || !window.Lenis) return
  const lenis = new window.Lenis({ duration: 1.1, smoothWheel: true })
  const krok = (t) => { lenis.raf(t); requestAnimationFrame(krok) }
  requestAnimationFrame(krok)
  for (const a of $$('a[href^="#"]')) {
    a.addEventListener('click', (e) => {
      const cil = a.getAttribute('href') === '#' ? 0 : $(a.getAttribute('href'))
      if (cil === null) return
      e.preventDefault()
      lenis.scrollTo(cil, { offset: -80 })
    })
  }
})

// ── navigace ─────────────────────────────────────────────────────────────
const nav = $('#nav')
addEventListener('scroll', () => nav.classList.toggle('je-dole', scrollY > 40), { passive: true })

// ── stridajici se slovo v nadpisu (s "rozsypanim" znaku) ─────────────────
const stridej = $('[data-stridej]')
if (stridej && !klid) {
  const slova = stridej.dataset.stridej.split('|')
  const znaky = 'ABCDEFGHIJKLMNOPRSTUVZ0123456789#%&*'
  let i = 0
  setInterval(() => {
    if (document.hidden) return
    i = (i + 1) % slova.length
    const cil = slova[i]
    let krok = 0
    const t = setInterval(() => {
      krok++
      stridej.textContent = cil.split('').map((z, j) => (j < krok / 2 || z === ' ') ? z : znaky[Math.floor(Math.random() * znaky.length)]).join('')
      if (krok / 2 >= cil.length) { clearInterval(t); stridej.textContent = cil }
    }, 28)
  }, 3200)
}

// ── HUD karty v hero: paralaxa za mysi ───────────────────────────────────
if (!dotyk && !klid) {
  const hudy = $$('.hud')
  addEventListener('pointermove', (e) => {
    const x = e.clientX / innerWidth - 0.5
    const y = e.clientY / innerHeight - 0.5
    for (const h of hudy) {
      const d = Number(h.dataset.hloubka || 20)
      h.style.transform = `translate(${-x * d}px, ${-y * d}px)`
    }
  }, { passive: true })
}

// ── svitici body se popisky na screenu aplikace ──────────────────────────
const BODY = [
  { x: 25, y: 42, nazev: 'Živá postava', text: 'Ukazuje, co asistent právě dělá: poslouchá, přemýšlí, mluví. Reaguje na váš hlas.' },
  { x: 87, y: 23, nazev: 'Rozhovor', text: 'Ptáte se česky, psaním nebo hlasem. Odpovídá textem i nahlas a pamatuje si souvislosti.' },
  { x: 87, y: 42, nazev: 'Grafy', text: 'Z čísel udělá graf. Kliknutím ho otevřete na celou obrazovku.' },
  { x: 62, y: 26, nazev: 'Náhled webu', text: 'Web, který asistent staví, vidíte naživo na počítači i jako mobil.' },
  { x: 8.8, y: 37, nazev: 'Tento počítač', text: 'Vytížení, paměť, grafická karta a teplota. Asistent ví, jak se počítač má.' },
  { x: 8.8, y: 55.5, nazev: 'Claude i ChatGPT', text: 'Napojení a limity na jednom místě. Když jednomu dojde limit, převezme to druhý.' },
  { x: 8.8, y: 86, nazev: 'Hudba', text: 'Ovládá Spotify: „pusť něco na soustředění“, „další písnička“, „co hraje?“' },
  { x: 41.5, y: 20, nazev: 'Terminál', text: 'Příkazy, které asistent spouští, vidíte naživo. Můžete psát i vlastní.' },
  { x: 86, y: 92.5, nazev: 'Režimy', text: 'Hlubší analýza, obrázek, hledání na webu nebo kreativní psaní jedním klikem.' },
  { x: 45, y: 80, nazev: 'Historie relací', text: 'Každý rozhovor zůstává uložený. Kdykoli se k němu vrátíte.' }
]
const obalBodu = $('#body')
const seznamBodu = $('#bodySeznam')
if (obalBodu) {
  const tip = document.createElement('div')
  tip.className = 'tip'
  tip.setAttribute('role', 'tooltip')
  tip.innerHTML = '<b></b><p></p>'
  obalBodu.append(tip)
  let otevreny = null
  const ukaz = (b, d) => {
    otevreny?.classList.remove('je-otevreny')
    otevreny = b
    b.classList.add('je-otevreny')
    tip.querySelector('b').textContent = d.nazev
    tip.querySelector('p').textContent = d.text
    // Tooltip na tu stranu, kde je misto.
    tip.style.left = d.x > 60 ? '' : `calc(${d.x}% + 22px)`
    tip.style.right = d.x > 60 ? `calc(${100 - d.x}% + 22px)` : ''
    tip.style.top = d.y > 60 ? '' : `calc(${d.y}% - 20px)`
    tip.style.bottom = d.y > 60 ? `calc(${100 - d.y}% - 20px)` : ''
    tip.classList.add('je-videt')
  }
  const schovej = () => { tip.classList.remove('je-videt'); otevreny?.classList.remove('je-otevreny'); otevreny = null }
  BODY.forEach((d, i) => {
    const b = document.createElement('button')
    b.type = 'button'
    b.className = 'bod'
    b.style.left = d.x + '%'
    b.style.top = d.y + '%'
    b.style.animationDelay = (i * 0.2) + 's'
    b.setAttribute('aria-label', d.nazev)
    b.innerHTML = `<span>${i + 1}</span>`
    b.addEventListener('mouseenter', () => ukaz(b, d))
    b.addEventListener('focus', () => ukaz(b, d))
    b.addEventListener('mouseleave', schovej)
    b.addEventListener('blur', schovej)
    b.addEventListener('click', () => (otevreny === b ? schovej() : ukaz(b, d)))
    obalBodu.append(b)
    const li = document.createElement('li')
    li.innerHTML = '<div><b></b><span></span></div>'
    li.querySelector('b').textContent = d.nazev
    li.querySelector('span').textContent = d.text
    seznamBodu.append(li)
  })
}

// ── 3D naklon karet za mysi ──────────────────────────────────────────────
if (!dotyk && !klid) {
  for (const k of $$('[data-naklon]')) {
    k.addEventListener('pointermove', (e) => {
      const r = k.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width
      const y = (e.clientY - r.top) / r.height
      k.style.setProperty('--ry', ((x - 0.5) * 8).toFixed(2) + 'deg')
      k.style.setProperty('--rx', ((0.5 - y) * 8).toFixed(2) + 'deg')
      k.style.setProperty('--mx', (x * 100).toFixed(1) + '%')
      k.style.setProperty('--my', (y * 100).toFixed(1) + '%')
    })
    k.addEventListener('pointerleave', () => { k.style.setProperty('--rx', '0deg'); k.style.setProperty('--ry', '0deg') })
  }
}

// ── posouvanim rizene prvky: narovnani screenu, telefon, cara kroku ──────
const obrazovka = $('#obrazovka3d')
const telefon = $('#telefon')
const kroky = $('#kroky')
const prubeh = (el) => {
  const r = el.getBoundingClientRect()
  return Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight + r.height * 0.4)))
}
let cekaSnimek = false
function priPosunu () {
  cekaSnimek = false
  if (obrazovka) {
    const p = Math.min(1, prubeh(obrazovka) * 1.6)
    obrazovka.style.setProperty('--naklon', (16 * (1 - p)).toFixed(2) + 'deg')
    obrazovka.style.setProperty('--priblizeni', (0.9 + 0.1 * p).toFixed(3))
  }
  if (telefon && !dotyk) {
    const p = prubeh(telefon)
    telefon.style.setProperty('--ry', (-28 + p * 40).toFixed(2) + 'deg')
    telefon.style.setProperty('--rx', (10 - p * 10).toFixed(2) + 'deg')
  }
  if (kroky) kroky.style.setProperty('--prubeh', Math.min(1, prubeh(kroky) * 1.5).toFixed(3))
}
if (!klid) {
  addEventListener('scroll', () => { if (!cekaSnimek) { cekaSnimek = true; requestAnimationFrame(priPosunu) } }, { passive: true })
  priPosunu()
}

// ── pripojeni: loga na obeznych drahach ─────────────────────────────────
const drahy = $('.orbita-drahy')
if (drahy) {
  const klice = Object.keys(LOGA)
  const DRAHY = [
    { velikost: 46, doba: 36, pocet: 5 },
    { velikost: 72, doba: 52, pocet: 7, opacne: true },
    { velikost: 98, doba: 70, pocet: 6 }
  ]
  let n = 0
  for (const d of DRAHY) {
    const draha = document.createElement('div')
    draha.className = 'draha' + (d.opacne ? ' opacne' : '')
    draha.style.width = draha.style.height = d.velikost + '%'
    draha.style.setProperty('--doba', d.doba + 's')
    for (let i = 0; i < d.pocet && n < klice.length; i++, n++) {
      const l = LOGA[klice[n]]
      const uhel = (i / d.pocet) * Math.PI * 2
      const el = document.createElement('div')
      el.className = 'logo'
      el.style.left = (50 + 50 * Math.cos(uhel)) + '%'
      el.style.top = (50 + 50 * Math.sin(uhel)) + '%'
      // Cerna loga (GitHub, Notion, Vercel) by na tmave dlazdici nebyla videt.
      const [r, g, b] = [1, 3, 5].map(i => parseInt(l.barva.slice(i, i + 2), 16))
      el.style.setProperty('--b', (0.299 * r + 0.587 * g + 0.114 * b) < 70 ? '#e6f5ff' : l.barva)
      el.title = l.nazev
      el.innerHTML = `<div class="logo-vnitrek" style="--doba:${d.doba}s"><svg viewBox="0 0 24 24" role="img" aria-label="${l.nazev}"><path d="${l.d}"/></svg></div>`
      draha.append(el)
    }
    drahy.append(draha)
  }
}

// ── vyvoj: psani zadani a postup kroku ──────────────────────────────────
const psaci = $('#psaci')
if (psaci) {
  const text = psaci.dataset.text
  const kr = $$('.zadani-kroky li')
  let bezi = false
  const spust = () => {
    if (bezi) return
    bezi = true
    if (klid) { psaci.textContent = text; kr.forEach(li => li.classList.add('hotovo')); return }
    let i = 0
    const t = setInterval(() => {
      psaci.textContent = text.slice(0, ++i)
      if (i >= text.length) {
        clearInterval(t)
        kr.forEach((li, j) => {
          setTimeout(() => li.classList.add('bezi'), j * 900)
          setTimeout(() => { li.classList.remove('bezi'); li.classList.add('hotovo') }, j * 900 + 800)
        })
      }
    }, 32)
  }
  if ('IntersectionObserver' in window) {
    const po = new IntersectionObserver((z) => { if (z[0].isIntersecting) { spust(); po.disconnect() } }, { threshold: 0.4 })
    po.observe(psaci.closest('.zadani'))
  } else spust()
}

// ── objednavka (zatim poptavka e-mailem pres /send.php) ──────────────────
const okno = $('#poptavka')
const formular = $('#poptavkaFormular')
for (const b of $$('[data-balicek]')) {
  b.addEventListener('click', () => {
    $('#poptavkaBalicek').textContent = b.dataset.balicek
    formular.hidden = false
    $('#poptavkaHotovo').hidden = true
    $('#poptavkaChyba').hidden = true
    okno.showModal()
    setTimeout(() => formular.querySelector('input[name="name"]').focus(), 50)
  })
}
for (const b of $$('[data-zavrit]')) b.addEventListener('click', () => okno.close())
okno.addEventListener('click', (e) => { if (e.target === okno) okno.close() })
formular.addEventListener('submit', async (e) => {
  e.preventDefault()
  const chyba = $('#poptavkaChyba')
  const d = new FormData(formular)
  const jmeno = String(d.get('name') || '').trim()
  const email = String(d.get('email') || '').trim()
  if (!jmeno || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    chyba.textContent = 'Vyplňte prosím jméno a platný e-mail.'
    chyba.hidden = false
    return
  }
  const odeslat = new FormData()
  odeslat.set('name', jmeno)
  odeslat.set('email', email)
  odeslat.set('website', String(d.get('website') || ''))
  odeslat.set('message', `Objednávka asistenta Synth\nBalíček: ${$('#poptavkaBalicek').textContent}\n\nPoznámka:\n${String(d.get('poznamka') || '').trim() || '(bez poznámky)'}`)
  const tl = formular.querySelector('button[type="submit"]')
  tl.disabled = true
  tl.textContent = 'Odesílám…'
  try {
    const r = await fetch('/send.php', { method: 'POST', body: odeslat })
    const j = await r.json().catch(() => ({}))
    if (!r.ok || !j.ok) throw new Error(j.error || 'Objednávku se nepodařilo odeslat.')
    formular.reset()
    formular.hidden = true
    $('#poptavkaHotovo').hidden = false
  } catch (x) {
    chyba.textContent = x.message + ' Můžete napsat i na ahoj@foxyvision.cz.'
    chyba.hidden = false
  } finally {
    tl.disabled = false
    tl.textContent = 'Odeslat objednávku'
  }
})

// ── 3D postava v hero (az po zobrazeni textu) ────────────────────────────
const platno = $('#postava3d')
const bez3d = () => document.documentElement.classList.add('bez-3d')
if (platno) {
  const zkus = () => import('./postava3d.js').then(m => m.spust(platno, { klid })).catch(bez3d)
  if ('requestIdleCallback' in window) requestIdleCallback(zkus, { timeout: 1200 })
  else setTimeout(zkus, 300)
}
