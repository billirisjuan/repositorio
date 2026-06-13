/* ═══════════════════════════════════════════════════════════════
   AWARE — main.js
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── NAVBAR scroll ──────────────────────────────────────────── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  /* ── MOBILE menu ────────────────────────────────────────────── */
  var toggle = document.getElementById('navToggle');
  var links  = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });

  links.querySelectorAll('.nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('open');
      links.classList.remove('open');
    });
  });

  /* ── WhatsApp por producto ──────────────────────────────────── */
  var WSP_NUMBER = '5491100000000'; // ← reemplazá con el número real

  window.consultarWsp = function (producto) {
    var msg = encodeURIComponent(
      'Hola AWARE! 🧉 Quiero consultar sobre: ' + producto
    );
    window.open('https://wa.me/' + WSP_NUMBER + '?text=' + msg, '_blank');
  };

  /* ── Animaciones de entrada ─────────────────────────────────── */
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.producto-card, .stat, .nosotros-texto p').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    });
  }

})();
