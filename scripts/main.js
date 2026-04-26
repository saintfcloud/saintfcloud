(function () {
  const path = window.location.pathname.replace(/\/$/, '');
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const target = link.getAttribute('href').replace(/\/$/, '');
    if (target && path.endsWith(target)) {
      link.classList.add('active');
    }
  });

  const form = document.querySelector('[data-newsletter]');
  if (form) {
    const emailField = form.querySelector('input[type="email"]');
    const status = form.querySelector('.form-status');

    const stored = localStorage.getItem('saintfcloud_newsletter_email');
    if (stored && status) {
      status.textContent = `You're subscribed with ${stored}.`;
      status.className = 'form-status success';
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = emailField.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!ok) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'form-status error';
        return;
      }

      localStorage.setItem('saintfcloud_newsletter_email', email);
      status.textContent = `Subscribed. We'll send updates to ${email}.`;
      status.className = 'form-status success';
      form.reset();
    });
  }
})();
