(function () {
  'use strict';

  var WSP_NUMBER = '542604821170';

  /* ── Navbar scroll ── */
  var navbar = document.getElementById('navbar');
  window.addEventListener('scroll', function () {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Menú mobile ── */
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

  /* ── WhatsApp por producto ── */
  window.consultarWsp = function (producto) {
    var msg = encodeURIComponent('Hola AWARE! 🧉 Quiero consultar sobre: ' + producto);
    window.open('https://wa.me/' + WSP_NUMBER + '?text=' + msg, '_blank');
  };

  /* ── Animaciones de entrada ── */
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('.producto-card, .stat, .nosotros-texto p').forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      obs.observe(el);
    });
  }

})();
