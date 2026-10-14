// Mr. Bean — small, dependency-free interaction script.
// Three jobs: nav state on scroll, mobile menu toggle, scroll reveal (IntersectionObserver).
// Reduced-motion aware. Everything is defensive and does nothing if elements are missing.

(function () {
  'use strict';

  // Year in footer
  var y = document.getElementById('y');
  if (y) y.textContent = String(new Date().getFullYear());

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Sticky nav state (changes once past the hero)
  var nav = document.getElementById('nav');
  if (nav) {
    var onScroll = function () {
      var past = window.scrollY > 40;
      nav.classList.toggle('is-stuck', past);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Mobile menu toggle
  var toggle = document.querySelector('.nav__toggle');
  var mnav = document.getElementById('mnav');
  if (toggle && mnav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { mnav.hidden = false; }
      else { mnav.hidden = true; }
    };
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
    });
    mnav.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'A') setOpen(false);
    });
    // Close on resize to desktop width
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 900) setOpen(false);
    }, { passive: true });
  }

  // Scroll reveal
  var reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < reveals.length; i++) reveals[i].classList.add('is-in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  reveals.forEach(function (el) { io.observe(el); });
})();
