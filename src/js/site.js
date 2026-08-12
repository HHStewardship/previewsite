/**
 * Shared site behaviour. Loaded on every page, deliberately tiny.
 * Nothing here is required for the page to be readable or usable.
 */

/* --- Mobile navigation --------------------------------------------------- */

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.dataset.open = String(open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });

  // Leaving the mobile breakpoint should never strand a locked body.
  const mq = window.matchMedia('(min-width: 881px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) setOpen(false);
  });
}

/* --- Current-page marker -------------------------------------------------
 * Set from the URL rather than hand-maintained on eleven pages.
 * ------------------------------------------------------------------------ */

function initCurrentPage() {
  const path = window.location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.site-nav .nav-link').forEach((link) => {
    const href = new URL(link.getAttribute('href'), window.location.origin).pathname.replace(
      /index\.html$/,
      ''
    );
    const isSection = href !== '/' && path.startsWith(href);
    if (href === path || isSection) link.setAttribute('aria-current', 'page');
  });
}

/* --- Header inversion over a dark hero ----------------------------------- */

function initHeaderState() {
  const header = document.querySelector('.site-header');
  const hero = document.querySelector('[data-hero-sentinel]');
  if (!header) return;

  if (!hero) {
    header.dataset.overHero = 'false';
    return;
  }

  const io = new IntersectionObserver(
    ([entry]) => {
      header.dataset.overHero = String(entry.isIntersecting);
    },
    { rootMargin: `-${header.offsetHeight}px 0px 0px 0px`, threshold: 0 }
  );
  io.observe(hero);
}

/* --- Reveal on scroll ---------------------------------------------------- */

function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );

  targets.forEach((el) => io.observe(el));
}

/* --- FAQ: one open at a time --------------------------------------------- */

function initFaq() {
  const items = document.querySelectorAll('details.faq');
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item && other.open && other.closest('.faq-list') === item.closest('.faq-list')) {
          other.open = false;
        }
      });
    });
  });
}

/* --- Consultation form ---------------------------------------------------
 * No backend exists yet (Phase 2/3 of the SOW wires the real handler).
 * Until then the form validates client-side and hands off to mailto: so the
 * page is never a dead end for a real prospect.
 * ------------------------------------------------------------------------ */

function initConsultForm() {
  const form = document.querySelector('form[data-consult-form]');
  if (!form) return;

  // Tier cards on /memberships.html link through as ?tier=<slug>. Arriving with a
  // choice already made and then having to make it again is a needless drop-off.
  const select = form.querySelector('[data-tier-select]');
  const slug = new URLSearchParams(window.location.search).get('tier');
  if (select && slug) {
    const match = [...select.options].find((option) =>
      option.value.toLowerCase().replace(/[^a-z]+/g, '-').includes(slug.toLowerCase())
    );
    if (match) select.value = match.value;
  }

  const status = form.querySelector('.form-status');
  const setStatus = (state, message) => {
    if (!status) return;
    status.dataset.state = state;
    status.textContent = message;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus('error', 'Please complete the required fields so we can reach you.');
      return;
    }

    const data = new FormData(form);
    const lines = [
      `Name: ${data.get('name') || ''}`,
      `Email: ${data.get('email') || ''}`,
      `Phone: ${data.get('phone') || ''}`,
      `Property location: ${data.get('location') || ''}`,
      `Interested in: ${data.get('tier') || 'Not sure yet'}`,
      `How they found us: ${data.get('source') || ''}`,
      '',
      'Message:',
      String(data.get('message') || ''),
    ].join('\n');

    const subject = encodeURIComponent(
      `Consultation request: ${data.get('name') || 'New enquiry'}`
    );
    const body = encodeURIComponent(lines);

    setStatus(
      'ok',
      'Thank you. Your email app is opening with the request ready to send. Prefer to talk? Call 678-480-6551.'
    );

    window.location.href = `mailto:they.call.me.jacks@outlook.com?subject=${subject}&body=${body}`;
  });
}

/* --- Footer year ---------------------------------------------------------- */

function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

initNav();
initCurrentPage();
initHeaderState();
initReveal();
initFaq();
initConsultForm();
initYear();
