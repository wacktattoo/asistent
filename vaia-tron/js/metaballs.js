/* =========================================================================
   MetaBalls — organické „kapkové" blby přes lišku v sekci „Co děláme".
   Vanilla port React Bits komponenty (WebGL přes ogl z CDN). Barvy = terakota.
   Pauzuje mimo obrazovku, respektuje prefers-reduced-motion.
   ========================================================================= */
import { Renderer, Program, Mesh, Triangle, Transform, Vec3, Camera }
  from "https://cdn.jsdelivr.net/npm/ogl@1/+esm";

function parseHexColor(hex) {
  const c = hex.replace("#", "");
  return [
    parseInt(c.substring(0, 2), 16) / 255,
    parseInt(c.substring(2, 4), 16) / 255,
    parseInt(c.substring(4, 6), 16) / 255,
  ];
}
const fract = (x) => x - Math.floor(x);
function hash31(p) {
  let r = [p * 0.1031, p * 0.103, p * 0.0973].map(fract);
  const yzx = [r[1], r[2], r[0]];
  const d = r[0] * (yzx[0] + 33.33) + r[1] * (yzx[1] + 33.33) + r[2] * (yzx[2] + 33.33);
  for (let i = 0; i < 3; i++) r[i] = fract(r[i] + d);
  return r;
}
function hash33(v) {
  let p = [v[0] * 0.1031, v[1] * 0.103, v[2] * 0.0973].map(fract);
  const yxz = [p[1], p[0], p[2]];
  const d = p[0] * (yxz[0] + 33.33) + p[1] * (yxz[1] + 33.33) + p[2] * (yxz[2] + 33.33);
  for (let i = 0; i < 3; i++) p[i] = fract(p[i] + d);
  const xxy = [p[0], p[0], p[1]], yxx = [p[1], p[0], p[0]], zyx = [p[2], p[1], p[0]];
  const out = [];
  for (let i = 0; i < 3; i++) out[i] = fract((xxy[i] + yxx[i]) * zyx[i]);
  return out;
}

const vertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform vec3 iBorderColor;
uniform float iBorderWidth;
uniform float iAnimationSize;
uniform int iBallCount;
uniform float iCursorBallSize;
uniform vec3 iMetaBalls[50];
uniform float iClumpFactor;
uniform bool enableTransparency;
out vec4 outColor;
float mb(vec2 c, float r, vec2 p) { vec2 d = p - c; return (r * r) / dot(d, d); }
void main() {
  vec2 fc = gl_FragCoord.xy;
  float scale = iAnimationSize / iResolution.y;
  vec2 coord = (fc - iResolution.xy * 0.5) * scale;
  vec2 mouseW = (iMouse.xy - iResolution.xy * 0.5) * scale;
  float m1 = 0.0;
  for (int i = 0; i < 50; i++) { if (i >= iBallCount) break; m1 += mb(iMetaBalls[i].xy, iMetaBalls[i].z, coord); }
  float m2 = mb(mouseW, iCursorBallSize, coord);
  float total = m1 + m2;
  float w = min(1.0, fwidth(total));               // ořez jako v originále → žádné díry ve středu blbů
  float thr = 1.3;
  float fill  = smoothstep(-1.0, 1.0, (total - thr) / w);                           // vnitřek
  float shape = smoothstep(-1.0, 1.0, (total - (thr - iBorderWidth)) / w);          // vnitřek + border (o kus větší)
  float border = clamp(shape - fill, 0.0, 1.0);                                     // prstenec = obrys
  vec3 fillCol = vec3(0.0);
  if (total > 0.0) { fillCol = iColor * (m1 / total) + iCursorColor * (m2 / total); }
  vec3 col = fillCol * fill + iBorderColor * border;                                // výplň + obrys
  outColor = vec4(col, enableTransparency ? shape : 1.0);
}`;

function initMetaBalls(container, opts = {}) {
  const o = {
    color: "#35d8ff", cursorBallColor: "#1592dd",
    borderColor: "#0b5f8f", borderWidth: 0,           // obrys blbů (0 = bez obrysu)
    speed: 0.3, enableMouseInteraction: false, hoverSmoothness: 0.08, animationSize: 30,
    ballCount: 12, clumpFactor: 1, cursorBallSize: 2, enableTransparency: true, ...opts,
  };
  const dpr = Math.min(1.5, window.devicePixelRatio || 1);
  let renderer, gl;
  try {
    renderer = new Renderer({ dpr, alpha: true, premultipliedAlpha: false });
    gl = renderer.gl;
  } catch (e) { return; }                         // WebGL nedostupné → tiše nic
  gl.clearColor(0, 0, 0, o.enableTransparency ? 0 : 1);
  container.appendChild(gl.canvas);

  const camera = new Camera(gl, { left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 10 });
  camera.position.z = 1;
  const geometry = new Triangle(gl);
  const [r1, g1, b1] = parseHexColor(o.color);
  const [r2, g2, b2] = parseHexColor(o.cursorBallColor);
  const [br, bg2, bb] = parseHexColor(o.borderColor);
  const balls = [];
  for (let i = 0; i < 50; i++) balls.push(new Vec3(0, 0, 0));

  let program;
  try {
    program = new Program(gl, {
      vertex, fragment,
      uniforms: {
        iTime: { value: 0 }, iResolution: { value: new Vec3(0, 0, 0) }, iMouse: { value: new Vec3(0, 0, 0) },
        iColor: { value: new Vec3(r1, g1, b1) }, iCursorColor: { value: new Vec3(r2, g2, b2) },
        iBorderColor: { value: new Vec3(br, bg2, bb) }, iBorderWidth: { value: o.borderWidth },
        iAnimationSize: { value: o.animationSize }, iBallCount: { value: o.ballCount },
        iCursorBallSize: { value: o.cursorBallSize }, iMetaBalls: { value: balls },
        iClumpFactor: { value: o.clumpFactor }, enableTransparency: { value: o.enableTransparency },
      },
    });
  } catch (e) { container.removeChild(gl.canvas); return; }   // WebGL2 shader se nezkompiloval

  const mesh = new Mesh(gl, { geometry, program });
  const scene = new Transform();
  mesh.setParent(scene);

  const count = Math.min(o.ballCount, 50);
  const params = [];
  for (let i = 0; i < count; i++) {
    const h1 = hash31(i + 1);
    const st = h1[0] * (2 * Math.PI);
    const dtFactor = 0.1 * Math.PI + h1[1] * (0.4 * Math.PI - 0.1 * Math.PI);
    const baseScale = 5 + h1[1] * 5;
    const h2 = hash33(h1);
    params.push({ st, dtFactor, baseScale, toggle: Math.floor(h2[0] * 2), radius: 0.5 + h2[2] * 1.5 });
  }

  const ball = { x: 0, y: 0 };
  let inside = false, px = 0, py = 0;
  function resize() {
    const w = container.clientWidth, h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);   // ogl aplikuje dpr → buffer = w*dpr (žádné dvojí násobení)
    program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  if (o.enableMouseInteraction) {
    // kurzor sledujeme na úrovni OKNA (kontejner má pointer-events:none, aby nic neblokoval);
    // míč jde za kurzor, když je nad oblastí (s malým přesahem), jinak volně obíhá
    window.addEventListener("pointermove", (e) => {
      const r = container.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      px = (x / r.width) * gl.canvas.width;
      py = (1 - y / r.height) * gl.canvas.height;
      const m = 80;
      inside = x >= -m && x <= r.width + m && y >= -m && y <= r.height + m;
    }, { passive: true });
  }

  const start = performance.now();
  let visible = true;
  new IntersectionObserver((es) => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(container);

  function frame(t) {
    requestAnimationFrame(frame);
    if (!visible) return;                          // mimo obrazovku → nerenderuj (šetří baterku)
    const el = (t - start) * 0.001;
    program.uniforms.iTime.value = el;
    for (let i = 0; i < count; i++) {
      const p = params[i];
      const dt = el * o.speed * p.dtFactor;
      const x = Math.cos(p.st + dt);
      const y = Math.sin(p.st + dt + dt * p.toggle);
      balls[i].set(x * p.baseScale * o.clumpFactor, y * p.baseScale * o.clumpFactor, p.radius);
    }
    let tx, ty;
    if (inside) { tx = px; ty = py; }
    else {
      const cx = gl.canvas.width * 0.5, cy = gl.canvas.height * 0.5;
      tx = cx + Math.cos(el * o.speed) * gl.canvas.width * 0.15;
      ty = cy + Math.sin(el * o.speed) * gl.canvas.height * 0.15;
    }
    ball.x += (tx - ball.x) * o.hoverSmoothness;
    ball.y += (ty - ball.y) * o.hoverSmoothness;
    program.uniforms.iMouse.value.set(ball.x, ball.y, 0);
    renderer.render({ scene, camera });
  }
  requestAnimationFrame(frame);
}

const host = document.querySelector("[data-metaballs]");
if (host
    && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    && !window.matchMedia("(max-width: 600px)").matches) {   // na mobilu vypnuto (ani se needituje WebGL)
  initMetaBalls(host, {
    // === VZHLED BLBŮ – tady si to nastav ===
    color: "#35d8ff",            // barva výplně (terakota)
    cursorBallColor: "#1592dd",  // barva „bloudící" kuličky u kurzoru
    borderColor: "#0b5f8f",      // barva obrysu
    borderWidth: 0,              // šířka obrysu (0 = bez obrysu; zkoušej 0.2–0.6)
    // === STRUKTURA (původní) ===
    ballCount: 12,               // kolik blbů
    clumpFactor: 1,              // < 1 = rozprsklé, > 1 = slepené
    animationSize: 30,           // větší = drobnější blby
    speed: 0.22,                 // rychlost (menší = pomalejší)
    cursorBallSize: 1.3,         // velikost kuličky u kurzoru
    enableMouseInteraction: true,
    hoverSmoothness: 0.1,
  });
}
