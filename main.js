/* ═══════════════════════════════════════════════════════════════
   EBIKESCENTER — main.js
   Patrón IIFE. Sin ES modules, sin import/export.
   Cada init envuelto en safe() para que un fallo no rompa el resto.
════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── SAFE WRAPPER ────────────────────────────────────────── */
  function safe(fn, name) {
    try { fn(); }
    catch (e) { console.warn('[EBikes] ' + name + ' falló:', e); }
  }

  /* ── DATOS DEL MANIFEST ──────────────────────────────────── */
  var D = window.__EBIKES__ || {};
  var bikes    = D.bikes    || [];
  var services = D.services || [];
  var gallery  = D.gallery  || [];

  /* ══════════════════════════════════════════════════════════
     1. SPLASH — doble red de seguridad
  ════════════════════════════════════════════════════════ */
  safe(function initSplash() {
    var splash = document.getElementById('splash');
    if (!splash) return;

    function hideSplash() {
      splash.classList.add('is-hidden');
      document.body.style.overflow = '';
    }

    document.body.style.overflow = 'hidden';
    // CSS ya hace fadeOut a 4.5s; JS es la red de seguridad a 5.2s
    var timer = setTimeout(hideSplash, 5200);
    // Si DOMContentLoaded ya disparó, ocultar antes si todo cargó
    window.addEventListener('load', function () {
      clearTimeout(timer);
      setTimeout(hideSplash, 500);
    }, { once: true });
  }, 'splash');

  /* ══════════════════════════════════════════════════════════
     2. CURSOR PERSONALIZADO
  ════════════════════════════════════════════════════════ */
  safe(function initCursor() {
    var cursor = document.getElementById('cursor');
    var ring   = cursor && cursor.querySelector('.cursor__ring');
    var label  = document.getElementById('cursorLabel');
    if (!cursor) return;

    // Ocultar en touch
    if (window.matchMedia('(hover: none)').matches) {
      cursor.style.display = 'none';
      return;
    }

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    });

    // Ring sigue con lag
    (function loopRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ring) ring.style.transform = 'translate(' + (rx - mx) + 'px,' + (ry - my) + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loopRing);
    })();

    // Labels contextuales
    var interactives = document.querySelectorAll('[data-cursor]');
    interactives.forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('cursor--active');
        if (label) label.textContent = el.dataset.cursor || '';
      });
      el.addEventListener('mouseleave', function () {
        cursor.classList.remove('cursor--active');
        if (label) label.textContent = '';
      });
    });
  }, 'cursor');

  /* ══════════════════════════════════════════════════════════
     3. NAV — scroll + burger
  ════════════════════════════════════════════════════════ */
  safe(function initNav() {
    var nav     = document.getElementById('nav');
    var burger  = document.getElementById('navBurger');
    var overlay = document.getElementById('navOverlay');

    if (nav) {
      window.addEventListener('scroll', function () {
        nav.classList.toggle('is-scrolled', window.scrollY > 60);
      }, { passive: true });
    }

    if (burger && overlay) {
      burger.addEventListener('click', function () {
        var open = overlay.classList.toggle('is-open');
        burger.classList.toggle('is-open', open);
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
        document.body.style.overflow = open ? 'hidden' : '';
      });
      overlay.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          overlay.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          overlay.setAttribute('aria-hidden', 'true');
          document.body.style.overflow = '';
        });
      });
    }
  }, 'nav');

  /* ══════════════════════════════════════════════════════════
     4. REVEAL ANIMATIONS (IntersectionObserver + fallback 6s)
  ════════════════════════════════════════════════════════ */
  safe(function initReveals() {
    var els = document.querySelectorAll('.reveal[data-split]');

    // Marcar como JS-ready para activar la animación CSS
    els.forEach(function (el) { el.classList.add('js-ready'); });

    // Safety timeout: revelar todo lo que siga oculto tras 6s
    var safetyTimer = setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-visible'); });
    }, 6000);

    if (!('IntersectionObserver' in window)) {
      clearTimeout(safetyTimer);
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }, 'reveals');

  /* ══════════════════════════════════════════════════════════
     5. GSAP + ScrollTrigger (reveal mejorado y parallax hero)
  ════════════════════════════════════════════════════════ */
  safe(function initGSAP() {
    if (typeof gsap === 'undefined') return;
    if (typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

    // Parallax hero bg
    var heroBg = document.querySelector('.hero__bg img');
    if (heroBg && typeof ScrollTrigger !== 'undefined') {
      gsap.to(heroBg, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    // Tilt suave en flotas card
    var flotasCard = document.getElementById('flotasCard');
    if (flotasCard) {
      flotasCard.addEventListener('mousemove', function (e) {
        var r = flotasCard.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top)  / r.height - 0.5;
        gsap.to(flotasCard, {
          rotateY: x * 5,
          rotateX: -y * 3,
          duration: 0.5,
          ease: 'power2.out',
          transformPerspective: 1200,
        });
      });
      flotasCard.addEventListener('mouseleave', function () {
        gsap.to(flotasCard, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    }

  }, 'gsap');

  /* ══════════════════════════════════════════════════════════
     6. MARQUEES — duplicar contenido para loop infinito
  ════════════════════════════════════════════════════════ */
  safe(function initMarquees() {
    ['marqueeTop', 'marqueeSpecs'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      // Duplicar para loop sin saltos
      el.innerHTML += el.innerHTML;
    });
  }, 'marquees');

  /* ══════════════════════════════════════════════════════════
     7. GENERADOR DE CARDS DE BICICLETAS (SVG poligonal)
  ════════════════════════════════════════════════════════ */

  /* Plantillas SVG por tipo de cuadro */
  function getBikeSVG(bike) {
    var c = bike.accent || '#00C2FF';
    var fill = bike.liquid || '#1a4a8a';
    var type = bike.glass || 'diamond';

    var svgs = {

      'diamond': '<svg class="bike-svg" viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(120, 220, 80, c) + wheelFront(360, 220, 80, c) +
        '<polygon class="svg-stroke svg-fill" points="200,220 240,100 280,220" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="120" y1="220" x2="200" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="200" y1="220" x2="240" y2="100" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="240" y1="100" x2="280" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="280" y1="220" x2="360" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        saddle(200, 220, c) + handlebar(280, 220, 310, 110, c) + fork(310, 110, 360, 220, c) +
        pedalier(240, 220, c) + battery(215, 155, c, fill) + display(296, 104, c) +
        motorHub(120, 220, c) + '</svg>',

      'full-sus': '<svg class="bike-svg" viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(110, 225, 75, c) + wheelFront(370, 225, 75, c) +
        '<polygon class="svg-stroke" points="185,225 225,115 265,190 240,225" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="110" y1="225" x2="185" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="185" y1="225" x2="225" y2="115" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="225" y1="115" x2="295" y2="200" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="265" y1="190" x2="310" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="310" y1="225" x2="370" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<circle class="svg-stroke" cx="265" cy="190" r="10" stroke="' + c + '" stroke-width="2" fill="' + fill + '" fill-opacity=".5"/>' +
        saddle(185, 225, c) + handlebar(295, 200, 320, 112, c) + fork(320, 112, 370, 225, c) +
        pedalier(237, 225, c) + battery(205, 150, c, fill) +
        motorHub(110, 225, c) + '</svg>',

      'longtail': '<svg class="bike-svg" viewBox="0 0 520 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(100, 225, 78, c) + wheelFront(390, 225, 78, c) +
        '<line class="svg-stroke" x1="100" y1="225" x2="390" y2="225" stroke="' + c + '" stroke-width="3"/>' +
        '<polygon class="svg-stroke" points="200,225 235,110 275,225" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="200" y1="225" x2="235" y2="110" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="235" y1="110" x2="275" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<rect class="svg-stroke" x="100" y="200" width="120" height="28" rx="4" fill="' + fill + '" fill-opacity=".4" stroke="' + c + '" stroke-width="1.5"/>' +
        '<line class="svg-stroke" x1="115" y1="205" x2="205" y2="205" stroke="' + c + '" stroke-width="1" opacity=".5"/>' +
        saddle(200, 225, c) + handlebar(275, 225, 305, 112, c) + fork(305, 112, 390, 225, c) +
        pedalier(240, 225, c) + battery(210, 150, c, fill) +
        motorHub(100, 225, c) + '</svg>',

      'folding': '<svg class="bike-svg" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(100, 215, 65, c) + wheelFront(300, 215, 65, c) +
        '<polygon class="svg-stroke" points="170,215 200,110 230,215" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="100" y1="215" x2="170" y2="215" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="170" y1="215" x2="200" y2="110" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="200" y1="110" x2="230" y2="215" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="230" y1="215" x2="300" y2="215" stroke="' + c + '" stroke-width="2.5"/>' +
        '<circle cx="200" cy="215" r="14" fill="none" stroke="' + c + '" stroke-width="1.5" stroke-dasharray="4 4" class="svg-stroke"/>' +
        saddle(170, 215, c) + handlebar(230, 215, 255, 108, c) + fork(255, 108, 300, 215, c) +
        pedalier(200, 215, c) + '</svg>',

      'speed': '<svg class="bike-svg" viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(115, 210, 82, c) + wheelFront(365, 210, 82, c) +
        '<polygon class="svg-stroke" points="195,210 240,92 282,210" fill="' + fill + '" fill-opacity=".35" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="115" y1="210" x2="195" y2="210" stroke="' + c + '" stroke-width="3"/>' +
        '<line class="svg-stroke" x1="195" y1="210" x2="240" y2="92" stroke="' + c + '" stroke-width="3"/>' +
        '<line class="svg-stroke" x1="240" y1="92" x2="282" y2="210" stroke="' + c + '" stroke-width="3"/>' +
        '<line class="svg-stroke" x1="282" y1="210" x2="365" y2="210" stroke="' + c + '" stroke-width="3"/>' +
        '<path class="svg-stroke" d="M282 210 Q320 170 365 210" fill="none" stroke="' + c + '" stroke-width="2.5"/>' +
        saddle(195, 210, c) + handlebar(282, 210, 315, 98, c) + fork(315, 98, 365, 210, c) +
        pedalier(240, 210, c) + battery(215, 145, c, fill) + display(300, 92, c) +
        motorHub(115, 210, c) + '</svg>',

      'gravel': '<svg class="bike-svg" viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBackGravel(120, 220, 80, c) + wheelFrontGravel(360, 220, 80, c) +
        '<polygon class="svg-stroke" points="200,220 242,100 280,220" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="120" y1="220" x2="200" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="200" y1="220" x2="242" y2="100" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="242" y1="100" x2="280" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="280" y1="220" x2="360" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        saddle(200, 220, c) + handlebarDropped(280, 220, 315, 100, c) + fork(315, 100, 360, 220, c) +
        pedalier(242, 220, c) + battery(218, 152, c, fill) + '</svg>',

      'dutch': '<svg class="bike-svg" viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(115, 225, 80, c) + wheelFront(365, 225, 80, c) +
        '<path class="svg-stroke" d="M195 225 Q200 150 242 108 Q262 200 282 225" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="115" y1="225" x2="195" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="282" y1="225" x2="365" y2="225" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="195" y1="225" x2="210" y2="120" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="185" y1="118" x2="228" y2="118" stroke="' + c + '" stroke-width="3.5"/>' +
        handlebar(282, 225, 308, 108, c) + fork(308, 108, 365, 225, c) +
        pedalier(242, 225, c) + battery(218, 155, c, fill) +
        motorHub(115, 225, c) + '</svg>',

      'kids': '<svg class="bike-svg" viewBox="0 0 380 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(95, 200, 68, c) + wheelFront(285, 200, 68, c) +
        '<polygon class="svg-stroke" points="165,200 190,108 218,200" fill="' + fill + '" fill-opacity=".35" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="95" y1="200" x2="165" y2="200" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="165" y1="200" x2="190" y2="108" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="190" y1="108" x2="218" y2="200" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="218" y1="200" x2="285" y2="200" stroke="' + c + '" stroke-width="2.5"/>' +
        saddle(165, 200, c) + handlebar(218, 200, 240, 105, c) + fork(240, 105, 285, 200, c) +
        pedalier(190, 200, c) + '</svg>',

      'trekking': '<svg class="bike-svg" viewBox="0 0 480 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelBack(115, 220, 80, c) + wheelFront(365, 220, 80, c) +
        '<polygon class="svg-stroke" points="195,220 238,100 278,220" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="115" y1="220" x2="195" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="195" y1="220" x2="238" y2="100" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="238" y1="100" x2="278" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<line class="svg-stroke" x1="278" y1="220" x2="365" y2="220" stroke="' + c + '" stroke-width="2.5"/>' +
        '<rect class="svg-stroke" x="115" y="198" width="70" height="14" rx="3" fill="' + fill + '" fill-opacity=".4" stroke="' + c + '" stroke-width="1.5"/>' +
        saddle(195, 220, c) + handlebar(278, 220, 305, 105, c) + fork(305, 105, 365, 220, c) +
        pedalier(238, 220, c) + battery(215, 145, c, fill) + display(292, 99, c) +
        motorHub(115, 220, c) + '</svg>',

      'road': '<svg class="bike-svg" viewBox="0 0 480 300" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        wheelRoad(115, 210, 84, c) + wheelRoad(365, 210, 84, c) +
        '<polygon class="svg-stroke" points="195,210 240,88 280,210" fill="' + fill + '" fill-opacity=".3" stroke="' + c + '" stroke-width="1.8"/>' +
        '<line class="svg-stroke" x1="115" y1="210" x2="195" y2="210" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="195" y1="210" x2="240" y2="88" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="240" y1="88" x2="280" y2="210" stroke="' + c + '" stroke-width="2"/>' +
        '<line class="svg-stroke" x1="280" y1="210" x2="365" y2="210" stroke="' + c + '" stroke-width="2"/>' +
        saddle(195, 210, c) + handlebarDropped(280, 210, 312, 92, c) + fork(312, 92, 365, 210, c) +
        pedalier(240, 210, c) + batteryIntegrated(214, 148, c, fill) +
        '</svg>',
    };

    return svgs[type] || svgs['diamond'];
  }

  /* ── SVG Helpers ─────────────────────────────────────────── */
  function wheelBack(cx, cy, r, c) {
    var spokes = '';
    for (var a = 0; a < 6; a++) {
      var rad = (a * 60) * Math.PI / 180;
      var x2 = cx + Math.cos(rad) * r;
      var y2 = cy + Math.sin(rad) * r;
      spokes += '<line class="svg-stroke" x1="' + cx + '" y1="' + cy + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="1.2" opacity=".5"/>';
    }
    return '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="' + c + '" stroke-width="2.2"/>' +
           '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="9" stroke="' + c + '" stroke-width="1.8"/>' +
           spokes;
  }
  function wheelFront(cx, cy, r, c) { return wheelBack(cx, cy, r, c); }
  function wheelRoad(cx, cy, r, c) {
    return '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="' + c + '" stroke-width="1.5"/>' +
           '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="' + (r - 8) + '" stroke="' + c + '" stroke-width="1" opacity=".3"/>' +
           '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + c + '"/>';
  }
  function wheelBackGravel(cx, cy, r, c) {
    return '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="' + r + '" stroke="' + c + '" stroke-width="3"/>' +
           '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="9" stroke="' + c + '" stroke-width="1.8"/>';
  }
  function wheelFrontGravel(cx, cy, r, c) { return wheelBackGravel(cx, cy, r, c); }
  function saddle(x, y, c) {
    return '<line class="svg-stroke" x1="' + x + '" y1="' + y + '" x2="' + (x+10) + '" y2="' + (y-102) + '" stroke="' + c + '" stroke-width="2"/>' +
           '<line class="svg-stroke" x1="' + (x-10) + '" y1="' + (y-102) + '" x2="' + (x+28) + '" y2="' + (y-102) + '" stroke="' + c + '" stroke-width="3.5"/>';
  }
  function handlebar(x1, y1, x2, y2, c) {
    return '<line class="svg-stroke" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="2"/>' +
           '<line class="svg-stroke" x1="' + (x2-14) + '" y1="' + (y2-2) + '" x2="' + (x2+16) + '" y2="' + (y2+12) + '" stroke="' + c + '" stroke-width="3"/>';
  }
  function handlebarDropped(x1, y1, x2, y2, c) {
    return '<line class="svg-stroke" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="2"/>' +
           '<path class="svg-stroke" d="M' + (x2-12) + ' ' + (y2-4) + ' Q' + x2 + ' ' + y2 + ' ' + (x2+14) + ' ' + (y2+18) + '" fill="none" stroke="' + c + '" stroke-width="3"/>';
  }
  function fork(x1, y1, x2, y2, c) {
    return '<line class="svg-stroke" x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + c + '" stroke-width="2"/>';
  }
  function pedalier(cx, cy, c) {
    return '<circle class="svg-stroke" cx="' + cx + '" cy="' + cy + '" r="16" stroke="' + c + '" stroke-width="2"/>' +
           '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="' + c + '"/>' +
           '<line class="svg-stroke" x1="' + (cx-16) + '" y1="' + cy + '" x2="' + (cx-28) + '" y2="' + (cy+14) + '" stroke="' + c + '" stroke-width="2.5"/>' +
           '<line class="svg-stroke" x1="' + (cx+16) + '" y1="' + cy + '" x2="' + (cx+28) + '" y2="' + (cy-14) + '" stroke="' + c + '" stroke-width="2.5"/>';
  }
  function battery(x, y, c, fill) {
    return '<rect class="svg-stroke" x="' + x + '" y="' + y + '" width="30" height="52" rx="5" fill="' + fill + '" fill-opacity=".55" stroke="' + c + '" stroke-width="1.5"/>' +
           '<rect x="' + (x+9) + '" y="' + (y-5) + '" width="12" height="6" rx="2" fill="' + c + '" opacity=".8"/>' +
           '<line x1="' + (x+7) + '" y1="' + (y+12) + '" x2="' + (x+23) + '" y2="' + (y+12) + '" stroke="' + c + '" stroke-width="1" opacity=".5"/>' +
           '<line x1="' + (x+7) + '" y1="' + (y+20) + '" x2="' + (x+23) + '" y2="' + (y+20) + '" stroke="' + c + '" stroke-width="1" opacity=".4"/>' +
           '<line x1="' + (x+7) + '" y1="' + (y+28) + '" x2="' + (x+18) + '" y2="' + (y+28) + '" stroke="' + c + '" stroke-width="1" opacity=".3"/>';
  }
  function batteryIntegrated(x, y, c, fill) {
    return '<rect class="svg-stroke" x="' + x + '" y="' + y + '" width="52" height="18" rx="5" fill="' + fill + '" fill-opacity=".55" stroke="' + c + '" stroke-width="1.5"/>' +
           '<rect x="' + (x+52) + '" y="' + (y+5) + '" width="5" height="8" rx="2" fill="' + c + '" opacity=".7"/>';
  }
  function display(x, y, c) {
    return '<rect class="svg-stroke" x="' + x + '" y="' + y + '" width="24" height="15" rx="3" fill="#0A0F1C" stroke="' + c + '" stroke-width="1.5"/>' +
           '<line x1="' + (x+4) + '" y1="' + (y+6) + '" x2="' + (x+18) + '" y2="' + (y+6) + '" stroke="' + c + '" stroke-width="1" opacity=".7"/>' +
           '<line x1="' + (x+4) + '" y1="' + (y+10) + '" x2="' + (x+14) + '" y2="' + (y+10) + '" stroke="' + c + '" stroke-width="1" opacity=".5"/>';
  }
  function motorHub(cx, cy, c) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="18" fill="' + c + '" fill-opacity=".12" stroke="' + c + '" stroke-width="1.5"/>';
  }

  /* ── Render de bike cards (cards 2-10) ───────────────────── */
  safe(function renderBikeCards() {
    if (!bikes.length) return;
    var mount = document.getElementById('bikeCardsMount');
    if (!mount) return;
    if (mount.children.length > 0) return; // idempotente

    var html = '';
    for (var i = 1; i < bikes.length; i++) {
      var b = bikes[i];
      var specsHtml = (b.specs || []).map(function (s) { return '<li>' + s + '</li>'; }).join('');
      html +=
        '<article class="bike-card" data-bike="' + i + '" aria-label="' + b.name + ' — ' + b.subtitle + '">' +
          '<div class="bike-card__visual">' + getBikeSVG(b) + '</div>' +
          '<div class="bike-card__info">' +
            '<span class="bike-card__series">' + b.series + '</span>' +
            '<h3 class="bike-card__name">' + b.name + '</h3>' +
            '<p class="bike-card__subtitle">' + b.subtitle + '</p>' +
            '<ul class="bike-card__specs">' + specsHtml + '</ul>' +
            '<p class="bike-card__desc">' + b.description + '</p>' +
            '<div class="bike-card__footer">' +
              '<span class="bike-card__price">' + (b.price || '') + '</span>' +
              '<a class="bike-card__cta" href="#reserva" data-cursor="reservar">Probarla →</a>' +
            '</div>' +
          '</div>' +
        '</article>';
    }
    mount.innerHTML = html;
  }, 'renderBikeCards');

  /* ══════════════════════════════════════════════════════════
     8. SCROLL HORIZONTAL BICIS (desktop pin / móvil swipe)
  ════════════════════════════════════════════════════════ */
  safe(function initBikeScroll() {
    var track   = document.getElementById('modelosTrack');
    var wrapper = document.getElementById('modelosPin');
    var current = document.getElementById('bikeProgressCurrent');
    if (!track || !wrapper) return;

    var isDesktop = window.matchMedia('(min-width: 701px)');

    function updateProgress() {
      if (!current) return;
      var cards = track.querySelectorAll('.bike-card');
      var scrollLeft = track.scrollLeft;
      var cardW = track.offsetWidth;
      var idx = Math.round(scrollLeft / cardW);
      current.textContent = String(idx + 1).padStart(2, '0');
    }

    track.addEventListener('scroll', updateProgress, { passive: true });

    // Desktop: convertir scroll vertical en horizontal (via GSAP si disponible)
    if (isDesktop.matches && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      var cards = track.querySelectorAll('.bike-card');
      var totalCards = cards.length;
      var scrollWidth = track.scrollWidth;

      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: function () { return '+=' + (scrollWidth - track.offsetWidth + 200); },
        pin: true,
        scrub: 1,
        onUpdate: function (self) {
          var max = scrollWidth - track.offsetWidth;
          track.scrollLeft = self.progress * max;
          updateProgress();
        }
      });
    }

    // SVG draw on enter
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-drawing');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    function observeCards() {
      track.querySelectorAll('.bike-card').forEach(function (c) { obs.observe(c); });
    }
    observeCards();
    // Re-observe cuando JS inserta las demás cards
    setTimeout(observeCards, 500);

  }, 'bikeScroll');

  /* ══════════════════════════════════════════════════════════
     9. GALERÍA — duplicar lanes para loop
  ════════════════════════════════════════════════════════ */
  safe(function initGalleryLanes() {
    ['galLane1', 'galLane2', 'galLane3'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.innerHTML += el.innerHTML;
    });
  }, 'galleryLanes');

  /* ══════════════════════════════════════════════════════════
     10. FORMULARIO — envío por WhatsApp
  ════════════════════════════════════════════════════════ */
  safe(function initForm() {
    var form = document.getElementById('reservaForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nombre   = (form.querySelector('#f-nombre')   || {}).value || '';
      var telefono = (form.querySelector('#f-telefono') || {}).value || '';
      var dia      = (form.querySelector('#f-dia')      || {}).value || '';
      var modelo   = (form.querySelector('#f-modelo')   || {}).value || '';
      var nota     = (form.querySelector('#f-nota')     || {}).value || '';

      if (!nombre || !telefono || !dia) {
        alert('Por favor rellena nombre, teléfono y día preferido.');
        return;
      }

      var msg = '¡Hola EBikesCenter! 👋\n\n' +
        'Me llamo *' + nombre + '* y quiero reservar un test ride.\n' +
        '📞 Teléfono: ' + telefono + '\n' +
        '📅 Día preferido: ' + dia + '\n' +
        (modelo ? '🚲 Modelo de interés: ' + modelo + '\n' : '') +
        (nota   ? '📝 Nota: ' + nota + '\n'               : '') +
        '\n¡Gracias!';

      var wa = (D.brand && D.brand.whatsapp) ? D.brand.whatsapp.replace(/\D/g, '') : '34910556677';
      window.open('https://wa.me/' + wa + '?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');
    });
  }, 'form');

  /* ══════════════════════════════════════════════════════════
     11. GALERÍA DINÁMICA (si se usan imágenes del manifest)
  ════════════════════════════════════════════════════════ */
  /* Las imágenes están hardcodeadas en el HTML; este bloque es
     un refuerzo idempotente para que el cliente pueda añadir
     imágenes en manifest.js sin tocar el HTML. */

  /* ══════════════════════════════════════════════════════════
     12. SERVICIOS — poblar desde manifest si HTML vacío
  ════════════════════════════════════════════════════════ */
  /* Los servicios están hardcodeados en HTML para no-JS safety.
     El JS solo añade las barras de progreso via IntersectionObserver. */
  safe(function initServiciosBars() {
    var cards = document.querySelectorAll('.servicio-card');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    cards.forEach(function (c) { obs.observe(c); });
  }, 'serviciosBars');

  /* ══════════════════════════════════════════════════════════
     13. INIT GLOBAL — log de marca
  ════════════════════════════════════════════════════════ */
  safe(function initBrandLog() {
    console.log(
      '%c EBikesCenter %c Muévete. Sin límites. ',
      'background:#00C2FF;color:#0A0F1C;font-weight:700;font-size:14px;padding:4px 8px;',
      'background:#0A0F1C;color:#00C2FF;font-size:12px;padding:4px 8px;'
    );
  }, 'brandLog');

})();
