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

/** Botón flotante de WhatsApp (siempre visible) con saludo del Güero. */
export function initFab() {
  const fab = $('#fab');
  if (!fab) return;
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
