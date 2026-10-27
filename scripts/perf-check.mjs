/**
 * Medición orientativa de Web Vitals en móvil (laboratorio, no datos de campo).
 * Simula 4G lento + CPU 4x más lenta. Uso: con `npm run preview` corriendo → node scripts/perf-check.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:4173';
const browser = await chromium.launch();
const runs = [];
for (let i = 0; i < 3; i++) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__v = { lcp: 0, cls: 0, inp: 0 };
    new PerformanceObserver((l) => l.getEntries().forEach((e) => (window.__v.lcp = e.startTime))).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) window.__v.cls += e.value; })).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (e.interactionId) window.__v.inp = Math.max(window.__v.inp, e.duration); })).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await page.tap('#tab-drinks');
  await page.tap('#burger');
  await page.waitForTimeout(500);
  const v = await page.evaluate(() => window.__v);
  runs.push(v);
  console.log(`run ${i + 1}: LCP ${Math.round(v.lcp)} ms · CLS ${v.cls.toFixed(3)} · INP ${Math.round(v.inp)} ms`);
  await ctx.close();
}
await browser.close();
