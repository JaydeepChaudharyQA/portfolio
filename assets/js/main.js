/* Portfolio interactions — no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Theme toggle --------------------------------------------------------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function syncThemeLabel() {
    if (!themeBtn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    themeBtn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  if (themeBtn) {
    syncThemeLabel();
    themeBtn.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncThemeLabel();
    });
  }

  /* Header: background on scroll ---------------------------------------- */
  var header = document.querySelector('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu ---------------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-nav-panel]');
  function setMenu(open) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.classList.toggle('is-open', open);
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* Active nav link ------------------------------------------------------ */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) navObserver.observe(el);
    });
  }

  /* Reveal on scroll ----------------------------------------------------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* Hero "test run" — lines tick in one by one --------------------------- */
  var run = document.querySelector('[data-test-run]');
  if (run) {
    var lines = run.querySelectorAll('.t-line');
    lines.forEach(function (line, i) {
      line.style.transitionDelay = reduceMotion ? '0s' : (0.5 + i * 0.35) + 's';
    });
    requestAnimationFrame(function () { run.classList.add('is-running'); });
  }

  /* Project filters ------------------------------------------------------ */
  var filterGroup = document.querySelector('[data-filters]');
  if (filterGroup) {
    var buttons = filterGroup.querySelectorAll('[data-filter]');
    var projects = document.querySelectorAll('[data-project-grid] [data-tags]');
    var empty = document.querySelector('[data-filter-empty]');
    filterGroup.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      buttons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      var shown = 0;
      projects.forEach(function (p) {
        var match = f === 'all' || (' ' + p.getAttribute('data-tags') + ' ').indexOf(' ' + f + ' ') > -1;
        p.hidden = !match;
        if (match) { shown++; p.classList.add('is-visible'); }
      });
      if (empty) empty.hidden = shown > 0;
    });
  }

  /* Copy email ----------------------------------------------------------- */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var status = document.querySelector('[data-copy-status]');
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('is-copied');
        if (status) status.textContent = 'Email copied';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (status) status.textContent = '';
        }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done, function () { window.location.href = 'mailto:' + text; });
      } else {
        window.location.href = 'mailto:' + text;
      }
    });
  });

  /* Contact form (FormSubmit or Formspree, set in _config.yml) ---------- */
  var form = document.querySelector('[data-contact-form]');
  if (form && window.fetch) {
    var formStatus = form.querySelector('[data-form-status]');
    var messages = {
      name: 'Please enter your name.',
      email: 'Please enter a valid email address.',
      message: 'Please write a short message.'
    };
    function fieldError(input) {
      var v = input.value.trim();
      if (!v) return messages[input.name];
      if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return messages.email;
      return '';
    }
    function showError(input, msg) {
      var id = input.id + '-error';
      var el = document.getElementById(id);
      if (msg) {
        if (!el) {
          el = document.createElement('p');
          el.id = id;
          el.className = 'field-error';
          input.parentNode.appendChild(el);
        }
        el.textContent = msg;
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', id);
      } else {
        if (el) el.remove();
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    }
    var inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value) showError(input, fieldError(input)); });
      input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) showError(input, fieldError(input)); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      inputs.forEach(function (input) {
        var msg = fieldError(input);
        showError(input, msg);
        if (msg && !firstBad) firstBad = input;
      });
      if (firstBad) { firstBad.focus(); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });
      if (data._honey) return; // bot

      var submit = form.querySelector('[type="submit"]');
      submit.disabled = true;
      formStatus.className = 'form-status';
      formStatus.textContent = 'Sending…';
      fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (body) {
            if (!res.ok || body.success === 'false' || body.success === false) throw new Error(body.message || res.status);
          });
        })
        .then(function () {
          form.reset();
          formStatus.className = 'form-status is-success';
          formStatus.textContent = '✓ Thanks! Your message was sent. I will get back to you soon.';
        })
        .catch(function () {
          formStatus.className = 'form-status is-error';
          formStatus.textContent = 'Sorry, the message could not be sent. Please email me directly instead.';
        })
        .then(function () { submit.disabled = false; });
    });
  }
})();
