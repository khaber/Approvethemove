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

  function initRotator() {
    var stage = document.querySelector('[data-rotator]');
    if (!stage) return;

    var shots = stage.querySelectorAll('.rotator-shot');
    var chip = document.querySelector('.rotator-chip');
    if (shots.length < 2 || reducedMotion) return;

    var index = 0;
    var pointerInside = false;
    var chipFocused = false;

    function isExternal(href) {
      return /^https?:\/\//.test(href) && href.indexOf(window.location.origin) !== 0;
    }

    function paused() {
      return pointerInside || chipFocused || document.hidden;
    }

    function show(nextIndex) {
      shots.forEach(function (image, shotIndex) {
        image.classList.toggle('is-active', shotIndex === nextIndex);
      });

      if (!chip) return;
      chip.classList.add('is-switching');
      window.setTimeout(function () {
        var href = shots[nextIndex].getAttribute('data-href') || chip.getAttribute('href');
        chip.setAttribute('href', href);
        chip.textContent = (shots[nextIndex].getAttribute('data-label') || '') + ' →';
        if (isExternal(href)) {
          chip.setAttribute('target', '_blank');
          chip.setAttribute('rel', 'noopener');
        } else {
          chip.removeAttribute('target');
          chip.removeAttribute('rel');
        }
        chip.classList.remove('is-switching');
      }, 180);
    }

    stage.addEventListener('pointerenter', function () { pointerInside = true; });
    stage.addEventListener('pointerleave', function () { pointerInside = false; });

    if (chip) {
      chip.addEventListener('pointerenter', function () { pointerInside = true; });
      chip.addEventListener('pointerleave', function () { pointerInside = false; });
      chip.addEventListener('focus', function () { chipFocused = true; });
      chip.addEventListener('blur', function () { chipFocused = false; });
    }

    window.setInterval(function () {
      if (paused()) return;
      index = (index + 1) % shots.length;
      show(index);
    }, 3500);
  }

  function initLightbox() {
    var screenshots = document.querySelectorAll('.screenshot-item img');
    if (!screenshots.length || typeof HTMLDialogElement !== 'function') return;

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Screenshot viewer');
    dialog.innerHTML =
      '<img alt="">' +
      '<button type="button" class="lightbox-close" aria-label="Close screenshot viewer">✕</button>' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(dialog);

    var preview = dialog.querySelector('img');
    var caption = dialog.querySelector('.lightbox-caption');
    var closeButton = dialog.querySelector('.lightbox-close');

    closeButton.addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    screenshots.forEach(function (image) {
      var item = image.closest('.screenshot-item');
      var label = item && item.querySelector('.caption');
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'screenshot-open';
      button.setAttribute('aria-label', 'View full screenshot: ' + (image.alt || 'screenshot'));
      image.parentNode.insertBefore(button, image);
      button.appendChild(image);
      button.addEventListener('click', function () {
        preview.src = image.currentSrc || image.src;
        preview.alt = image.alt;
        caption.textContent = label ? label.textContent : image.alt;
        dialog.showModal();
      });
    });
  }

  function initCountUp() {
    var values = document.querySelectorAll('.stat-value');
    if (!values.length || reducedMotion || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var element = entry.target;
        var target = parseInt(element.textContent, 10);
        if (!target || target > 999) return;
        var start = null;

        function tick(timestamp) {
          if (start === null) start = timestamp;
          var progress = Math.min((timestamp - start) / 750, 1);
          element.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) window.requestAnimationFrame(tick);
        }

        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    values.forEach(function (element) { observer.observe(element); });
  }

  function initDohaClock() {
    var clocks = document.querySelectorAll('[data-doha-clock]');
    if (!clocks.length || !window.Intl || !Intl.DateTimeFormat) return;

    var formatter;
    try {
      formatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Qatar'
      });
    } catch (error) {
      return;
    }

    function update() {
      var message = "It's " + formatter.format(new Date()) + ' in Doha right now.';
      clocks.forEach(function (clock) { clock.textContent = message; });
    }

    update();
    window.setInterval(update, 30000);
  }

  function init() {
    initTheme();
    initNav();
    initScrollUI();
    initAmbientPointer();
    initTilt();
    initRotator();
    initLightbox();
    initCountUp();
    initDohaClock();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
