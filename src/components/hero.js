import { $, reducedMotion } from '../lib/dom.js';
import { site } from '../config/site.js';
import { isOpenNow } from '../lib/time.js';

/**
 * Video de fondo del hero: carga SOLO la versión que corresponde (16:9 o 9:16),
 * después de que la página pintó, y nunca con movimiento reducido o ahorro de datos.
 * El poster (<img>) es el respaldo y el elemento LCP.
 */
export function initHeroVideo() {
  const video = $('#hero-video');
  if (!video) return;
  const saveData = navigator.connection?.saveData;
  if (reducedMotion() || saveData) return;

  const portrait = window.matchMedia('(max-aspect-ratio: 4/5)');
  const load = () => {
    const src = portrait.matches ? video.dataset.srcMobile : video.dataset.srcDesktop;
    if (video.getAttribute('src') === src) return;
    video.classList.remove('playing');
    video.src = src;
    video.play().catch(() => {});
  };
  video.addEventListener('playing', () => video.classList.add('playing'));

  const start = () => (window.requestIdleCallback || setTimeout)(load);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
  portrait.addEventListener('change', load);

  // Pausar cuando el hero no se ve: ahorra batería y CPU.
  new IntersectionObserver(([e]) => {
    if (!video.src) return;
    if (e.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }).observe(video);
}

/** Globo del Güero: frases que mezclan güero y compa. */
export function initGlobo() {
  const el = $('#globo');
  if (!el || reducedMotion()) return;
  const frases = [
    '¡Ándale, güero, pásale, compa!',
    '¿Un cantarito, compa?',
    'Hoy hay pastor de trompo, güero 🌮',
    'Aquí todos somos compas',
    '¡Que suene la banda, güero!',
  ];
  let i = 0;
  setInterval(() => {
    el.classList.add('fade');
    setTimeout(() => { i = (i + 1) % frases.length; el.textContent = frases[i]; el.classList.remove('fade'); }, 300);
  }, 3800);
}

/** Línea de estado del hero: apertura → abierto/cerrado según el horario. */
export function initEstado() {
  const dot = $('#dot'), txt = $('#estado-txt');
  if (!dot || !txt) return;
  const opening = new Date(site.opening.iso).getTime();
  const paint = () => {
    if (Date.now() < opening) {
      dot.classList.remove('on');
      txt.textContent = 'Apertura · ' + site.opening.label;
      return;
    }
    const { open, dow } = isOpenNow(site.hours);
    dot.classList.toggle('on', open);
    txt.textContent = open ? 'Abierto ahora · pásale, compa' : dow === 1 ? 'Hoy el Güero descansa · volvemos mañana' : 'Cerrado ahora · te esperamos, güero';
  };
  paint();
  setInterval(paint, 60000);
}
