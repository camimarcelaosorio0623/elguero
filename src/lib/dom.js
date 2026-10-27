export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escapa texto que viene del backend antes de meterlo en HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/** Solo rutas relativas o http(s): evita javascript: y similares en URLs del backend. */
export function safeUrl(url) {
  if (!url) return '';
  const s = String(url).trim();
  return /^(https?:\/\/|\/|#)/i.test(s) ? s : '';
}

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Marca un contenedor con uno de los estados de interfaz: loading | ready | empty | error. */
export function setState(el, state) {
  el.dataset.state = state;
  el.setAttribute('aria-busy', state === 'loading' ? 'true' : 'false');
}
