/* Approve The Move — progressive enhancement.
   The page is fully functional without this script;
   it only adds interactivity. The no-flash theme is
   set by a tiny inline script in the document <head>. */
(function () {
  'use strict';

  var root = document.documentElement;
  var THEME_KEY = 'atm-theme';
  var reducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Theme toggle (with circular wipe) --------------- */

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function syncThemeColor(theme) {
    var color = theme === 'light' ? '#f6f1e7' : '#0e0c0a';
    // The page ships two media-scoped theme-color metas; a media-less meta
    // only wins if it is the FIRST theme-color meta in tree order, so insert
    // (once) before the existing ones rather than appending.
    var meta = document.querySelector('meta[name="theme-color"][data-js]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.setAttribute('data-js', '');
      var first = document.querySelector('meta[name="theme-color"]');
      if (first) {
        first.parentNode.insertBefore(meta, first);
      } else {
        document.head.appendChild(meta);
      }
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

    function applyTheme(next) {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      syncToggle(btn, next);
      syncThemeColor(next);
    }

    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';

      if (!document.startViewTransition || reducedMotion) {
        applyTheme(next);
        return;
      }

      var rect = btn.getBoundingClientRect();
      root.style.setProperty('--wipe-x', rect.left + rect.width / 2 + 'px');
      root.style.setProperty('--wipe-y', rect.top + rect.height / 2 + 'px');
      root.classList.add('theme-wipe');

      var transition = document.startViewTransition(function () {
        applyTheme(next);
      });
      transition.finished.finally(function () {
        root.classList.remove('theme-wipe');
      });
    });
  }

  /* ---- Mobile navigation ------------------------------- */

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

  /* ---- Back to top -------------------------------------- */

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

  /* ---- Scroll reveal ------------------------------------ */

  function initReveal() {
    var targets = document.querySelectorAll(
      '.app-card, .feature-item, .step, .privacy-hub-card, .content-section, .about-content'
    );
    if (!targets.length) return;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('visible'); });
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

  /* ---- Hero phone rotator ------------------------------- */

  function initRotator() {
    var stage = document.querySelector('[data-rotator]');
    if (!stage) return;
    var shots = stage.querySelectorAll('.rotator-shot');
    var chip = document.querySelector('.rotator-chip');
    if (shots.length < 2 || reducedMotion) return;

    var index = 0;
    var paused = false;
    var focused = false;

    function isExternal(href) {
      return /^https?:\/\//.test(href) && href.indexOf(window.location.origin) !== 0;
    }

    function show(i) {
      shots.forEach(function (img, n) {
        img.classList.toggle('is-active', n === i);
      });
      if (chip) {
        chip.classList.add('is-switching');
        window.setTimeout(function () {
          var href = shots[i].getAttribute('data-href') || chip.getAttribute('href');
          chip.setAttribute('href', href);
          // Match the site convention: external destinations open in a new tab.
          if (isExternal(href)) {
            chip.setAttribute('target', '_blank');
            chip.setAttribute('rel', 'noopener');
          } else {
            chip.removeAttribute('target');
            chip.removeAttribute('rel');
          }
          chip.textContent = (shots[i].getAttribute('data-label') || '') + ' →';
          chip.classList.remove('is-switching');
        }, 180);
      }
    }

    function recompute() { paused = focused || document.hidden; }

    stage.addEventListener('mouseenter', function () { focused = true; recompute(); });
    stage.addEventListener('mouseleave', function () { focused = false; recompute(); });
    document.addEventListener('visibilitychange', recompute);

    if (chip) {
      // Don't re-target the link out from under a user hovering or focusing it.
      chip.addEventListener('mouseenter', function () { focused = true; recompute(); });
      chip.addEventListener('mouseleave', function () { focused = false; recompute(); });
      chip.addEventListener('focus', function () { focused = true; recompute(); });
      chip.addEventListener('blur', function () { focused = false; recompute(); });
    }

    window.setInterval(function () {
      if (paused) return;
      index = (index + 1) % shots.length;
      show(index);
    }, 3500);
  }

  /* ---- Screenshot lightbox ------------------------------ */

  function initLightbox() {
    var imgs = document.querySelectorAll('.screenshot-item .device-frame img');
    if (!imgs.length || typeof HTMLDialogElement !== 'function') return;

    var dialog = document.createElement('dialog');
    dialog.className = 'lightbox';
    dialog.setAttribute('aria-label', 'Screenshot viewer');
    dialog.innerHTML =
      '<img alt="">' +
      '<button type="button" class="lightbox-close" aria-label="Close">✕</button>' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(dialog);

    var big = dialog.querySelector('img');
    var caption = dialog.querySelector('.lightbox-caption');

    dialog.querySelector('.lightbox-close').addEventListener('click', function () {
      dialog.close();
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) dialog.close();
    });

    imgs.forEach(function (img) {
      var frame = img.closest('.device-frame');
      var item = img.closest('.screenshot-item');
      var label = item && item.querySelector('.caption');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lightbox-trigger';
      btn.setAttribute(
        'aria-label',
        'View full screenshot: ' + (img.alt || 'screenshot')
      );
      frame.parentNode.insertBefore(btn, frame);
      btn.appendChild(frame);
      btn.addEventListener('click', function () {
        big.src = img.currentSrc || img.src;
        big.alt = img.alt;
        caption.textContent = label ? label.textContent : img.alt;
        dialog.showModal();
      });
    });
  }

  /* ---- Hero stats count-up ------------------------------ */

  function initCountUp() {
    var values = document.querySelectorAll('.stat-value');
    if (!values.length || reducedMotion || !('IntersectionObserver' in window)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.textContent, 10);
        if (!target || target > 999) return;
        var start = null;
        function tick(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / 900, 1);
          el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
          if (p < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });

    values.forEach(function (el) { observer.observe(el); });
  }

  /* ---- "It's 9:41 PM in Doha" footer clock -------------- */

  function initDohaClock() {
    var el = document.querySelector('[data-doha-clock]');
    if (!el || !window.Intl || !Intl.DateTimeFormat) return;

    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'Asia/Qatar',
      });
    } catch (e) {
      return;
    }

    function update() {
      el.textContent = "It's " + fmt.format(new Date()) + ' in Doha right now.';
    }

    update();
    window.setInterval(update, 30000);
  }

  /* ---- The APPROVED stamp ------------------------------- */

  function initStamp() {
    var badge = document.querySelector('.hero-badge');
    if (!badge) return;

    // Non-interactive decoration by default; JS upgrades it to a mouse-only
    // easter egg (no keyboard/AT control, so nothing dead without JS).
    badge.classList.add('is-stampable');

    badge.addEventListener('click', function () {
      var old = badge.querySelector('.stamp');
      if (old) old.remove();
      var stamp = document.createElement('span');
      stamp.className = 'stamp stamped';
      stamp.setAttribute('aria-hidden', 'true');
      stamp.textContent = 'Approved';
      badge.appendChild(stamp);
      window.setTimeout(function () { stamp.remove(); }, 2600);
    });
  }

  /* ---- Speculation Rules: prerender likely next pages --- */

  function initPrerender() {
    if (
      !window.HTMLScriptElement ||
      typeof HTMLScriptElement.supports !== 'function' ||
      !HTMLScriptElement.supports('speculationrules')
    ) {
      return;
    }
    var s = document.createElement('script');
    s.type = 'speculationrules';
    s.textContent = JSON.stringify({
      prerender: [
        {
          where: {
            and: [
              { href_matches: '/*' },
              { not: { href_matches: '/*.(png|webp|svg|xml|txt|pdf)' } },
            ],
          },
          eagerness: 'moderate',
        },
      ],
    });
    document.head.appendChild(s);
  }

  /* ---- Init --------------------------------------------- */

  function init() {
    initTheme();
    initNav();
    initBackToTop();
    initReveal();
    initRotator();
    initLightbox();
    initCountUp();
    initDohaClock();
    initStamp();
    initPrerender();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
