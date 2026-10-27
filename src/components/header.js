import { $, $$ } from '../lib/dom.js';

/** Header transparente sobre el hero, sólido al bajar; menú móvil accesible. */
export function initHeader() {
  const header = $('#top');
  const burger = $('#burger');
  const links = $('#menu-links');
  const hero = $('#inicio');

  new IntersectionObserver(([e]) => header.classList.toggle('solid', !e.isIntersecting), {
    rootMargin: '-80px 0px 0px 0px',
  }).observe(hero);

  const close = () => { links.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Abrir menú'); };
  burger.addEventListener('click', () => {
    const open = !links.classList.contains('open');
    links.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    if (open) header.classList.add('solid');
  });
  $$('a', links).forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/** Botón flotante: se esconde en el hero y en la sección de reservas. */
export function initFab() {
  const fab = $('#fab');
  if (!fab) return;
  const hidden = new Set();
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? hidden.add(e.target.id) : hidden.delete(e.target.id)));
    fab.classList.toggle('hide', hidden.size > 0);
  }, { threshold: 0.15 });
  ['inicio', 'reservas'].forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  setTimeout(() => fab.classList.add('hi'), 6000);
  setTimeout(() => fab.classList.remove('hi'), 11000);
}

/** Aparición al hacer scroll. */
export function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  $$('.panels, .esp-grid').forEach((g) => [...g.children].forEach((c, i) => (c.style.transitionDelay = i * 0.09 + 's')));
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}
