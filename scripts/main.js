(() => {
  const SITE = {
    legacyProjectPrefix: '/saintfcloud',
    storageKey: 'saintfcloud_newsletter_email',
    modalSeenKey: 'saintfcloud_welcome_seen',
  };

  const normalizePath = (path) => {
    if (!path) return '/';
    const stripped = path.replace(/\/+$/, '');
    return stripped || '/';
  };

  const detectBasePath = () => {
    const { hostname, pathname } = window.location;
    if (!hostname.endsWith('github.io')) return '';

    const seg = pathname.split('/').filter(Boolean)[0] || '';
    if (seg && seg.toLowerCase() === SITE.legacyProjectPrefix.slice(1).toLowerCase()) {
      return SITE.legacyProjectPrefix;
    }
    return '';
  };

  const basePath = detectBasePath();

  const toAbsoluteInternal = (routePath) => {
    if (!routePath || routePath.startsWith('http') || routePath.startsWith('mailto:')) return routePath;
    const normalized = normalizePath(routePath);
    if (!basePath) return normalized;
    return normalized === '/' ? `${basePath}/` : `${basePath}${normalized}/`.replace(/\/\/+$/, '/');
  };

  const maybeRedirectLegacyProjectUrl = () => {
    const { hostname, pathname, search, hash } = window.location;
    if (hostname !== 'saintfcloud.github.io') return;

    const legacyPrefix = `${SITE.legacyProjectPrefix}/`;
    if (pathname === SITE.legacyProjectPrefix || pathname.startsWith(legacyPrefix)) {
      const cleaned = pathname.replace(SITE.legacyProjectPrefix, '') || '/';
      window.location.replace(`${cleaned}${search}${hash}`);
    }
  };

  maybeRedirectLegacyProjectUrl();

  document.querySelectorAll('[data-route]').forEach((link) => {
    const route = link.getAttribute('data-route');
    link.setAttribute('href', toAbsoluteInternal(route));
  });

  const currentPath = normalizePath(window.location.pathname.replace(basePath, '') || '/');
  document.querySelectorAll('[data-nav][data-route]').forEach((link) => {
    const route = normalizePath(link.getAttribute('data-route'));
    if (currentPath === route) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const navToggle = document.querySelector('[data-menu-toggle]');
  const navMenu = document.querySelector('[data-menu]');
  const closeMenu = () => {
    if (!navToggle || !navMenu) return;
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.hidden = true;
    document.body.classList.remove('menu-open');
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const willOpen = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(willOpen));
      navMenu.hidden = !willOpen;
      document.body.classList.toggle('menu-open', willOpen);
    });

    document.addEventListener('click', (event) => {
      if (navMenu.hidden) return;
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeMenu();
    });
  }

  const modal = document.querySelector('[data-welcome-modal]');
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    localStorage.setItem(SITE.modalSeenKey, '1');
  };

  if (modal) {
    const seen = localStorage.getItem(SITE.modalSeenKey) === '1';
    if (!seen) {
      modal.hidden = false;
      document.body.classList.add('modal-open');
    }

    modal.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  const form = document.querySelector('[data-newsletter]');
  if (form) {
    const emailField = form.querySelector('input[type="email"]');
    const status = form.querySelector('.form-status');

    const stored = localStorage.getItem(SITE.storageKey);
    if (stored && status) {
      status.textContent = `YOU'RE SUBSCRIBED WITH ${stored}.`;
      status.className = 'form-status success';
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailField.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!ok) {
        status.textContent = 'PLEASE ENTER A VALID EMAIL ADDRESS.';
        status.className = 'form-status error';
        return;
      }

      localStorage.setItem(SITE.storageKey, email);
      status.textContent = `SUBSCRIBED. UPDATES WILL GO TO ${email}.`;
      status.className = 'form-status success';
      form.reset();
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
