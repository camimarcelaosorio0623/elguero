import { $, $$ } from '../lib/dom.js';
import { rules, validateForm, normalizePhone, showFieldError } from '../lib/validation.js';
import { submitReservation, submitBirthdayRequest } from '../services/index.js';
import { site } from '../config/site.js';
import { isDemo } from '../config/env.js';
import { nowInMedellin, dowOf, formatYmd, DAYS } from '../lib/time.js';

const VISIT_LABELS = {
  dinner: 'Nomás a comer rico', party: 'La fiesta', birthday: 'Cumpleaños',
  celebration: 'Otra celebración', business: 'Reunión de trabajo', other: 'Otro',
};
const STATUS_LABEL = { idle: 'Borrador', sending: 'Enviando…', received: 'Recibida', confirmed: 'Confirmada', error: 'Borrador' };

/** Primer día reservable: hoy o el día de apertura, lo que sea después. */
function minDate() {
  const today = nowInMedellin().ymd;
  const opening = site.opening.iso.slice(0, 10);
  return today > opening ? today : opening;
}

/** Horarios de reserva cada 30 min. El día de apertura arranca a la hora de apertura. */
function slotsFor(ymd) {
  const openingDay = site.opening.iso.slice(0, 10);
  const first = ymd === openingDay ? Number(site.opening.iso.slice(11, 13)) : site.hours.open;
  const last = 23; // último turno de reserva; la fiesta sigue después
  const now = nowInMedellin();
  const out = [];
  for (let h = first; h <= last; h += 0.5) {
    if (ymd === now.ymd && h <= now.hour + 0.5) continue;
    const hh = Math.floor(h), mm = h % 1 ? '30' : '00';
    const h12 = ((hh + 11) % 12) + 1;
    out.push({ value: `${String(hh).padStart(2, '0')}:${mm}`, label: `${h12}:${mm} ${hh < 12 ? 'a. m.' : 'p. m.'}` });
  }
  return out;
}

const dateRule = (v) => {
  if (!v) return 'Escoge una fecha, compa.';
  if (v < minDate()) return v < site.opening.iso.slice(0, 10) ? 'Abrimos el 13 de noviembre: escoge desde esa fecha.' : 'Esa fecha ya pasó.';
  if (!site.hours.openDays.includes(dowOf(v))) return `Los ${DAYS[dowOf(v)]} el Güero descansa. Escoge otro día.`;
  return null;
};

/**
 * Máquina de estados común de los formularios:
 * idle → sending → received | confirmed | error (→ idle al reintentar).
 * "confirmed" SOLO si el backend responde status === 'confirmed'.
 */
function wireStates(box, { onState } = {}) {
  const set = (state) => {
    box.dataset.state = state;
    onState?.(state);
    if (state !== 'idle') $('.res-result', box).focus({ preventScroll: true });
  };
  return set;
}

