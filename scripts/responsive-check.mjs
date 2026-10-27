/**
 * Prueba responsive y de flujos sobre el build de producción.
 * Uso: npm run build && npm run preview (en otra terminal) && npm run check:responsive
 * Variables: BASE_URL (por defecto http://localhost:4173), OUT (carpeta de capturas).
 *
 * Revisa por viewport: errores de consola, scroll horizontal, hero en el primer pantallazo,
 * carta cargada, medidor del cantarito visible al bajar en móvil, y los estados del formulario.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const OUT = process.env.OUT || 'docs/pruebas';
mkdirSync(OUT, { recursive: true });

const viewports = [
  { name: 'movil-360', width: 360, height: 780, mobile: true },
  { name: 'movil-390', width: 390, height: 844, mobile: true },
  { name: 'tablet-768', width: 768, height: 1024, mobile: true },
  { name: 'desktop-1366', width: 1366, height: 768, mobile: false },
  { name: 'desktop-1920', width: 1920, height: 1080, mobile: false },
];

const results = [];
const browser = await chromium.launch();

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('requestfailed', (r) => errors.push('request failed: ' + r.url()));

  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/${vp.name}-hero.jpg`, quality: 72 });

  const r = { viewport: vp.name, checks: {} };
  r.checks.sinScrollHorizontal = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
  r.checks.heroPrimerPantallazo = await page.evaluate(() => {
    const h = document.getElementById('inicio').getBoundingClientRect();
    return h.top <= 0 && h.height >= window.innerHeight - 2;
  });
  r.checks.ctasEnPrimerPantallazo = await page.evaluate(() => {
    const b = document.querySelector('[data-cta="hero-reservar"]').getBoundingClientRect();
    return b.bottom <= window.innerHeight;
  });

  await page.locator('#carta').scrollIntoViewIfNeeded();
  await page.waitForSelector('#carta-panel[data-state="ready"]');
  r.checks.cartaCargada = (await page.locator('.plato').count()) > 0;
  r.checks.frijolesPuercos = (await page.locator('.plato b', { hasText: 'Frijoles puercos con chorizo' }).count()) === 1;
  r.checks.sinBirria = !(await page.content()).toLowerCase().includes('birria');
  await page.screenshot({ path: `${OUT}/${vp.name}-carta.jpg`, quality: 72 });

  // Medidor del cantarito: a mitad de las capas debe seguir visible en pantalla.
  await page.evaluate(() => {
    const c = document.querySelectorAll('#capas .capa')[3];
    window.scrollTo({ top: c.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.4, behavior: 'instant' });
  });
  await page.waitForTimeout(900);
  r.checks.medidorVisibleAlBajar = await page.evaluate(() => [...document.querySelectorAll('#cantarito .medidor')].some((m) => {
    const b = m.getBoundingClientRect();
    return getComputedStyle(m).display !== 'none' && b.top >= 0 && b.bottom <= window.innerHeight;
  }));
  await page.screenshot({ path: `${OUT}/${vp.name}-cantarito.jpg`, quality: 72 });

  // Formulario de reserva: validación → enviando → recibida (nunca "confirmada" en la demo).
  await page.locator('#reservas').scrollIntoViewIfNeeded();
  await page.click('#form-reserva button[type="submit"]');
  r.checks.validacionVisible = (await page.locator('#form-reserva .err:not(:empty)').count()) >= 3;
  await page.fill('#r-name', 'Compa de prueba');
  await page.fill('#r-date', '2026-11-13');
  await page.dispatchEvent('#r-date', 'change');
  await page.selectOption('#r-time', '19:00');
  await page.fill('#r-phone', '3000000000');
  await page.check('#form-reserva input[name="consent"]');
  await page.click('#form-reserva button[type="submit"]');
  r.checks.estadoEnviando = await page.locator('#reserva-box[data-state="sending"]').count() === 1;
  await page.waitForSelector('#reserva-box[data-state="received"]', { timeout: 8000 });
  r.checks.estadoRecibidaNoConfirmada = true;
  await page.screenshot({ path: `${OUT}/${vp.name}-reserva.jpg`, quality: 72 });

  await page.locator('#franquicias').scrollIntoViewIfNeeded();
  r.checks.franquiciasAlFinal = await page.evaluate(() => {
    const secs = [...document.querySelectorAll('main > section')];
    return secs[secs.length - 1].id === 'franquicias';
  });
  await page.screenshot({ path: `${OUT}/${vp.name}-franquicias.jpg`, quality: 72 });

  r.consoleErrors = errors;
  r.ok = Object.values(r.checks).every(Boolean) && errors.length === 0;
  results.push(r);
  console.log(`${r.ok ? '✅' : '❌'} ${vp.name}`, JSON.stringify(r.checks), errors.length ? errors : '');
  await ctx.close();
}

// Escenario de error del mock
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(BASE + '/?mock=error#reservas', { waitUntil: 'networkidle' });
  await page.fill('#r-name', 'Compa de prueba');
  await page.fill('#r-date', '2026-11-14');
  await page.dispatchEvent('#r-date', 'change');
  await page.selectOption('#r-time', '20:00');
  await page.fill('#r-phone', '3000000000');
  await page.check('#form-reserva input[name="consent"]');
  await page.click('#form-reserva button[type="submit"]');
  await page.waitForSelector('#reserva-box[data-state="error"]', { timeout: 8000 });
  const keepsData = (await page.inputValue('#r-name')) === 'Compa de prueba';
  await page.screenshot({ path: `${OUT}/escenario-error.jpg`, quality: 72 });
  console.log(`${keepsData ? '✅' : '❌'} escenario ?mock=error (estado de error y conserva datos)`);
  results.push({ viewport: 'escenario-error', ok: keepsData });

  await page.goto(BASE + '/?preview=socios#celebra', { waitUntil: 'networkidle' });
  const drafts = await page.locator('.promo[data-status="draft"]').count();
  await page.goto(BASE + '/#celebra', { waitUntil: 'networkidle' });
  const publicDrafts = await page.locator('.promo').count();
  const ok = drafts === 2 && publicDrafts === 0;
  console.log(`${ok ? '✅' : '❌'} promociones: borradores solo en ?preview=socios (${drafts} en preview, ${publicDrafts} públicos)`);
  results.push({ viewport: 'promos-borrador', ok });
  await ctx.close();
}

await browser.close();
writeFileSync(`${OUT}/resultados.json`, JSON.stringify(results, null, 2));
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
