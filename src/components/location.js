import { $ } from '../lib/dom.js';
import { site } from '../config/site.js';
import { config } from '../config/env.js';
import { nowInMedellin, DAYS } from '../lib/time.js';

/** Horario con el día de hoy marcado. */
export function initHorario() {
  const box = $('#horario');
  if (!box) return;
  const { dow } = nowInMedellin();
  const fmt = (h) => { const hh = h % 24; return `${((hh + 11) % 12) + 1} ${hh < 12 ? 'a. m.' : 'p. m.'}`; };
  box.innerHTML = [2, 3, 4, 5, 6, 0, 1].map((d) => {
    const open = site.hours.openDays.includes(d);
    const name = DAYS[d][0].toUpperCase() + DAYS[d].slice(1);
    return `<div class="${d === dow ? 'hoy' : ''}"><span>${name}${d === dow ? ' · hoy' : ''}</span><span>${open ? `${fmt(site.hours.open)} – ${fmt(site.hours.close)}` : 'El Güero descansa'}</span></div>`;
  }).join('');
}

/**
 * WhatsApp: botón flotante + botón en Ubicación. Visibles siempre; mientras el número
 * oficial esté pendiente usan el provisional de config (ver env.js).
 */
export function initWhatsApp() {
  const href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('¡Qué onda, Güero! Tengo una pregunta 🙌')}`;
  ['#wa-inline', '#fab'].forEach((sel) => {
    const link = $(sel);
    if (!link) return;
    link.href = href;
    link.hidden = false;
    if (config.whatsappPending) link.dataset.pending = 'true';
  });
}