export function initReservationForm() {
  const box = $('#reserva-box');
  const form = $('#form-reserva');
  const ticket = $('#ticket');
  if (!form) return;
  const f = form.elements;

  f.date.min = minDate();
  const fillSlots = () => {
    const prev = f.time.value;
    const slots = f.date.value && !dateRule(f.date.value) ? slotsFor(f.date.value) : [];
    f.time.innerHTML = slots.length
      ? '<option value="">Escoge la hora</option>' + slots.map((s) => `<option value="${s.value}">${s.label}</option>`).join('')
      : `<option value="">${f.date.value ? 'Sin horarios ese día' : 'Escoge la fecha primero'}</option>`;
    if (slots.some((s) => s.value === prev)) f.time.value = prev;
  };
  f.date.addEventListener('change', () => { showFieldError(form, 'date', dateRule(f.date.value)); fillSlots(); paintTicket(); });

  $$('[data-step]', form).forEach((b) => b.addEventListener('click', () => {
    const n = Math.min(30, Math.max(1, (Number(f.partySize.value) || 0) + Number(b.dataset.step)));
    f.partySize.value = n;
    paintTicket();
  }));
  form.addEventListener('input', () => paintTicket());

  function paintTicket(state = box.dataset.state) {
    const t = (k) => $(`[data-t="${k}"]`, ticket);
    t('name').textContent = f.name.value.trim() || '—';
    t('date').textContent = f.date.value && !dateRule(f.date.value) ? formatYmd(f.date.value) : '—';
    t('time').textContent = f.time.selectedOptions[0]?.value ? f.time.selectedOptions[0].textContent : '—';
    t('partySize').textContent = f.partySize.value || '—';
    t('visitType').textContent = VISIT_LABELS[f.visitType.value] || '—';
    t('status').textContent = STATUS_LABEL[state] || 'Borrador';
  }

  const setState = wireStates(box, { onState: paintTicket });
  const schema = {
    name: rules.name, date: dateRule, time: rules.required,
    partySize: rules.int(1, 30), phone: rules.phone, consent: rules.consent,
  };

  async function send() {
    if (!validateForm(form, schema)) return;
    /** @type {import('../services/types.js').ReservationRequest} */
    const payload = {
      name: f.name.value.trim(),
      date: f.date.value,
      time: f.time.value,
      partySize: Number(f.partySize.value),
      phone: normalizePhone(f.phone.value),
      visitType: f.visitType.value,
      consent: f.consent.checked,
    };
    setState('sending');
    try {
      const res = await submitReservation(payload);
      const ref = $$('[data-ref]', box);
      ref.forEach((el) => (el.textContent = !isDemo && res.requestId ? `Referencia de tu solicitud: ${res.requestId}` : ''));
      setState(res.status === 'confirmed' ? 'confirmed' : 'received');
      track('reservation_submitted', { status: res.status });
    } catch (err) {
      if (err.code === 'validation' && err.fields) Object.entries(err.fields).forEach(([k, m]) => showFieldError(form, k, m));
      $('[data-error-msg]', box).textContent = err.code === 'validation'
        ? 'Revisa los datos marcados, compa.'
        : 'No pudimos enviar tu solicitud. Tus datos siguen en el formulario, intenta de nuevo.';
      setState('error');
      track('reservation_failed', { code: err.code || 'unknown' });
    }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); send(); });
  $('.r-error [data-retry]', box).addEventListener('click', () => { setState('idle'); f.name.focus(); });
  $$('[data-reset]', box).forEach((b) => b.addEventListener('click', () => { form.reset(); fillSlots(); setState('idle'); f.name.focus(); }));
  paintTicket();
}

export function initBirthdayForm() {
  const dlg = $('#dlg-cumple');
  const box = $('#cumple-box');
  const form = $('#form-cumple');
  if (!dlg || !form) return;
  const f = form.elements;
  f.date.min = minDate();

  $('#open-cumple').addEventListener('click', () => { box.dataset.state = 'idle'; dlg.showModal(); f.name.focus(); track('birthday_open'); });
  $$('[data-close]', dlg).forEach((b) => b.addEventListener('click', () => dlg.close()));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  const setState = wireStates(box);
  const schema = {
    name: rules.name, phone: rules.phone,
    date: (v) => (!v ? 'Escoge una fecha tentativa.' : v < minDate() ? 'Escoge una fecha desde la apertura.' : null),
    guests: rules.int(2, 150), consent: rules.consent,
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form, schema)) return;
    /** @type {import('../services/types.js').BirthdayRequest} */
    const payload = {
      name: f.name.value.trim(), phone: normalizePhone(f.phone.value), date: f.date.value,
      guests: Number(f.guests.value), notes: f.notes.value.trim(), consent: f.consent.checked,
    };
    setState('sending');
    try {
      await submitBirthdayRequest(payload);
      setState('received');
      form.reset();
      track('birthday_submitted');
    } catch (err) {
      setState('error');
      track('birthday_failed', { code: err.code || 'unknown' });
    }
  });
  $('.r-error [data-retry]', box).addEventListener('click', () => setState('idle'));
}

/**
 * Punto único de analítica. No envía nada: Agent.IA conecta aquí su herramienta (CRM/analítica).
 * Nunca incluir datos personales en estos eventos.
 */
export function track(name, props = {}) {
  window.dispatchEvent(new CustomEvent('guero:track', { detail: { name, ...props } }));
}
