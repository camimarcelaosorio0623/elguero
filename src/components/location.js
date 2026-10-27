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
 * WhatsApp: preparado, no conectado. Solo aparece si Agent.IA configura
 * VITE_WHATSAPP_NUMBER con el número oficial.
 */
export function initWhatsApp() {
  if (!config.whatsappNumber) return;
  const link = $('#wa-inline');
  link.href = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('¡Qué onda, Güero! Tengo una pregunta 🙌')}`;
  link.hidden = false;
}
