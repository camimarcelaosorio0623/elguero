import { $, esc, safeUrl, setState } from '../lib/dom.js';
import { getPromotions, getEvents } from '../services/index.js';
import { formatDateLong } from '../lib/time.js';

/** Promociones: solo las activas. Con ?preview=socios también los borradores, marcados. */
export async function initPromotions() {
  const box = $('#promos');
  const list = $('#promo-list');
  if (!box) return;
  try {
    const promos = await getPromotions();
    if (!promos.length) { setState(box, 'empty'); return; }
    list.innerHTML = promos.map((p) => {
      const img = safeUrl(p.image);
      return `
      <article class="promo" data-promo-id="${esc(p.id)}" data-status="${esc(p.status)}">
        ${p.status === 'draft' ? '<span class="borrador">Borrador</span>' : ''}
        ${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : '<div></div>'}
        <div>
          <h3 class="disp">${esc(p.title)}</h3>
          <p>${p.description ? esc(p.description) : (p.status === 'draft' ? 'Pendiente de aprobación de socios: condiciones por definir.' : '')}</p>
          ${p.conditions ? `<p class="fine">${esc(p.conditions)}</p>` : ''}
        </div>
      </article>`;
    }).join('');
    setState(box, 'ready');
  } catch (err) {
    console.warn('[promos]', err.code || err.message);
    setState(box, 'error');
  }
}

/** Eventos publicados. El primero que tenga fecha futura lleva cuenta regresiva. */
export async function initEvents() {
  const box = $('#eventos-box');
  const list = $('#ev-list');
  if (!box) return;
  try {
    const events = await getEvents();
    if (!events.length) { setState(box, 'empty'); return; }
    list.innerHTML = events.map(eventHtml).join('');
    setState(box, 'ready');
    events.forEach(wireEvent);
  } catch (err) {
    console.warn('[eventos]', err.code || err.message);
    setState(box, 'error');
  }
}

function eventHtml(ev) {
  const d = formatDateLong(ev.startsAt);
  const img = safeUrl(ev.image);
  const video = safeUrl(ev.video);
  const future = new Date(ev.startsAt).getTime() > Date.now();
  const media = video
    ? `<div class="ev-media" data-video="${esc(video)}">${img ? `<img src="${esc(img)}" alt="Flyer: ${esc(ev.title)}" loading="lazy">` : ''}<button type="button" class="ev-play" aria-label="Ver video: ${esc(ev.title)}"><span><svg viewBox="0 0 24 24"><path d="M6 4l14 8-14 8z"/></svg></span></button></div>`
    : img ? `<div class="ev-media"><img src="${esc(img)}" alt="Flyer: ${esc(ev.title)}" loading="lazy"></div>` : '';
  const cta = ev.cta && safeUrl(ev.cta.href) ? `<a class="btn btn-oro" href="${esc(safeUrl(ev.cta.href))}" data-cta="evento-${esc(ev.id)}">${esc(ev.cta.label)}</a>` : '';
  return `
    <article class="ev reveal in" id="ev-${esc(ev.id)}">
      ${media}
      <div>
        <div class="ev-date"><div class="ev-cal"><b>${d.dd}</b><span>${d.mon}</span></div><div class="ev-when"><span>${esc(d.day)}</span><span>${esc(d.time)}</span></div></div>
        <h3 class="disp oro-txt">${esc(ev.title)}</h3>
        ${ev.description ? `<p>${esc(ev.description)}</p>` : ''}
        ${future ? `<div class="cd" data-countdown="${esc(ev.startsAt)}" role="timer" aria-label="Cuenta regresiva"><div><b>00</b><span>Días</span></div><div><b>00</b><span>Horas</span></div><div><b>00</b><span>Min</span></div><div><b>00</b><span>Seg</span></div></div>` : ''}
        ${cta}
      </div>
    </article>`;
}

function wireEvent(ev) {
  const root = document.getElementById('ev-' + ev.id);
  if (!root) return;

  const media = root.querySelector('.ev-media[data-video]');
  media?.querySelector('.ev-play').addEventListener('click', () => {
    const v = document.createElement('video');
    v.src = media.dataset.video;
    v.controls = true;
    v.playsInline = true;
    v.autoplay = true;
    media.replaceChildren(v);
    v.play().catch(() => {});
  });

  const cd = root.querySelector('[data-countdown]');
  if (!cd) return;
  const target = new Date(cd.dataset.countdown).getTime();
  const cells = [...cd.querySelectorAll('b')];
  const p = (n) => String(n).padStart(2, '0');
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60].forEach((v, i) => (cells[i].textContent = p(v)));
    if (!s) { clearInterval(id); cd.hidden = true; }
  };
  const id = setInterval(tick, 1000);
  tick();
}
