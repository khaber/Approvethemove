/* Approve The Move — progressive enhancements for Doha Afterlight.
   Navigation, content, themes, and links remain usable without this file. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'atm-theme';
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Only expose enhanced controls once this file has actually loaded. */
  root.classList.add('js');

  function motionIsReduced() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function currentTheme() {
    var explicit = root.getAttribute('data-theme');
    if (explicit === 'light' || explicit === 'dark') return explicit;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light'
      : 'dark';
  }

  function syncThemeColor(theme) {
    var color = theme === 'light' ? '#f7f4ee' : '#070a12';
    var metas = document.querySelectorAll('meta[name="theme-color"]');

    if (!metas.length) {
      var meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute('content', color);
      document.head.appendChild(meta);
      return;
    }

    metas.forEach(function (meta) {
      meta.setAttribute('content', color);
    });
  }

  function syncThemeToggle(button, theme) {
    var isLight = theme === 'light';
    button.setAttribute('aria-pressed', String(isLight));
    button.setAttribute(
      'aria-label',
      isLight ? 'Switch to dark theme' : 'Switch to light theme'
    );
  }

  function initTheme() {
    var buttons = document.querySelectorAll('[data-theme-toggle]');
    var theme = currentTheme();

    root.setAttribute('data-theme', theme);
    syncThemeColor(theme);
    buttons.forEach(function (button) {
      syncThemeToggle(button, theme);
      button.addEventListener('click', function () {
        var next = currentTheme() === 'light' ? 'dark' : 'light';
        root.setAttribute('data-theme', next);
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch (error) {
          /* Storage can be unavailable in strict privacy modes. */
        }
        buttons.forEach(function (item) {
          syncThemeToggle(item, next);
        });
        syncThemeColor(next);
      });
    });
  }

  function initNav() {
    var toggle = document.querySelector('[data-nav-toggle]');
    var menu = document.getElementById('nav-menu');

    if (!toggle || !menu) return;

    function setOpen(open, returnFocus) {
      menu.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (!open && returnFocus) toggle.focus();
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('open'), false);
    });

    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false, false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && menu.classList.contains('open')) {
        setOpen(false, true);
      }
    });

    document.addEventListener('click', function (event) {
      if (
        menu.classList.contains('open') &&
        !event.target.closest('#nav-menu') &&
        !event.target.closest('[data-nav-toggle]')
      ) {
        setOpen(false, false);
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 760 && menu.classList.contains('open')) {
        setOpen(false, false);
      }
    }, { passive: true });
  }

  function initScrollUI() {
    var header = document.querySelector('.site-header');
    var backToTop = document.querySelector('.back-to-top');
    var ticking = false;

    function update() {
      var y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 18);
      if (backToTop) backToTop.classList.toggle('visible', y > 520);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initAmbientPointer() {
    if (
      motionIsReduced() ||
      !window.matchMedia ||
      !window.matchMedia('(pointer: fine)').matches
    ) return;

    var frame = 0;
    var latestX = 0;
    var latestY = 0;

    window.addEventListener('pointermove', function (event) {
      latestX = (event.clientX / window.innerWidth - 0.5) * 22;
      latestY = (event.clientY / window.innerHeight - 0.5) * 16;
      if (frame) return;

      frame = window.requestAnimationFrame(function () {
        root.style.setProperty('--ambient-x', latestX.toFixed(2) + 'px');
        root.style.setProperty('--ambient-y', latestY.toFixed(2) + 'px');
        frame = 0;
      });
    }, { passive: true });
  }

  function initTilt() {
    if (
      motionIsReduced() ||
      !window.matchMedia ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) return;

    document.querySelectorAll('.app-card, .value-card').forEach(function (card) {
      var bounds = null;
      var frame = 0;
      var x = 0;
      var y = 0;

      function render() {
        if (!bounds) return;
        var relativeX = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
        var relativeY = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
        card.style.setProperty('--tilt-x', ((0.5 - relativeY) * 3.5).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-y', ((relativeX - 0.5) * 4.5).toFixed(2) + 'deg');
        card.style.setProperty('--glow-x', (relativeX * bounds.width - 110).toFixed(1) + 'px');
        card.style.setProperty('--glow-y', (relativeY * bounds.height - 110).toFixed(1) + 'px');
        frame = 0;
      }

      card.addEventListener('pointerenter', function (event) {
        bounds = card.getBoundingClientRect();
        x = event.clientX;
        y = event.clientY;
        render();
      }, { passive: true });

      card.addEventListener('pointermove', function (event) {
        x = event.clientX;
        y = event.clientY;
        if (frame) return;
        frame = window.requestAnimationFrame(render);
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        if (frame) window.cancelAnimationFrame(frame);
        frame = 0;
        bounds = null;
        card.style.setProperty('--tilt-x', '0deg');
        card.style.setProperty('--tilt-y', '0deg');
        card.style.setProperty('--glow-x', 'calc(50% - 110px)');
        card.style.setProperty('--glow-y', 'calc(50% - 110px)');
      }, { passive: true });
    });
  }

  function init() {
    initTheme();
    initNav();
    initScrollUI();
    initAmbientPointer();
    initTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
