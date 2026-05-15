/* Approve The Move — progressive enhancement.
   The page is fully functional without this script;
   it only adds interactivity. The no-flash theme is
   set by a tiny inline script in the document <head>. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'atm-theme';

  /* ---- Theme toggle ---------------------------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncThemeColor(theme) {
    var color = theme === 'light' ? '#fafafa' : '#09090b';
    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', color);
  }

  function syncToggle(btn, theme) {
    var isLight = theme === 'light';
    btn.setAttribute('aria-pressed', String(isLight));
    btn.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }

  function initTheme() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    syncToggle(btn, currentTheme());
    syncThemeColor(currentTheme());

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncToggle(btn, next);
      syncThemeColor(next);
    });
  }

  /* ---- Mobile navigation ----------------------------- */

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(menu.classList.contains('open') === false);
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (
        menu.classList.contains('open') &&
        !e.target.closest('#nav-menu') &&
        !e.target.closest('[data-nav-toggle]')
      ) {
        setOpen(false);
      }
    });
  }

  /* ---- Back to top ----------------------------------- */

  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;
    var ticking = false;

    function update() {
      btn.classList.toggle('visible', window.scrollY > 400);
      ticking = false;
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---- Scroll reveal --------------------------------- */

  function initReveal() {
    var targets = document.querySelectorAll(
      '.app-card, .feature-item, .step, .privacy-hub-card, .content-section, .about-content'
    );
    if (!targets.length) return;

    var reduced =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    targets.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ---- Init ------------------------------------------ */

  function init() {
    initTheme();
    initNav();
    initBackToTop();
    initReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
