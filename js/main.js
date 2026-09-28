/* =========================================================
   FOXYVISION — motion + work carousel
   Visibility is CSS-driven (IntersectionObserver). GSAP/Lenis
   are progressive enhancement only — if they fail, the page
   still renders and reveals correctly.
   ========================================================= */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;
  const hasGSAP = typeof gsap !== "undefined";
  const hasST = hasGSAP && typeof ScrollTrigger !== "undefined";
  if (hasST) { try { gsap.registerPlugin(ScrollTrigger); } catch (e) {} }

  // Declared up here so bindCursorTargets() (called early from renderThumbs)
  // can reference them without hitting a temporal-dead-zone error.
  const cursor = document.querySelector("[data-cursor]");
  const cursorLabel = document.querySelector("[data-cursor-label]");

  /* ----------------------------------------------------
     0. Broken-image fallbacks
     ---------------------------------------------------- */
  function watchImg(img) {
    const markBroken = () => {
      img.setAttribute("data-broken", "");
      const foxWrap = img.closest("[data-hero-fox]");
      if (foxWrap) foxWrap.classList.add("show-fallback");
    };
    if (img.complete && img.naturalWidth === 0) markBroken();
    img.addEventListener("error", markBroken);
  }
  document.querySelectorAll("[data-fox-img], [data-card-img]").forEach(watchImg);

  /* ----------------------------------------------------
     1. Split headlines into masked lines (CSS animates them)
     ---------------------------------------------------- */
  function splitIntoLines(container) {
    if (!container || container.dataset.split) return;
    container.dataset.split = "1";
    container.querySelectorAll("span").forEach((span, i) => {
      const inner = document.createElement("span");
      inner.className = "line-inner";
      inner.style.transitionDelay = (i * 0.09) + "s";
      inner.innerHTML = span.innerHTML;
      span.innerHTML = "";
      span.appendChild(inner);
    });
  }
  document.querySelectorAll("[data-split-lines]").forEach(splitIntoLines);

  // Reveal = play the CSS animation, but ALSO hard-guarantee the final
  // visible state shortly after — so a throttled/backgrounded webview that
  // freezes CSS transitions can never leave content invisible.
  function reveal(el) {
    if (!el || el.dataset.revealed) return;
    el.dataset.revealed = "1";
    el.classList.add("in");
    setTimeout(() => {
      el.style.transition = "none";
      el.style.opacity = "1";
      el.style.transform = "none";
      el.querySelectorAll(".line-inner").forEach((li) => { li.style.transition = "none"; li.style.transform = "none"; });
      // let a morph word's blur spill out once its line has slid up
      el.querySelectorAll(".hero__title-flipline, .work__title-flipline, .contact__title-flipline").forEach((fl) => {
        fl.style.overflow = "visible";
        fl.querySelectorAll(".line-inner").forEach((li) => { li.style.overflow = "visible"; });
      });
    }, 1150);
  }

  // Run something once, the first time an element is actually on screen — so a
  // cycling headline starts from word one instead of being mid-rotation by the
  // time you scroll to it.
  function whenInView(el, cb, threshold) {
    if (!el) return;
    if (!("IntersectionObserver" in window)) { cb(); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => { if (en.isIntersecting) { obs.disconnect(); cb(); } });
    }, { threshold: threshold == null ? 0.35 : threshold });
    io.observe(el);
  }

  /* ----------------------------------------------------
     2. Loader — hidden by a plain timeout (never GSAP)
     ---------------------------------------------------- */
  const loader = document.querySelector("[data-loader]");
  const hero = document.querySelector(".hero");

  function revealHero() {
    if (!hero) return;
    reveal(hero.querySelector(".hero__title"));
    hero.querySelectorAll("[data-reveal]").forEach(reveal);
    // once the line has slid up, let the morph word overflow (so its blur isn't clipped)
    setTimeout(() => {
      const fl = hero.querySelector(".hero__title-flipline");
      if (fl) fl.style.overflow = "visible";
    }, 1300);
  }

  // Bulletproof fallback: reveal ALL content with no animation. Used whenever
  // the tab is hidden/throttled — there, timers and CSS transitions can't be
  // trusted, so we must not depend on them to make content visible.
  let shownAll = false;
  function forceShowAll() {
    if (shownAll) return; shownAll = true;
    if (loader) { loader.classList.add("is-hidden"); loader.style.display = "none"; }
    document.querySelectorAll(".hero__title-flipline, .work__title-flipline, .contact__title-flipline").forEach((fl) => {
      fl.style.overflow = "visible";
      fl.querySelectorAll(".line-inner").forEach((li) => { li.style.overflow = "visible"; });
    });
    document.querySelectorAll("[data-reveal], [data-split-lines]").forEach((el) => {
      el.dataset.revealed = "1";
      el.classList.add("in");
      // Kill the transition first — otherwise setting opacity/transform just
      // starts a transition that stays frozen at 0 in a throttled tab.
      el.style.transition = "none";
      el.style.opacity = "1";
      el.style.transform = "none";
      el.querySelectorAll(".line-inner").forEach((li) => {
        li.style.transition = "none";
        li.style.transform = "none";
      });
    });
  }

  // Intro video plays once, then is suppressed for INTRO_DAYS days (per browser).
  const INTRO_KEY = "fv_intro_seen", INTRO_DAYS = 7;
  function introSuppressed() {
    try {
      const last = parseInt(localStorage.getItem(INTRO_KEY) || "0", 10);
      return last > 0 && (Date.now() - last) < INTRO_DAYS * 86400000;
    } catch (e) { return false; }
  }

  const loaderVideo = loader ? loader.querySelector("[data-loader-video]") : null;
  if (document.visibilityState === "hidden" || reduceMotion || !loaderVideo) {
    // Hidden tab / reduced motion / no video — skip the intro, show everything.
    forceShowAll();
  } else if (introSuppressed()) {
    // returning visitor (saw the intro within the last INTRO_DAYS days) — skip the video
    if (loader) loader.style.display = "none";
    revealHero();
  } else if (loader) {
    try { localStorage.setItem(INTRO_KEY, String(Date.now())); } catch (e) {}  // record this play
    let done = false;
    const finish = () => {
      if (done) return; done = true;
      try { loaderVideo.pause(); } catch (e) {}    // stop decoding (no more video work)
      loader.classList.add("is-hidden");           // quick fade + slight zoom out
      revealHero();                                // headline slides up immediately, no dead pause
      setTimeout(() => { loader.style.display = "none"; }, 560);
    };
    loaderVideo.addEventListener("ended", finish);
    loaderVideo.addEventListener("error", finish);
    const skip = loader.querySelector("[data-loader-skip]");
    if (skip) skip.addEventListener("click", finish);
    loader.addEventListener("click", finish);   // click anywhere to skip the intro
    loaderVideo.src = window.matchMedia("(max-width: 768px)").matches
      ? loaderVideo.dataset.srcMobile : loaderVideo.dataset.srcDesktop;
    const p = loaderVideo.play();
    if (p && p.catch) p.catch(finish);   // autoplay blocked → skip the intro
    setTimeout(finish, 12000);           // failsafe so the loader can never trap the page
  } else {
    revealHero();
  }

  // If the tab ever goes to the background, lock in the fully-visible state so a
  // frozen mid-animation can never strand content at opacity 0.
  document.addEventListener("visibilitychange", () => { if (document.hidden) forceShowAll(); });

  /* ----------------------------------------------------
     3. Scroll reveals via IntersectionObserver
     ---------------------------------------------------- */
  const io = ("IntersectionObserver" in window)
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { reveal(en.target); obs.unobserve(en.target); }
        });
      }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" })
    : null;

  function observe(el) {
    if (!el) return;
    if (io) io.observe(el); else reveal(el);
  }
  // everything except the hero (hero is handled by the loader)
  document.querySelectorAll("[data-reveal]").forEach((el) => { if (!el.closest(".hero")) observe(el); });
  document.querySelectorAll("[data-split-lines]").forEach((el) => { if (!el.closest(".hero")) observe(el); });

  // Client logos under the hero — rendered from data/content.js and duplicated
  // here, so the list is written once instead of twice in the markup.
  (function renderLogos() {
    const track = document.querySelector(".marquee__track");
    const names = (window.FOXY_CONTENT || {}).logos;
    if (!track) return;
    if (!Array.isArray(names) || !names.length) { track.classList.add("is-running"); return; }   // fallback z markupu
    track.innerHTML = "";
    const imgs = [];
    for (let copy = 0; copy < 2; copy++) {
      names.forEach((n) => {
        const s = document.createElement("span");
        s.className = "marquee__logo";
        if (n && typeof n === "object" && n.img) {         // nahrané obrázkové logo
          const im = document.createElement("img");
          im.src = n.img;
          im.alt = copy === 0 ? (n.alt || "") : "";
          im.loading = "eager";                             // eager – šířka tracku musí být hotová než se marquee rozjede
          im.decoding = "async";
          s.classList.add("marquee__logo--img");
          s.appendChild(im);
          imgs.push(im);
        } else {
          s.textContent = String(n);                        // textové logo
        }
        if (copy === 1) s.setAttribute("aria-hidden", "true");
        track.appendChild(s);
      });
    }
    // Marquee rozjeď AŽ když jsou loga načtená → track má finální šířku a smyčka -50 % sedí.
    // (Na Safari se loga pod intro videem načtou pozdě; bez tohoto strip za běhu skáče.)
    const start = () => track.classList.add("is-running");
    if (!imgs.length) { start(); return; }
    let pending = imgs.length, started = false;
    const finish = () => { if (started) return; started = true; start(); };
    const one = () => { if (--pending <= 0) finish(); };
    imgs.forEach((im) => {
      if (im.complete && im.naturalWidth) one();
      else { im.addEventListener("load", one, { once: true }); im.addEventListener("error", one, { once: true }); }
    });
    setTimeout(finish, 3000);   // pojistka – rozjeď i kdyby se nějaké logo nenačetlo
  })();

  /* ----------------------------------------------------
     4. Work carousel (data-driven)
     ---------------------------------------------------- */
  // content comes from data/content.js (loaded synchronously before this file)
  const CONTENT = window.FOXY_CONTENT || {};
  let projects = Array.isArray(CONTENT.projects) ? CONTENT.projects : [];
  let activeIndex = 0;
  const projectCount = projects.length;

  const fEl = {
    badge: document.querySelector("[data-feature-badge]"),
    count: document.querySelector("[data-feature-count]"),
    name: document.querySelector("[data-feature-name]"),
    type: document.querySelector("[data-feature-type]"),
    desc: document.querySelector("[data-feature-desc]"),
    result: document.querySelector("[data-feature-result]"),
  };
  const stage = document.querySelector("[data-stage]");
  const dotsWrap = document.querySelector("[data-work-dots]");
  const tagsWrap = document.querySelector("[data-feature-tags]");
  const pad2 = (n) => String(n).padStart(2, "0");
  const TAG_ICON =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 ' +
    '1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3z"/></svg>';
  const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Two stacked <img> layers crossfaded so the project image never "jumps":
  // the next image is decoded off-screen, then we just swap which layer is shown.
  const imgEls = [
    document.querySelector("[data-feature-img]"),
    document.querySelector("[data-feature-img-b]"),
  ];
  let imgFront = 0;
  function showImage(src, name) {
    const back = imgEls[1 - imgFront];
    if (!back) { if (imgEls[0]) imgEls[0].src = src; return; }   // single-layer fallback
    const reveal = () => {
      if (imgEls[imgFront]) imgEls[imgFront].classList.remove("is-front");
      back.classList.add("is-front");
      imgFront = 1 - imgFront;
    };
    back.alt = name || "";
    back.removeAttribute("data-broken");
    back.onerror = () => back.setAttribute("data-broken", "");
    back.src = src;
    if (back.decode) back.decode().then(reveal, reveal);         // wait until ready, then crossfade
    else reveal();
  }

  function buildDots() {
    if (!dotsWrap) return;
    dotsWrap.innerHTML = "";
    projects.forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "workinfo__dot";
      b.setAttribute("aria-label", p.name);
      b.addEventListener("click", () => { setActive(i); restartAuto(); });
      dotsWrap.appendChild(b);
    });
  }
  function highlightDots() {
    if (!dotsWrap) return;
    dotsWrap.querySelectorAll(".workinfo__dot").forEach((d, i) =>
      d.classList.toggle("is-active", i === activeIndex));
  }

  function applyText() {
    const p = projects[activeIndex];
    if (fEl.badge) fEl.badge.textContent = p.index;
    if (fEl.count) fEl.count.innerHTML = "<b>" + pad2(activeIndex + 1) + "</b> / " + pad2(projectCount);
    if (fEl.name) fEl.name.textContent = p.name;
    if (fEl.type) fEl.type.textContent = p.type;
    if (fEl.desc) fEl.desc.textContent = p.desc;
    if (fEl.result) fEl.result.textContent = p.result;
    if (tagsWrap) {
      const items = p.tags || [];
      const li = (t, i, clone) =>
        '<li class="feature__tag" style="--i:' + i + '"' + (clone ? ' data-clone aria-hidden="true"' : "") + ">" +
        TAG_ICON + "<span>" + escapeHtml(t) + "</span></li>";
      // set + klon sady → plynulá svislá smyčka (marquee) na mobilu; klony jsou na desktopu skryté
      // --i = pořadí pro postupné (staggered) naběhnutí tagů při přepnutí projektu (jen mobil)
      const set = items.map((t, i) => li(t, i, false)).join("");
      const clone = items.map((t, i) => li(t, i, true)).join("");
      tagsWrap.innerHTML = '<div class="feature__tags-track">' + set + clone + "</div>";
      tagsWrap.classList.toggle("has-marquee", items.length > 3);   // rotuj jen když se víc než 3 nevejdou
      const track = tagsWrap.firstElementChild;
      if (track) track.style.animationDuration = Math.max(6, items.length * 1.7).toFixed(1) + "s"; // rychlost dle počtu
    }
    highlightDots();
  }

  function render(i) {                                 // initial / instant
    activeIndex = (i + projectCount) % projectCount;
    showImage(projects[activeIndex].img, projects[activeIndex].name);
    applyText();
  }

  function setActive(i) {
    const idx = ((i % projectCount) + projectCount) % projectCount;
    if (idx === activeIndex) return;
    activeIndex = idx;
    showImage(projects[idx].img, projects[idx].name);  // image crossfades immediately
    if (stage) stage.classList.add("is-swapping");      // text fades out…
    setTimeout(() => {
      applyText();                                      // …swaps…
      if (stage) stage.classList.remove("is-swapping"); // …and fades back in
    }, 260);
  }

  projects.forEach((p) => { const im = new Image(); im.src = p.img; });  // warm the cache → instant swaps
  buildDots();
  render(0);                                          // initial content, no swap flicker

  const prevBtn = document.querySelector("[data-prev]");
  const nextBtn = document.querySelector("[data-next]");
  if (prevBtn) prevBtn.addEventListener("click", () => { setActive(activeIndex - 1); restartAuto(); });
  if (nextBtn) nextBtn.addEventListener("click", () => { setActive(activeIndex + 1); restartAuto(); });

  // Mobil: přepínání projektů swipem (šipky jsou na mobilu skryté)
  if (stage) {
    let tsx = 0, tsy = 0, tracking = false;
    stage.addEventListener("touchstart", (e) => {
      if (e.touches.length !== 1) return;
      tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    stage.addEventListener("touchend", (e) => {
      if (!tracking) return; tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - tsx, dy = t.clientY - tsy;
      // vodorovný swipe (ne vertikální scroll)
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        setActive(activeIndex + (dx < 0 ? 1 : -1));
        restartAuto();
      }
    }, { passive: true });
  }

  // Auto-rotate the featured project; pauses on hover, resets on manual nav
  const AUTO_MS = 6500;
  let autoTimer = null;
  function startAuto() {
    if (reduceMotion || projectCount < 2) return;
    stopAuto();
    autoTimer = setInterval(() => setActive(activeIndex + 1), AUTO_MS);
  }
  function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }
  function restartAuto() { startAuto(); }
  if (stage) {
    stage.addEventListener("mouseenter", stopAuto);
    stage.addEventListener("mouseleave", startAuto);
  }
  whenInView(stage, startAuto, 0.25);   // don't rotate before you get here

  // Feature card "BorderGlow" — drive --edge-proximity / --cursor-angle from the
  // pointer (ported from the React Bits component; CSS does the rest).
  const bgCard = document.querySelector("[data-borderglow]");
  if (bgCard && !reduceMotion) {
    const edgeProximity = (x, y, w, h) => {
      const cx = w / 2, cy = h / 2, dx = x - cx, dy = y - cy;
      let kx = Infinity, ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    };
    const cursorAngle = (x, y, w, h) => {
      const dx = x - w / 2, dy = y - h / 2;
      if (dx === 0 && dy === 0) return 0;
      let deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;
      return deg;
    };
    bgCard.addEventListener("pointermove", (e) => {
      const r = bgCard.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      bgCard.style.setProperty("--edge-proximity", (edgeProximity(x, y, r.width, r.height) * 100).toFixed(3));
      bgCard.style.setProperty("--cursor-angle", cursorAngle(x, y, r.width, r.height).toFixed(3) + "deg");
    });
  }

  // Flip cards: hover handles it with a mouse; a real touch tap toggles instead.
  // Detecting the pointer type at interaction time (not a load-time media query)
  // keeps this correct on hybrid touch laptops too.
  document.querySelectorAll(".service").forEach((card) => {
    let fromTouch = false;
    card.addEventListener("pointerdown", (e) => {
      fromTouch = e.pointerType === "touch" || e.pointerType === "pen";
    });
    card.addEventListener("click", () => {
      if (!fromTouch) return;
      const willOpen = !card.classList.contains("is-flipped");
      // zavři ostatní karty → vždy je otočená max. jedna (druhá zavře první)
      document.querySelectorAll(".service.is-flipped").forEach((c) => {
        if (c !== card) c.classList.remove("is-flipped");
      });
      card.classList.toggle("is-flipped", willOpen);
    });
  });

  // "Náš přístup" — vertical marquee of statement cards: scrolls upward,
  // drag with mouse/finger, pauses on hover. Same approach as the old work strip:
  // no setPointerCapture, move/up on window, transform applied straight away.
  const vmView = document.querySelector("[data-vmarquee]");
  const vmTrack = document.querySelector("[data-vmarquee-track]");
  if (vmView && vmTrack && vmTrack.children.length) {
    const vmOriginals = Array.from(vmTrack.children);
    const vmCount = vmOriginals.length;
    vmOriginals.forEach((el) => {                 // second copy → seamless loop
      const clone = el.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      // demote the cloned headings: the copy is decorative, and duplicate <h3>s
      // would show up twice in the document outline for crawlers
      clone.querySelectorAll("h3").forEach((h) => {
        const d = document.createElement("div");
        d.className = "stmt__title";
        d.textContent = h.textContent;
        h.replaceWith(d);
      });
      vmTrack.appendChild(clone);
    });

    const VM_HOLD = 2000;                          // pause with the card centred
    const VM_SPEED = 0.085;                        // px per ms while gliding
    let vmOffset = 0, vmHalf = 0, vmDrag = false, vmHover = false, vmLastY = 0, vmVel = 0;
    let vmSnaps = [];
    // own clock: only advances when not hovering/dragging, so hover freezes both
    // the glide and the hold
    let vmPhase = "hold", vmClock = 0, vmLastTs = 0;
    let vmFrom = 0, vmTo = 0, vmStart = 0, vmDur = 0, vmHoldEnd = VM_HOLD;

    const vmEase = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const vmViewH = () => vmView.clientHeight;

    const vmMeasure = () => {
      vmHalf = vmTrack.children.length > vmCount
        ? vmTrack.children[vmCount].offsetTop - vmTrack.children[0].offsetTop : 0;
      // offset at which each card sits dead centre
      vmSnaps = vmOriginals.map((el) => -(el.offsetTop + el.offsetHeight / 2 - vmViewH() / 2));
    };
    const vmWrapped = () => {
      if (!vmHalf) return vmOffset;
      let o = vmOffset % vmHalf;
      if (o > 0) o -= vmHalf;
      return o;
    };
    const vmApply = () => {
      vmTrack.style.transform = "translateY(" + vmWrapped().toFixed(2) + "px)";
    };
    // snap candidates across neighbouring copies, so wrapping is seamless
    const vmCandidates = () => {
      const out = [];
      for (let j = -1; j <= 2; j++) for (let i = 0; i < vmSnaps.length; i++) out.push(vmSnaps[i] - vmHalf * j);
      return out;
    };
    const vmNextBelow = (o) => {
      let best = null;
      vmCandidates().forEach((s) => { if (s < o - 1 && (best === null || s > best)) best = s; });
      return best === null ? o - vmHalf / vmCount : best;
    };
    const vmNearest = (o) => {
      let best = o, d = Infinity;
      vmCandidates().forEach((s) => { const dd = Math.abs(s - o); if (dd < d) { d = dd; best = s; } });
      return best;
    };
    // flag whichever card currently sits centred, so its neon can run
    const vmMarkCentre = (on) => {
      const kids = vmTrack.children, o = vmWrapped(), mid = vmViewH() / 2;
      let bi = -1, bd = Infinity;
      for (let i = 0; i < kids.length; i++) {
        const d = Math.abs(kids[i].offsetTop + kids[i].offsetHeight / 2 + o - mid);
        if (d < bd) { bd = d; bi = i; }
      }
      for (let i = 0; i < kids.length; i++) kids[i].classList.toggle("is-centered", on && i === bi);
    };

    vmMeasure();
    vmOffset = vmSnaps.length ? vmSnaps[0] : 0;
    vmApply();
    vmMarkCentre(true);

    let vmActive = false;                       // holds still until scrolled to
    whenInView(vmView, () => { vmActive = true; }, 0.25);
    const vmFrame = (ts) => {
      const dt = vmLastTs ? Math.min(ts - vmLastTs, 60) : 0;
      vmLastTs = ts;
      if (!vmHover && !vmDrag && vmActive) vmClock += dt;

      if (!vmDrag && !reduceMotion && vmActive) {
        if (vmPhase === "hold") {
          if (vmClock >= vmHoldEnd) {                      // done resting → glide on
            vmMarkCentre(false);
            vmFrom = vmOffset; vmTo = vmNextBelow(vmOffset);
            vmStart = vmClock; vmDur = Math.max(700, Math.abs(vmTo - vmFrom) / VM_SPEED);
            vmPhase = "move";
          }
        } else {
          const p = vmDur ? Math.min((vmClock - vmStart) / vmDur, 1) : 1;
          vmOffset = vmFrom + (vmTo - vmFrom) * vmEase(p);
          if (p >= 1) {                                    // landed centred → rest + neon
            vmOffset = vmTo; vmPhase = "hold";
            vmHoldEnd = vmClock + VM_HOLD;
            vmMarkCentre(true);
          }
        }
      }
      vmApply();
      requestAnimationFrame(vmFrame);
    };
    requestAnimationFrame(vmFrame);

    vmView.addEventListener("dragstart", (e) => e.preventDefault());
    vmView.addEventListener("pointerdown", (e) => {
      if (e.button != null && e.button !== 0) return;
      vmDrag = true; vmLastY = e.clientY; vmVel = 0;
      e.preventDefault();
      vmMarkCentre(false);                              // neon off while you steer
      vmView.classList.add("is-grabbing");
    });
    window.addEventListener("pointermove", (e) => {
      if (!vmDrag) return;
      const dy = e.clientY - vmLastY; vmLastY = e.clientY;
      vmOffset += dy; vmVel = dy;
      vmApply();
    });
    const vmEnd = () => {
      if (!vmDrag) return;
      vmDrag = false; vmView.classList.remove("is-grabbing");
      // let go → short fling, then settle on the nearest card and resume the cycle
      vmFrom = vmOffset;
      vmTo = vmNearest(vmOffset + vmVel * 10);
      vmStart = vmClock;
      vmDur = Math.max(380, Math.abs(vmTo - vmFrom) / VM_SPEED);
      vmPhase = "move";
    };
    window.addEventListener("pointerup", vmEnd);
    window.addEventListener("pointercancel", vmEnd);
    vmView.addEventListener("mouseenter", () => { vmHover = true; });
    vmView.addEventListener("mouseleave", () => { vmHover = false; });
    window.addEventListener("resize", vmMeasure);
  }

  // Likes keep trickling in after the badge lands: the counter ticks up to 99
  // and a thumb drifts up out of the bubble each time.
  const THUMB_SVG = '<svg viewBox="0 0 24 24"><path d="M2.5 10.5h3.6V21H2.5z"/>' +
    '<path d="M8.1 10.3 12.4 3a1.7 1.7 0 0 1 3.2 1.1l-.9 4.7h5.1a2 2 0 0 1 2 2.4l-1.5 7.3a2 2 0 0 1-2 1.5H8.1z"/></svg>';
  function startLikes(like) {
    if (reduceMotion) return;
    const countEl = like.querySelector(".like__count");
    const floatWrap = like.parentElement ? like.parentElement.querySelector("[data-thumbs]") : null;
    let likes = 1;
    const timer = setInterval(() => {
      likes++;
      if (countEl) countEl.textContent = "+" + likes;
      like.classList.remove("is-bump"); void like.offsetWidth; like.classList.add("is-bump");
      if (floatWrap) {
        const t = document.createElement("span");
        t.className = "float-thumb";
        t.innerHTML = THUMB_SVG;
        // a little spread so they don't rise in a single column
        t.style.setProperty("--dx", (Math.random() * 46 - 20).toFixed(0) + "px");
        t.style.setProperty("--rot", (Math.random() * 26 - 13).toFixed(0) + "deg");
        t.style.setProperty("--dur", (3.4 + Math.random() * 1.4).toFixed(2) + "s");
        floatWrap.appendChild(t);
        setTimeout(() => t.remove(), 5200);
      }
      if (likes >= 99) clearInterval(timer);
    }, 2000);
  }

  // Copy that writes itself in once scrolled to (the contact bubble)
  document.querySelectorAll("[data-typeout]").forEach((el) => {
    const full = el.textContent.split("\n").map((s) => s.trim()).filter(Boolean).join("\n");
    const like = el.parentElement ? el.parentElement.querySelector("[data-like]") : null;
    // hidden tab / reduced motion: forceShowAll owns visibility, so just show it
    if (reduceMotion || document.visibilityState === "hidden") {
      el.textContent = full;
      if (like) { like.classList.add("is-in"); startLikes(like); }   // no-ops under reduced motion
      return;
    }

    const lockedHeight = el.getBoundingClientRect().height;   // keep the bubble its final size
    el.style.minHeight = lockedHeight + "px";

    const out = document.createElement("span");
    const caret = document.createElement("i");
    caret.className = "type-caret";
    caret.setAttribute("aria-hidden", "true");
    el.textContent = "";
    el.appendChild(out);
    el.appendChild(caret);

    let i = 0;
    const type = () => {
      out.textContent = full.slice(0, ++i);
      if (i < full.length) {
        setTimeout(type, full[i - 1] === "\n" ? 340 : 42);    // beat at the line break
      } else {
        setTimeout(() => {
          caret.remove();
          el.style.minHeight = "";
          if (like) { like.classList.add("is-in"); startLikes(like); }
        }, 700);
      }
    };

    let started = false;
    const io2 = new IntersectionObserver((entries, obs) => {
      entries.forEach((en) => {
        if (en.isIntersecting && !started) { started = true; obs.disconnect(); setTimeout(type, 320); }
      });
    }, { threshold: 0.35 });
    io2.observe(el);
  });

  // Contact — the running fox drifts gently as the section passes through view
  const contactBg = document.querySelector("[data-contact-bg]");
  const contactSec = document.querySelector(".contact");
  if (contactBg && contactSec && !reduceMotion) {
    const contactParallax = () => {
      const r = contactSec.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      // 0 while entering from below → 1 once it has left the top
      const p = 1 - (r.top + r.height) / (window.innerHeight + r.height);
      contactBg.style.transform =
        "translate3d(" + (p * 22).toFixed(1) + "px, " + (p * -16).toFixed(1) + "px, 0)";
    };
    window.addEventListener("scroll", contactParallax, { passive: true });
    window.addEventListener("resize", contactParallax);
    contactParallax();
  }

  // Stats — čísla naběhnou (count-up) a podtržení posledního projektu se nakreslí, až sekce vjede do view
  const statsSec = document.querySelector(".stats");
  if (statsSec) {
    const proj = statsSec.querySelector(".stat--project");
    const nums = statsSec.querySelectorAll("[data-count]");
    const finalStr = (el) => (el.getAttribute("data-count") || "0") + (el.getAttribute("data-suffix") || "");
    const setFinal = () => {
      if (proj) proj.classList.add("is-drawn");
      nums.forEach((el) => { el.textContent = finalStr(el); });
    };
    const animate = () => {
      if (proj) proj.classList.add("is-drawn");
      nums.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count"), 10) || 0;
        const suffix = el.getAttribute("data-suffix") || "";
        const dur = 1500, start = performance.now();
        const tick = (t) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);            // easeOutCubic
          el.textContent = Math.round(target * eased) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else {
            el.textContent = target + suffix;
            el.classList.add("is-pop");                    // pop když doběhne
            setTimeout(() => el.classList.remove("is-pop"), 600);
          }
        };
        requestAnimationFrame(tick);
      });
    };
    if (reduceMotion || document.hidden) setFinal();       // skrytý tab / reduced-motion → rovnou finální hodnoty
    else whenInView(statsSec, animate, 0.3);

    // hover přes číslo → dráhy plynule zrychlí (playbackRate, žádný skok pozice)
    statsSec.querySelectorAll(".stat").forEach((stat) => {
      const orbits = stat.querySelectorAll(".orbit");
      const rate = (r) => orbits.forEach((o) => o.getAnimations().forEach((a) => { a.playbackRate = r; }));
      stat.addEventListener("pointerenter", () => rate(2.4));
      stat.addEventListener("pointerleave", () => rate(1));
    });
  }

  // Nav hover bubbles — GooeyNav (React Bits) particle burst, ported to vanilla.
  const navGoo = document.querySelector(".nav-goo");
  const navLinksWrap = document.querySelector(".nav__links");
  if (navGoo && navLinksWrap && !reduceMotion) {
    const PCOUNT = 14, DIST = [85, 10], R = 100, ANIM = 480, TVAR = 260;
    const COLORS = [1, 2, 3, 1, 2, 3, 1, 4];
    const noise = (n = 1) => n / 2 - Math.random() * n;
    const getXY = (dist, idx, total) => {
      const angle = ((360 + noise(8)) / total) * idx * (Math.PI / 180);
      return [dist * Math.cos(angle), dist * Math.sin(angle)];
    };
    const createParticle = (i, t, d, r) => {
      const rot = noise(r / 10);
      return {
        start: getXY(d[0], PCOUNT - i, PCOUNT),
        end: getXY(d[1] + noise(7), PCOUNT - i, PCOUNT),
        time: t, scale: 1 + noise(0.2),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotate: rot > 0 ? (rot + r / 20) * 10 : (rot - r / 20) * 10,
      };
    };
    const makeParticles = (el) => {
      el.style.setProperty("--time", (ANIM * 2 + TVAR) + "ms");
      for (let i = 0; i < PCOUNT; i++) {
        const t = ANIM * 2 + noise(TVAR * 2);
        const p = createParticle(i, t, DIST, R);
        setTimeout(() => {
          const particle = document.createElement("span");
          const point = document.createElement("span");
          particle.className = "particle";
          particle.style.setProperty("--start-x", p.start[0] + "px");
          particle.style.setProperty("--start-y", p.start[1] + "px");
          particle.style.setProperty("--end-x", p.end[0] + "px");
          particle.style.setProperty("--end-y", p.end[1] + "px");
          particle.style.setProperty("--time", p.time + "ms");
          particle.style.setProperty("--scale", p.scale);
          particle.style.setProperty("--color", "var(--color-" + p.color + ", #C45434)");
          particle.style.setProperty("--rotate", p.rotate + "deg");
          point.className = "point";
          particle.appendChild(point);
          el.appendChild(particle);
          setTimeout(() => { try { el.removeChild(particle); } catch (e) {} }, t);
        }, 30);
      }
    };
    const positionGoo = (link) => {
      const cr = navLinksWrap.getBoundingClientRect();
      const pr = link.getBoundingClientRect();
      navGoo.style.left = (pr.x - cr.x) + "px";
      navGoo.style.top = (pr.y - cr.y) + "px";
      navGoo.style.width = pr.width + "px";
      navGoo.style.height = pr.height + "px";
    };
    const navLinkEls = navLinksWrap.querySelectorAll("a");
    if (navLinkEls[0]) positionGoo(navLinkEls[0]);   // pre-place so the first hover slides the blob in
    navLinkEls.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        positionGoo(link);
        navGoo.classList.add("is-on");               // grow the blob behind this link
        navGoo.querySelectorAll(".particle").forEach((p) => { try { navGoo.removeChild(p); } catch (e) {} });
        makeParticles(navGoo);
      });
    });
    navLinksWrap.addEventListener("mouseleave", () => { navGoo.classList.remove("is-on"); });
  }

  /* ----------------------------------------------------
     5. Lenis smooth scroll (guarded)
     ---------------------------------------------------- */
  let lenis = null;
  try {
    if (!reduceMotion && typeof Lenis !== "undefined") {
      lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
      if (hasST) lenis.on("scroll", ScrollTrigger.update);
    }
  } catch (e) { lenis = null; }

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.4 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ----------------------------------------------------
     6. Nav — hide on scroll, dark-section invert
     ---------------------------------------------------- */
  // Nav stays fixed & always visible above the background; only its colour
  // inverts over dark sections.
  const nav = document.querySelector("[data-nav]");
  window.addEventListener("scroll", () => {
    if (!nav) return;
    let onDark = false;
    document.querySelectorAll("[data-section-dark]").forEach((sec) => {
      const r = sec.getBoundingClientRect();
      if (r.top <= 60 && r.bottom >= 60) onDark = true;
    });
    nav.classList.toggle("on-dark", onDark);
  }, { passive: true });

  /* ----------------------------------------------------
     7. Custom cursor + case morph + magnetic (guarded)
     ---------------------------------------------------- */
  if (cursor && !reduceMotion && canHover) {
    let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
    addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  function bindCursorTargets() {
    if (!cursor || reduceMotion || !canHover) return;
    document.querySelectorAll("[data-cursor-case]").forEach((el) => {
      if (el.dataset.cursorBound) return;
      el.dataset.cursorBound = "1";
      el.addEventListener("mouseenter", () => { cursor.classList.add("is-case"); if (cursorLabel) cursorLabel.textContent = "View case study →"; });
      el.addEventListener("mouseleave", () => { cursor.classList.remove("is-case"); if (cursorLabel) cursorLabel.textContent = ""; });
    });
    document.querySelectorAll("[data-cursor-hide]").forEach((el) => {
      if (el.dataset.cursorHideBound) return;
      el.dataset.cursorHideBound = "1";
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hidden"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hidden"));
    });
  }
  bindCursorTargets();

  if (!reduceMotion && canHover) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.18, max = 10;
      const clamp = (v) => Math.max(-max, Math.min(max, v));
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = clamp((e.clientX - (r.left + r.width / 2)) * strength);
        const y = clamp((e.clientY - (r.top + r.height / 2)) * strength);
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transition = "transform .45s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "translate(0,0)";
        setTimeout(() => (el.style.transition = ""), 450);
      });
    });
  }

  /* ----------------------------------------------------
     8. Fox tilt on cursor + GSAP scroll parallax (all optional)
     ---------------------------------------------------- */
  // Hero parallax: ONLY the fox layer (frontbg) drifts with the cursor; the
  // background layer (backbg) stays put — gives a sense of depth.
  const heroFg = document.querySelector("[data-hero-fg]");
  if (heroFg && !reduceMotion && canHover) {
    let x = 0, y = 0, tx = 0, ty = 0;
    addEventListener("mousemove", (e) => {
      tx = (e.clientX / innerWidth - 0.5) * -36;
      ty = (e.clientY / innerHeight - 0.5) * -22;
    });
    (function fgLoop() {
      x += (tx - x) * 0.07; y += (ty - y) * 0.07;
      heroFg.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(fgLoop);
    })();
  }

  if (hasST && !reduceMotion) {
    try {
      gsap.to(".hero__title", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
    } catch (e) {}
  }

  // Ambient particles around the fox — glowing embers drifting up + tiny leaves
  const particles = document.querySelector("[data-particles]");
  if (particles && !reduceMotion) {
    const R = (a, b) => a + Math.random() * (b - a);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("span");
      p.className = "p";
      p.style.cssText =
        `left:${R(46, 96).toFixed(1)}%;top:${R(12, 90).toFixed(1)}%;` +
        `--s:${R(2, 5).toFixed(1)}px;--o:${R(.4, .9).toFixed(2)};` +
        `--d:${R(4, 9).toFixed(1)}s;--delay:${R(0, 6).toFixed(1)}s;` +
        `--dx:${R(-16, 16).toFixed(0)}px;--dy:${R(-54, -18).toFixed(0)}px;`;
      frag.appendChild(p);
    }
    for (let i = 0; i < 7; i++) {
      const l = document.createElement("span");
      l.className = "leaf";
      l.style.cssText =
        `left:${R(48, 92).toFixed(1)}%;top:${R(6, 38).toFixed(1)}%;` +
        `--s:${R(6, 11).toFixed(1)}px;` +
        `--d:${R(7, 13).toFixed(1)}s;--delay:${R(0, 8).toFixed(1)}s;` +
        `--dx:${R(-42, 28).toFixed(0)}px;--dy:${R(120, 260).toFixed(0)}px;--rot:${R(180, 520).toFixed(0)}deg;`;
      frag.appendChild(l);
    }
    particles.appendChild(frag);
  }

  // Eyebrow typewriter — "Naše" stays fixed, the rest types in & deletes on a loop
  const typeEl = document.querySelector("[data-type]");
  if (typeEl) {
    const phrases = [
      "tempo je vražedné",
      "weby jsou promyšlené",
      "aplikace jsou funkční",
      "automatizace vám usnadní práci",
    ];
    if (reduceMotion) {
      typeEl.textContent = phrases[0];
    } else {
      let pi = 0, ci = 0, deleting = false;
      const tick = () => {
        const w = phrases[pi];
        ci += deleting ? -1 : 1;
        typeEl.textContent = w.slice(0, ci);
        let delay = deleting ? 38 : 70;
        if (!deleting && ci === w.length) { deleting = true; delay = 1700; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 360; }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  // A word blur-morphs through a list: it dissolves into a blur and the next
  // one focuses in from it. Used by the hero headline and the work title.
  function setupMorph(el, words, interval) {
    if (!el || reduceMotion) return;
    let i = 0;
    const OUT = 650, IN = 780;
    const morph = () => {
      el.style.transition = `filter ${OUT}ms ease, opacity ${OUT}ms ease, transform ${OUT}ms ease`;
      el.style.filter = "blur(16px)";
      el.style.opacity = "0";
      el.style.transform = "scale(1.06)";          // dissolves away, drifting larger
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.style.transition = "none";
        el.style.filter = "blur(16px)";
        el.style.opacity = "0";
        el.style.transform = "scale(0.96)";        // next waits, blurred & small
        void el.offsetWidth;                        // reflow
        el.style.transition = `filter ${IN}ms ease, opacity ${IN}ms ease, transform ${IN}ms ease`;
        el.style.filter = "blur(0px)";
        el.style.opacity = "1";
        el.style.transform = "scale(1)";            // ...focuses sharp into place
      }, OUT);
    };
    setInterval(morph, interval);
  }
  // every cycling headline waits until its section is actually in view
  const heroFlipEl = document.querySelector("[data-flip]");
  whenInView(heroFlipEl, () => setupMorph(heroFlipEl, ["produkty", "aplikace", "weby"], 4400));

  // Work title: the 2nd line types itself in and deletes on a loop (with a caret)
  function setupTypewriter(el, words, caretClass, opts) {
    if (!el) return;
    opts = opts || {};
    el.style.filter = ""; el.style.opacity = ""; el.style.transform = ""; el.style.transition = "";
    let caret = null;
    if (caretClass) {
      caret = document.createElement("i");
      caret.className = caretClass;
      caret.setAttribute("aria-hidden", "true");
      if (el.parentNode) el.parentNode.insertBefore(caret, el.nextSibling);
    }
    if (reduceMotion) { el.textContent = words[0]; if (caret) caret.style.display = "none"; return; }
    const HOLD = opts.hold || 1500;
    const RETRACT = 420;                       // time for the rule to pull back
    let wi = 0, ci = 0, deleting = false;
    el.textContent = "";
    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      el.textContent = w.slice(0, ci);
      let delay = deleting ? 45 : 80;
      if (!deleting && ci === w.length) {
        deleting = true;
        if (opts.underline) {
          // word complete → draw the rule, hold, retract it, only then delete
          el.classList.add("is-full");
          setTimeout(() => {
            el.classList.remove("is-full");
            setTimeout(tick, RETRACT);
          }, HOLD);
          return;
        }
        delay = HOLD;
      } else if (deleting && ci === 0) {
        deleting = false; wi = (wi + 1) % words.length; delay = 380;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 500);
  }
  const workFlipEl = document.querySelector("[data-work-flip]");
  whenInView(workFlipEl, () =>
    setupTypewriter(workFlipEl, ["dávají smysl", "usnadní práci", "pracují za vás"], "work__caret"));
  // "Co děláme" headline: the middle line cycles Aplikace ↔ Automatizace (no caret — the square is the full stop)
  const whatFlipEl = document.querySelector("[data-what-flip]");
  whenInView(whatFlipEl, () => setupTypewriter(whatFlipEl, ["Aplikace", "Automatizace"], null));
  // "Náš přístup" headline: the last word cycles through what we sweat over
  const approachFlipEl = document.querySelector("[data-approach-flip]");
  whenInView(approachFlipEl, () =>
    setupTypewriter(approachFlipEl, ["detail", "funkčnost", "přehlednost"], null));
  // Contact headline: "Máte nápad na …?" — the noun cycles, the "?" stays put
  // Contact headline: the noun WIPES across rather than typing — the typewriter
  // is already used twice further up the page, so this needed its own language.
  function setupWordWipe(el, words, opts) {
    if (!el) return;
    opts = opts || {};
    // RETRACT matches the 1s stroke transition, so the pen line is fully pulled
    // back before the word wipes away
    const HOLD = opts.hold || 2600, OUT = 560, IN = 680, RETRACT = 900;
    if (reduceMotion) { el.textContent = words[0]; el.classList.add("is-full"); return; }
    let i = 0;
    const stroke = (on) => el.classList.toggle("is-full", on);
    const next = () => {
      stroke(false);                                       // pull the pen stroke back
      setTimeout(() => {
        el.style.transition = "clip-path " + OUT + "ms var(--ease), opacity " + OUT + "ms ease";
        el.style.clipPath = "inset(0 0 0 100%)";            // wipe away to the right
        el.style.opacity = "0";
        setTimeout(() => {
          i = (i + 1) % words.length;
          el.textContent = words[i];
          el.style.transition = "none";                     // park it, ready to wipe in
          el.style.clipPath = "inset(0 100% 0 0)";
          void el.offsetWidth;
          el.style.transition = "clip-path " + IN + "ms var(--ease), opacity " + IN + "ms ease";
          el.style.clipPath = "inset(0 0 0 0)";
          el.style.opacity = "1";
          setTimeout(() => { stroke(true); setTimeout(next, HOLD); }, IN);
        }, OUT);
      }, RETRACT);
    };
    el.style.clipPath = "inset(0 0 0 0)";
    setTimeout(() => { stroke(true); setTimeout(next, HOLD); }, 400);
  }
  const contactFlipEl = document.querySelector("[data-contact-flip]");
  whenInView(contactFlipEl, () => setupWordWipe(contactFlipEl,
    ["projekt?", "vlastní web?", "aplikaci?", "automatizaci?"], { hold: 2600 }));

  /* ----------------------------------------------------
     Contact modal — "Popta se"
     ---------------------------------------------------- */
  // Mobilní burger menu
  const burger = document.querySelector("[data-nav-toggle]");
  const mnav = document.querySelector("[data-mobile-menu]");
  if (burger && mnav) {
    const setMenu = (open) => {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      if (lenis) { open ? lenis.stop() : lenis.start(); }
    };
    burger.addEventListener("click", () =>
      setMenu(!document.body.classList.contains("menu-open")));
    // klik na položku menu zavře; kotva musí odscrollovat AŽ po restartu lenisu,
    // jinak generický a[href^="#"] handler scrolluje do zastaveného lenisu (= nic)
    mnav.querySelectorAll("[data-mlink]").forEach((el) => {
      el.addEventListener("click", () => {
        setMenu(false);
        const href = el.getAttribute("href");
        if (href && href.charAt(0) === "#") {
          const target = document.querySelector(href);
          if (target) setTimeout(() => {
            if (lenis) lenis.scrollTo(target, { duration: 1.1 });
            else target.scrollIntoView({ behavior: "smooth" });
          }, 80);
        }
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) setMenu(false);
    });
  }

  const modal = document.querySelector("[data-modal]");
  if (modal) {
    const openModal = () => {
      modal.hidden = false;
      if (lenis) lenis.stop();
      document.body.style.overflow = "hidden";
      requestAnimationFrame(() => modal.classList.add("is-open"));
      const first = modal.querySelector("input, textarea");
      setTimeout(() => first && first.focus(), 320);
    };
    const closeModal = () => {
      modal.classList.remove("is-open");
      if (lenis) lenis.start();
      document.body.style.overflow = "";
      setTimeout(() => { modal.hidden = true; }, 400);
    };
    document.querySelectorAll("[data-modal-open]").forEach((b) => b.addEventListener("click", (e) => {
      // the contact e-mail is a real mailto: link — keep it as a no-JS fallback
      // but open the enquiry modal instead when JS is running
      if (b.tagName === "A") e.preventDefault();
      openModal();
    }));
    document.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", closeModal));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

    const form = modal.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const submit = form.querySelector(".modal__submit");
        const prevHTML = submit ? submit.innerHTML : "";
        if (submit) { submit.disabled = true; submit.innerHTML = "Odesílám…"; }
        // smaž případnou předchozí chybovou hlášku
        const oldErr = form.querySelector(".modal__error");
        if (oldErr) oldErr.remove();
        try {
          const res = await fetch(form.getAttribute("action") || "send.php", {
            method: "POST",
            body: new FormData(form),
            headers: { "Accept": "application/json" },
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.ok) throw new Error(data.error || "Odeslání se nezdařilo.");
          form.innerHTML =
            '<div class="modal__success"><h3>Děkujeme!</h3>' +
            '<p>Vaše poptávka dorazila, ozveme se vám co nejdřív.</p></div>';
        } catch (err) {
          if (submit) { submit.disabled = false; submit.innerHTML = prevHTML; }
          const p = document.createElement("p");
          p.className = "modal__error";
          p.textContent = (err && err.message) ? err.message : "Odeslání se nezdařilo, zkuste to prosím znovu.";
          if (submit) submit.insertAdjacentElement("beforebegin", p);
          else form.appendChild(p);
        }
      });
    }
  }

})();
