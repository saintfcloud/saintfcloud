(() => {
  const SITE = {
    legacyProjectPrefix: '/saintfcloud',
    newsletterStorageKey: 'saintfcloud_newsletter_email',
    welcomeStorageKey: 'saintfcloud_welcome_seen',
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
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.hidden = expanded;
      document.body.classList.toggle('menu-open', !expanded);
    });

    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.hidden = true;
        document.body.classList.remove('menu-open');
      });
    });
  }

  const form = document.querySelector('[data-newsletter]');
  if (form) {
    const emailField = form.querySelector('input[type="email"]');
    const status = form.querySelector('.form-status');

    const stored = localStorage.getItem(SITE.newsletterStorageKey);
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

      localStorage.setItem(SITE.newsletterStorageKey, email);
      status.textContent = `SUBSCRIBED. WE'LL SEND UPDATES TO ${email}.`;
      status.className = 'form-status success';
      form.reset();
    });
  }

  const modal = document.querySelector('[data-welcome-modal]');
  if (modal && !localStorage.getItem(SITE.welcomeStorageKey)) {
    modal.hidden = false;
    document.body.classList.add('modal-open');

    const closeModal = () => {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      localStorage.setItem(SITE.welcomeStorageKey, 'true');
    };

    modal.querySelectorAll('[data-close-modal]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal();
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
