// Mr. Bean Coffee: small, dependency-free interactions.
// Jobs: motion gate, nav state, mobile menu, open-now status, photo fallbacks,
// photo reveals, the scroll-driven pour, menu tabs, reservation form.

(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motionOK = !reduceMotion.matches;
  if (motionOK) root.classList.add('motion');

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  // Footer year
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  // ---------- Photo fallbacks ----------
  // If a photo can't load (offline, blocked, or a removed stock image), hide it and let the frame's warm gradient show.
  $$('.photo img').forEach(function (img) {
    var fail = function () { img.closest('.photo').classList.add('is-missing'); };
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) fail();
    img.addEventListener('error', fail, { once: true });
  });

  // ---------- Nav ----------
  var nav = $('#nav');
  var setNav = function () { nav.classList.toggle('is-solid', window.scrollY > 24); };
  setNav();
  window.addEventListener('scroll', setNav, { passive: true });

  var toggle = $('.nav__toggle');
  var mnav = $('#mobile-nav');
  var setMenu = function (open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Open menu';
    mnav.hidden = !open;
    if (open) nav.classList.add('is-solid'); else setNav();
  };
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  mnav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  // ---------- Open-now status (Hyderabad time, 6:00 to 21:00 daily) ----------
  var status = $('[data-status]');
  if (status) {
    var updateStatus = function () {
      var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false })
        .formatToParts(new Date());
      var h = 0, m = 0;
      parts.forEach(function (p) { if (p.type === 'hour') h = +p.value % 24; if (p.type === 'minute') m = +p.value; });
      var mins = h * 60 + m;
      var open = mins >= 360 && mins < 1260;
      status.classList.toggle('is-open', open);
      status.querySelector('.status__text').textContent = open ? 'Open now, until 9 pm' : 'Closed now, opens at 6 am';
    };
    updateStatus();
    setInterval(updateStatus, 60000);
  }

  // ---------- Photo reveals ----------
  var reveals = $$('.reveal-media');
  if (motionOK && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ---------- The pour: pinned, scroll-driven reveal ----------
  var pour = $('.pour');
  if (pour && motionOK) {
    pour.classList.add('is-live');
    pour.setAttribute('data-step', '0');
    var ticking = false;
    var active = false;
    var lastStep = 0;

    var update = function () {
      ticking = false;
      var rect = pour.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      var open = Math.min(1, p / 0.55);                 // circle finishes opening a little past halfway
      var eased = 1 - Math.pow(1 - open, 3);             // ease-out so it settles softly
      pour.style.setProperty('--open', eased.toFixed(4));
      pour.style.setProperty('--p', p.toFixed(4));
      var step = p < 0.34 ? 0 : (p < 0.67 ? 1 : 2);
      if (step !== lastStep) { lastStep = step; pour.setAttribute('data-step', String(step)); }
    };
    var onScroll = function () {
      if (!active || ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    // Only listen while the section is near the viewport.
    new IntersectionObserver(function (entries) {
      active = entries[0].isIntersecting;
      if (active) update();
    }, { rootMargin: '20% 0px 20% 0px' }).observe(pour);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // ---------- Menu tabs (WAI-ARIA tabs pattern) ----------
  var tabs = $$('.tab');
  var selectTab = function (tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var panel = document.getElementById(t.getAttribute('aria-controls'));
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    $$('.menu__photo').forEach(function (ph) {
      ph.classList.toggle('is-active', ph.getAttribute('data-photo-for') === tab.getAttribute('data-tab'));
    });
    if (focus) tab.focus();
  };
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // ---------- Reservation form -> WhatsApp ----------
  var form = $('#reserve-form');
  if (form) {
    var dateInput = $('#r-date');
    var today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()); // YYYY-MM-DD
    dateInput.min = today;

    var setError = function (input, msg) {
      var err = document.getElementById(input.id + '-err');
      err.textContent = msg || '';
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      return !msg;
    };
    var checks = {
      'r-name': function (v) { return v.trim().length >= 2 ? '' : 'Enter your name so we know who to expect.'; },
      'r-date': function (v) {
        if (!v) return 'Choose a date for your visit.';
        if (v < today) return 'Choose today or a later date.';
        return '';
      },
      'r-time': function (v) {
        if (!v) return 'Choose a time for your visit.';
        if (v < '06:00' || v > '20:30') return 'We take bookings from 6:00 am to 8:30 pm.';
        return '';
      }
    };
    Object.keys(checks).forEach(function (id) {
      var input = document.getElementById(id);
      input.addEventListener('blur', function () { if (input.value) setError(input, checks[id](input.value)); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) setError(input, checks[id](input.value)); });
    });

    var formatDate = function (iso) {
      var d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    };
    var formatTime = function (hm) {
      var h = +hm.slice(0, 2), m = hm.slice(3, 5);
      var suffix = h >= 12 ? 'pm' : 'am';
      return ((h % 12) || 12) + ':' + m + ' ' + suffix;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(checks).forEach(function (id) {
        var input = document.getElementById(id);
        var ok = setError(input, checks[id](input.value));
        if (!ok && !firstBad) firstBad = input;
      });
      var statusEl = form.querySelector('.form__status');
      if (firstBad) { statusEl.textContent = 'Check the highlighted fields and try again.'; firstBad.focus(); return; }

      var data = new FormData(form);
      var lines = [
        'Hi Mr. Bean, I would like to reserve a table.',
        'Name: ' + data.get('name').trim(),
        'Date: ' + formatDate(data.get('date')),
        'Time: ' + formatTime(data.get('time')),
        'Guests: ' + data.get('guests')
      ];
      var note = (data.get('note') || '').trim();
      if (note) lines.push('Note: ' + note);

      var url = 'https://wa.me/919573031888?text=' + encodeURIComponent(lines.join('\n'));
      statusEl.textContent = 'Opening WhatsApp with your request. Send the message there to confirm.';
      window.open(url, '_blank', 'noopener');
    });
  }
})();
