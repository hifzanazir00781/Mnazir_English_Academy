/* ===== AOS INIT ===== */
AOS.init({
  duration: 800,
  once: true,
  easing: 'ease-out',
  offset: 40,
});

/* ============================================================
   ONLINE CLASS INQUIRY MODAL
   ============================================================ */
(function () {
  const modal = document.getElementById('onlineModal');
  const openBtn = document.getElementById('openOnlineForm');
  const closeBtn = document.getElementById('closeOnlineModal');
  const form = document.getElementById('onlineForm');
  const status = document.getElementById('onlineFormStatus');
  const ageGroup = document.getElementById('of-age');
  const guardianFields = document.getElementById('guardianFields');
  const guardianName = document.getElementById('of-guardian-name');
  const guardianPhone = document.getElementById('of-guardian-phone');

  if (!modal || !openBtn || !form) return;

  /* ---------- Open / Close ---------- */
  function openModal() {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Reset state
    status.className = 'online-form-status';
    status.textContent = '';
    setTimeout(() => document.getElementById('of-name').focus(), 100);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  /* ---------- Conditional: show parent/guardian fields for Kids ---------- */
  ageGroup.addEventListener('change', () => {
    const isKid = ageGroup.value === 'Kids (5–12)';
    guardianFields.style.display = isKid ? 'grid' : 'none';
    guardianName.required = isKid;
    guardianPhone.required = isKid;
    if (!isKid) {
      guardianName.value = '';
      guardianPhone.value = '';
    }
  });

  /* ---------- Submit via Formspree (AJAX, no page reload) ---------- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic browser validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const submitBtn = form.querySelector('.online-form-submit');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    status.className = 'online-form-status';
    status.textContent = '';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' },
      });

      if (response.ok) {
        status.className = 'online-form-status is-success';
        status.textContent =
          'Thank you! Your inquiry has been sent. We will contact you shortly.';
        form.reset();
        guardianFields.style.display = 'none';
        guardianName.required = false;
        guardianPhone.required = false;

        // Auto-close after 4 seconds
        setTimeout(closeModal, 4000);
      } else {
        const data = await response.json().catch(() => ({}));
        status.className = 'online-form-status is-error';
        status.textContent =
          data.error ||
          'Something went wrong. Please try again or contact us on WhatsApp.';
      }
    } catch (err) {
      status.className = 'online-form-status is-error';
      status.textContent =
        'Network error. Please check your connection and try again.';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
})();