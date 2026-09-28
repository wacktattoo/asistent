// 3D postava ze svitících castic (Three.js) pro uvod stranky.
// Vlastni procedura -- hlava, krk a ramena z vrstevnic bodu, zlate vlny
// v obliceji jako v aplikaci. Otaci se za mysi, pri posouvani se rozpada.
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js'

const AZUR = new THREE.Color('#35d8ff')
const BILA = new THREE.Color('#dff8ff')
const ZLATA = new THREE.Color('#ffb65a')
const TMAVA = new THREE.Color('#1d6fb0')

function body () {
  const poz = []; const barvy = []; const rozptyl = []; const vel = []
  const pridej = (x, y, z, barva, v = 1) => {
    poz.push(x, y, z)
    barvy.push(barva.r, barva.g, barva.b)
    const u = Math.random() * Math.PI * 2; const w = Math.acos(2 * Math.random() - 1)
    rozptyl.push(Math.sin(w) * Math.cos(u), Math.sin(w) * Math.sin(u) + 0.3, Math.cos(w))
    vel.push(v * (0.7 + Math.random() * 0.6))
  }
  const smes = (a, b, t) => a.clone().lerp(b, t)

  // Hlava: vrstevnice elipsoidu, brada trochu zuzena.
  const H = { y: 1.55, rx: 0.6, ry: 0.8, rz: 0.66 }
  for (let k = 0; k <= 46; k++) {
    const fi = 0.06 * Math.PI + (k / 46) * 0.86 * Math.PI
    const y = H.y + H.ry * Math.cos(fi)
    const s = Math.sin(fi)
    const zuz = fi > 0.62 * Math.PI ? 1 - (fi - 0.62 * Math.PI) * 0.45 : 1
    const n = Math.max(12, Math.round(150 * s))
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2 + k * 0.07
      const x = H.rx * s * zuz * Math.sin(th)
      const z = H.rz * s * zuz * Math.cos(th)
      const oblicej = z > 0.25 && y > H.y - 0.45 && y < H.y + 0.15
      const b = oblicej ? smes(ZLATA, BILA, Math.random() * 0.25) : smes(AZUR, BILA, Math.random() * 0.5)
      pridej(x, y, z + (oblicej ? 0.03 * Math.sin(y * 40) : 0), b, oblicej ? 1.25 : 1)
    }
  }
  // Oblicej: vodorovne zlate vlny tesne pred hlavou.
  for (let r = 0; r < 11; r++) {
    const y = H.y - 0.38 + r * 0.05
    for (let i = 0; i < 70; i++) {
      const t = (i / 69 - 0.5) * 1.1
      const x = t * 0.5
      const z = Math.sqrt(Math.max(0, 1 - (x / H.rx) ** 2 - ((y - H.y) / H.ry) ** 2)) * H.rz + 0.02 + 0.015 * Math.sin(t * 9 + r)
      pridej(x, y + 0.012 * Math.sin(t * 12 + r * 0.8), z, smes(ZLATA, BILA, 0.15), 1.1)
    }
  }
  // Krk.
  for (let k = 0; k < 14; k++) {
    const y = 0.45 + k * 0.04
    const r = 0.3 - Math.sin((k / 13) * Math.PI) * 0.03
    for (let i = 0; i < 60; i++) {
      const th = (i / 60) * Math.PI * 2
      pridej(r * Math.sin(th), y, r * 0.9 * Math.cos(th), smes(AZUR, TMAVA, 0.3))
    }
  }
  // Ramena a hrud: plocha rotace, zplostela do hloubky.
  for (let k = 0; k <= 40; k++) {
    const t = k / 40
    const y = 0.5 - t * 1.9
    const hladke = (a, b, x) => { const q = Math.min(1, Math.max(0, (x - a) / (b - a))); return q * q * (3 - 2 * q) }
    const r = 0.32 + 1.1 * hladke(0, 0.1, t) + 0.38 * hladke(0.08, 0.3, t) + 0.08 * hladke(0.3, 1, t)
    const n = Math.round(60 + 170 * (r / 1.9))
    for (let i = 0; i < n; i++) {
      const th = (i / n) * Math.PI * 2
      const x = r * Math.sin(th)
      const z = r * 0.42 * Math.cos(th)
      // Ramena klesaji od krku do stran.
      const pokles = 0.34 * (Math.abs(x) / 1.8) ** 2
      pridej(x, y - pokles, z, smes(AZUR, TMAVA, t * 0.8), 0.9)
    }
  }
  // Obezne prstence kolem hlavy.
  for (const [r, sklon, pocet] of [[1.15, 0.35, 260], [1.45, -0.25, 320]]) {
    for (let i = 0; i < pocet; i++) {
      const th = (i / pocet) * Math.PI * 2
      if (Math.sin(th * 3) > 0.85) continue
      pridej(r * Math.cos(th), H.y - 0.1 + r * Math.sin(th) * sklon, r * Math.sin(th), smes(AZUR, BILA, 0.3), 0.8)
    }
  }
  // Prach okolo.
  for (let i = 0; i < 1600; i++) {
    const u = Math.random() * Math.PI * 2; const w = Math.acos(2 * Math.random() - 1); const r = 2 + Math.random() * 2.6
    pridej(r * Math.sin(w) * Math.cos(u), 0.6 + r * Math.cos(w) * 0.8, r * Math.sin(w) * Math.sin(u), smes(TMAVA, AZUR, Math.random()), 0.45)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.Float32BufferAttribute(poz, 3))
  g.setAttribute('color', new THREE.Float32BufferAttribute(barvy, 3))
  g.setAttribute('aRozptyl', new THREE.Float32BufferAttribute(rozptyl, 3))
  g.setAttribute('aVel', new THREE.Float32BufferAttribute(vel, 1))
  return g
}

