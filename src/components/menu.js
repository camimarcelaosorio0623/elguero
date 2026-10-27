import { $, $$, esc, safeUrl, setState } from '../lib/dom.js';
import { getMenu } from '../services/index.js';

const SECTIONS = { food: 'Comida', drinks: 'Bebidas' };
const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });

/**
 * Carta digital: todo sale de getMenu(). El componente solo pinta.
 * - description/price en null no se muestran (no aprobados).
 * - availability: sold_out → "Agotado", unavailable → "No disponible".
 * - Categoría sin productos → mensaje de "en revisión".
 */
export function initMenu() {
  const panel = $('#carta-panel');
  const list = $('#carta-list');
  const chips = $('#cat-chips');
  const tabs = $$('.carta-tabs [role="tab"]');
  let menu = null;
  let section = 'food';

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab.dataset.section));
    tab.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      select(next.dataset.section);
    });
  });
  $('[data-retry]', panel).addEventListener('click', load);

  function select(s) {
    section = s;
    tabs.forEach((t) => {
      const on = t.dataset.section === s;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on) panel.setAttribute('aria-labelledby', t.id);
    });
    render();
  }

  async function load() {
    setState(panel, 'loading');
    try {
      menu = await getMenu();
      render();
    } catch (err) {
      console.warn('[carta]', err.code || err.message);
      setState(panel, 'error');
    }
  }

  function render() {
    if (!menu) return;
    const cats = menu.categories.filter((c) => c.section === section);
    if (!cats.length) { setState(panel, 'empty'); list.innerHTML = ''; chips.innerHTML = ''; return; }

    chips.innerHTML = cats.map((c) => `<a href="#cat-${esc(c.id)}">${esc(c.name)}</a>`).join('');
    list.innerHTML = cats.map((c, i) => {
      const items = menu.products.filter((p) => p.categoryId === c.id);
      return categoryHtml(c, items, i, cats.length);
    }).join('');
    setState(panel, 'ready');
  }

  load();
}

function categoryHtml(c, items, i, total) {
  const img = safeUrl(c.image);
  const body = items.length
    ? items.map((p, k) => productHtml(p, k)).join('')
    : '<p class="cat-empty">Esta parte de la carta está en revisión, güero. Muy pronto.</p>';
  return `
    <article class="cat" id="cat-${esc(c.id)}">
      <div class="cat-txt">
        <div class="num">${SECTIONS[c.section] || ''} · ${i + 1} de ${total}</div>
        <h3 class="disp">${esc(c.name)}</h3>
        ${c.description ? `<p class="lead">${esc(c.description)}</p>` : ''}
        <div class="platos">${body}</div>
      </div>
      <div class="cat-ph">${img
        ? `<img src="${esc(img)}" alt="" loading="lazy" decoding="async">`
        : '<div class="ph-fallback" aria-hidden="true"><svg viewBox="0 0 64 32"><use href="#ico-sombrero"/></svg></div>'}</div>
    </article>`;
}

function productHtml(p, k) {
  const off = p.availability !== 'available';
  const badge = p.availability === 'sold_out' ? '<span class="tag agotado">Agotado</span>'
    : p.availability === 'unavailable' ? '<span class="tag agotado">No disponible</span>'
    : p.featured ? '<span class="tag">De la casa</span>' : '';
  const price = typeof p.price === 'number' ? `<span class="precio">${cop.format(p.price)}</span>` : '<span></span>';
  return `
    <div class="plato${off ? ' off' : ''}" data-product-id="${esc(p.id)}">
      <span class="n">${String(k + 1).padStart(2, '0')}</span>
      <b>${esc(p.name)}${badge}</b>
      ${price}
      ${p.description ? `<p>${esc(p.description)}</p>` : ''}
    </div>`;
}
