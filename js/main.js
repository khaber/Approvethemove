// Theme toggle
function initTheme() {
  const saved = localStorage.getItem('atm-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  updateToggleIcon();
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  if (next === 'dark') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
  }
  localStorage.setItem('atm-theme', next);
  updateToggleIcon();
}

function updateToggleIcon() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  btn.textContent = isLight ? '\u263E' : '\u263C';
}

// Mobile nav
function toggleNav() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}

// Close mobile nav on link click
document.addEventListener('click', function(e) {
  if (e.target.closest('.nav-links a')) {
    const links = document.querySelector('.nav-links');
    if (links) links.classList.remove('open');
  }
});

// Back to top button
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function handleScroll() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  if (window.scrollY > 400) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Scroll reveal animations
function initScrollReveal() {
  const targets = document.querySelectorAll('.app-card, .feature-item, .step, .privacy-hub-card, .content-section, .about-content');
  if (!('IntersectionObserver' in window) || targets.length === 0) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function(el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

// Init
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  handleScroll();
  initScrollReveal();
});