export function spust (platno, { klid = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas: platno, alpha: true, antialias: false, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  const scena = new THREE.Scene()
  const kamera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  kamera.position.set(0, 0.95, 7.4)

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    uniforms: { uCas: { value: 0 }, uRozpad: { value: 0 }, uVelikost: { value: 26 * Math.min(devicePixelRatio, 2) } },
    vertexShader: `
      uniform float uCas; uniform float uRozpad; uniform float uVelikost;
      attribute vec3 aRozptyl; attribute float aVel;
      varying vec3 vBarva; varying float vAlfa;
      void main () {
        vec3 p = position;
        float vlna = sin(uCas * 1.6 + p.y * 7.0 + p.x * 2.0) * 0.012;
        p += normalize(p - vec3(0.0, 1.0, 0.0)) * vlna;
        p += aRozptyl * uRozpad * (2.2 + aVel * 1.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = uVelikost * aVel * (1.0 / -mv.z) * (1.0 + 0.35 * sin(uCas * 2.0 + p.x * 20.0));
        vBarva = color;
        vAlfa = (1.0 - uRozpad * 0.85) * (0.55 + 0.45 * smoothstep(-2.0, 1.0, p.z));
      }`,
    fragmentShader: `
      varying vec3 vBarva; varying float vAlfa;
      void main () {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(vBarva * (0.6 + a), a * a * vAlfa);
      }`
  })
  const postava = new THREE.Points(body(), material)
  postava.position.y = -0.55
  scena.add(postava)

  const velikost = () => {
    const w = platno.clientWidth; const h = platno.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    kamera.aspect = w / h
    // Na uzkem displeji postavu trochu oddalit, at se vejde.
    kamera.position.z = w / h < 0.9 ? 9 : 7.4
    kamera.updateProjectionMatrix()
  }
  velikost()
  new ResizeObserver(velikost).observe(platno)

  if (klid) { renderer.render(scena, kamera); return }

  const mys = { x: 0, y: 0 }
  addEventListener('pointermove', (e) => { mys.x = e.clientX / innerWidth - 0.5; mys.y = e.clientY / innerHeight - 0.5 }, { passive: true })

  let videt = true
  new IntersectionObserver((z) => { videt = z[0].isIntersecting }).observe(platno)
  const hodiny = new THREE.Clock()
  const krok = () => {
    requestAnimationFrame(krok)
    if (!videt || document.hidden) return
    const t = hodiny.getElapsedTime()
    material.uniforms.uCas.value = t
    const cil = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.9)))
    material.uniforms.uRozpad.value += (cil - material.uniforms.uRozpad.value) * 0.08
    postava.rotation.y += ((mys.x * 0.7 + Math.sin(t * 0.25) * 0.15) - postava.rotation.y) * 0.05
    postava.rotation.x += ((mys.y * 0.18) - postava.rotation.x) * 0.05
    renderer.render(scena, kamera)
  }
  krok()
}
