import { $, $$, reducedMotion } from '../lib/dom.js';

/**
 * El cantarito se "sirve" capa por capa al bajar.
 * Hay dos medidores con el mismo valor: el del marco y uno dentro de la columna de capas
 * (respaldo; hoy el CSS lo oculta porque el marco ya acompaña el scroll también en móvil).
 * El SVG (#cnt, de la referencia v5 del equipo) se llena siguiendo las mismas capas.
 */
export function initCantarito() {
  const capas = $$('#capas .capa');
  const meters = $$('#cantarito .medidor');
  const sr = $('#medidor-sr');
  if (!capas.length) return;
  const vaso = initVaso(capas.length);

  let last = -1;
  const update = () => {
    const on = capas.filter((c) => c.classList.contains('on')).length;
    vaso?.to(on);
    const pct = Math.round((on / capas.length) * 100);
    if (pct === last) return;
    last = pct;
    meters.forEach((m) => { m.querySelector('.bar i').style.width = pct + '%'; m.querySelector('b').textContent = pct + '%'; });
    if (pct === 100 && sr) sr.textContent = 'Cantarito servido al 100%.';
  };

  if (!('IntersectionObserver' in window) || reducedMotion()) {
    capas.forEach((c) => c.classList.add('on'));
    vaso?.set(capas.length);
    update();
    return;
  }
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => e.target.classList.toggle('on', e.isIntersecting || e.boundingClientRect.top < 0));
    update();
  }, { rootMargin: '0px 0px -40% 0px' });
  capas.forEach((c) => io.observe(c));
}

/**
 * Nivel del líquido según cuántas capas van encendidas (en orden: barro, tequila,
 * limón, toronja, sal de chile, el toque). 0 = vacío, 1 = hasta el borde.
 */
const NIVEL = [0, 0, 0.26, 0.37, 0.9, 0.92, 1];

function initVaso(total) {
  const svg = $('#cnt');
  if (!svg) return null;
  const lvl = $('#cn-lvl-r', svg), wave = $('#cn-wave', svg), salt = $('#cn-salt-r', svg), lime = $('#cn-lime', svg);

  let bubs = '';
  for (let i = 0; i < 14; i++) {
    bubs += `<circle class="bub" cx="${(70 + Math.random() * 280).toFixed(0)}" cy="${(360 + Math.random() * 80).toFixed(0)}" r="${(1.6 + Math.random() * 3).toFixed(1)}" style="animation-delay:${(-Math.random() * 3.2).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 2).toFixed(2)}s"/>`;
  }
  $('#cn-bubs', svg).innerHTML = bubs;

  // p va de 0 a `total` (capas encendidas) y se interpola para que el llenado sea suave.
  const draw = (p) => {
    const i = Math.min(Math.floor(p), total - 1);
    const fill = NIVEL[i] + (NIVEL[i + 1] - NIVEL[i]) * (p - i);
    const y = 416 - fill * (416 - 142);
    lvl.setAttribute('y', y.toFixed(1));
    wave.setAttribute('transform', `translate(0 ${(y - 6).toFixed(1)})`);
    wave.style.opacity = fill > 0.02 ? 1 : 0;
    lime.setAttribute('transform', `translate(0 ${y.toFixed(1)})`);
    salt.setAttribute('width', (232 * Math.max(0, Math.min(1, p - 4))).toFixed(1));
    svg.classList.toggle('lime', p > 2.5);
    svg.classList.toggle('slice', p > 3.5);
  };

  let cur = 0, tgt = 0, raf = 0;
  const tick = () => {
    cur = Math.abs(tgt - cur) < 0.004 ? tgt : cur + (tgt - cur) * 0.08;
    draw(cur);
    raf = cur === tgt ? 0 : requestAnimationFrame(tick);
  };
  draw(0);
  return {
    to(n) { tgt = n; if (!raf) raf = requestAnimationFrame(tick); },
    set(n) { cur = tgt = n; draw(n); },
  };
}
