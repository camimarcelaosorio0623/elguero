import { $, $$, reducedMotion } from '../lib/dom.js';

/**
 * El cantarito se "sirve" capa por capa al bajar.
 * Hay dos medidores con el mismo valor: el de la foto (desktop) y uno pegajoso
 * dentro de la columna de capas (móvil), para que el % no se pierda al hacer scroll.
 */
export function initCantarito() {
  const capas = $$('#capas .capa');
  const meters = $$('#cantarito .medidor');
  const sr = $('#medidor-sr');
  if (!capas.length) return;

  let last = -1;
  const update = () => {
    const on = capas.filter((c) => c.classList.contains('on')).length;
    const pct = Math.round((on / capas.length) * 100);
    if (pct === last) return;
    last = pct;
    meters.forEach((m) => { m.querySelector('.bar i').style.width = pct + '%'; m.querySelector('b').textContent = pct + '%'; });
    if (pct === 100 && sr) sr.textContent = 'Cantarito servido al 100%.';
  };

  if (!('IntersectionObserver' in window) || reducedMotion()) {
    capas.forEach((c) => c.classList.add('on'));
    update();
    return;
  }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting || e.boundingClientRect.top < 0));
    update();
  }, { rootMargin: '0px 0px -40% 0px' });
  capas.forEach((c) => io.observe(c));
}
