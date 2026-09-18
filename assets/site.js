/* MASOON TREUHAND V3
   JavaScript nur für Verhalten und Interaktion.
   Keine CSS-Regeln oder Style-Injections in dieser Datei.
*/

/* MOBILE NAVIGATION: Menü öffnen, schliessen und mit Escape beenden */
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('navigation');

function closeMenu() {
  if (!toggle || !nav) return;

  toggle.setAttribute('aria-expanded', 'false');
  nav.classList.remove('open');
}

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';

  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('open', open);
});

document.addEventListener('keydown', event => {
  if (
    event.key === 'Escape' &&
    toggle?.getAttribute('aria-expanded') === 'true'
  ) {
    closeMenu();
    toggle.focus();
  }
});

nav?.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', closeMenu)
);

window.matchMedia('(min-width: 801px)').addEventListener('change', e => {
  if (e.matches) closeMenu();
});

/* KONTAKTFORMULAR: Pflichtfelder prüfen und Nachricht versenden */
const form = document.querySelector('.contact-form');

if (form) {
  form.querySelectorAll('input:not(.honey),textarea').forEach(field => {
    field.addEventListener('invalid', () => {
      field.setCustomValidity(
        field.validity.typeMismatch
          ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
          : 'Bitte füllen Sie dieses Feld aus.'
      );
    });

    field.addEventListener('input', () =>
      field.setCustomValidity('')
    );
  });

  let sending = false;

  form.addEventListener('submit', async event => {
    event.preventDefault();

    if (sending || !form.reportValidity()) return;

    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');
    const data = Object.fromEntries(new FormData(form));

    if (data.botcheck) return;

    delete data.botcheck;

    data.access_key = form.dataset.accessKey;
    data.subject = 'Neue Kontaktanfrage über MASOON TREUHAND';
    data.from_name = 'MASOON TREUHAND Website';

    sending = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');

    status.className = 'form-status full';
    status.textContent = 'Ihre Nachricht wird gesendet …';

    try {
      const response = await fetch(
        'https://api.web3forms.com/submit',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(20000)
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('Submission failed');
      }

      form.reset();
      status.classList.add('success');
      status.textContent = 'Vielen Dank für Ihre Anfrage. Wir haben Ihre Nachricht erhalten und melden uns in Kürze bei Ihnen.';
    } catch {
      status.classList.add('error');
      status.textContent = 'Ihre Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie an info@masoontreuhand.ch.';
    } finally {
      sending = false;
      button.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
}
