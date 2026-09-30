#!/usr/bin/env node
// Render a carousel spec to PNG slides (1080×1350) and reel covers (1080×1920).
// node tools/render.mjs output/<date>/carousel.json
// Layouts: cover, text, list, compare, stat, quote, steps, image, cta  (see .claude/skills/carousel/SKILL.md)
import { mkdirSync, readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, readJSON, loadPlaywright } from './lib.mjs';

const specPath = resolve(process.argv[2] || '');
if (!process.argv[2] || !existsSync(specPath)) {
  console.error('usage: node tools/render.mjs output/<date>/carousel.json');
  process.exit(1);
}
const spec = readJSON(specPath);
const dir = dirname(specPath);
const slidesDir = join(dir, 'slides');

const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// Escape, then wrap highlight phrases in <mark>. **bold** in text also becomes <mark>.
function rich(text = '', highlight) {
  let html = esc(text).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>');
  for (const h of [].concat(highlight || [])) {
    if (!h) continue;
    const re = new RegExp(`(${esc(h).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'i');
    if (!html.includes(`<mark>${esc(h)}`)) html = html.replace(re, '<mark>$1</mark>');
  }
  return html;
}
const img = (p) => (p ? (/^https?:/.test(p) ? p : pathToFileURL(isAbsolute(p) ? p : join(dir, p)).href) : null);

const DEFAULT_THEME = { cover: 'dark', text: 'light', list: 'light', compare: 'dark', stat: 'dark', quote: 'light', steps: 'light', image: 'dark', cta: 'lime' };

function body(s) {
  const k = s.kicker ? `<div class="kicker">${esc(s.kicker)}</div>` : '';
  const t = s.title ? `<h1 class="title fit">${rich(s.title, s.highlight)}</h1>` : '';
  const b = s.body ? `<p class="body">${rich(s.body, s.body_highlight)}</p>` : '';
  const sub = s.sub ? `<p class="sub">${rich(s.sub)}</p>` : '';
  switch (s.layout) {
    case 'cover':
      return `${k}${t}${sub}`;
    case 'list':
      return `${k}${t}<div class="items">${(s.items || []).map((it, i) => `<div class="item"><b>${String(i + 1).padStart(2, '0')}</b><span>${rich(it)}</span></div>`).join('')}</div>`;
    case 'compare': {
      const col = (c) => `<div class="col"><h3>${esc(c.label)}</h3>${(c.items || []).map((x) => `<p>${rich(x)}</p>`).join('')}</div>`;
      return `${k}${t}<div class="cols">${col(s.left || {})}${col(s.right || {})}</div>`;
    }
    case 'stat':
      return `${k}<div class="value fit">${esc(s.value)}</div>${s.label ? `<p class="body">${rich(s.label, s.highlight)}</p>` : ''}${s.source ? `<div class="source">Source: ${esc(s.source)}</div>` : ''}`;
    case 'quote':
      return `${k}<p class="quote fit">${rich(s.quote, s.highlight)}</p>${s.author ? `<div class="author">— ${esc(s.author)}</div>` : ''}`;
    case 'steps':
      return `${k}${t}<div class="steps">${(s.steps || []).map((st, i) => `<div class="step"><small>Step ${String(i + 1).padStart(2, '0')}</small><div><strong>${esc(st.t)}</strong><span>${rich(st.d)}</span></div></div>`).join('')}</div>`;
    case 'image':
      return `${k}${s.bg_image ? `<div class="shot" style="background-image:url('${img(s.bg_image)}')"></div>` : ''}${t}${s.caption ? `<div class="caption">${esc(s.caption)}</div>` : ''}`;
    case 'cta':
      return `${k}${t}${s.keyword ? `<div class="keyword">${esc(s.keyword)}</div>` : ''}${sub}${s.button ? `<div class="button">${esc(s.button)}</div>` : ''}${s.risk ? `<div class="risk">${esc(s.risk)}</div>` : ''}`;
    default: // text
      return `${k}${t}${b}`;
  }
}

function slideHTML(s, i, total, reel = false) {
  const theme = s.theme || DEFAULT_THEME[s.layout] || 'light';
  const bg = s.layout !== 'image' && s.bg_image ? `<div class="bg" style="background-image:url('${img(s.bg_image)}')"></div>` : '';
  const counter = reel ? '' : `${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
  const last = i === total - 1;
  return `<section class="slide ${reel ? 'reel ' : ''}${bg ? 'dark' : theme}" id="s${i}">${bg}
  <div class="bar top"><span class="brand"><i></i>Jordi Mora</span><span>${counter}</span></div>
  <div class="content">${body(s)}</div>
  <div class="bar bottom"><span>@jordimoradesign</span><span class="swipe">${reel || last ? 'moradesign.shop' : 'Swipe →'}</span></div>
</section>`;
}

const css = readFileSync(join(ROOT, 'tools/templates/slides.css'), 'utf8').replaceAll('__ASSETS__', pathToFileURL(join(ROOT, 'brand/assets')).href);
const slides = spec.slides || [];
const covers = (spec.reels || []).filter((r) => r.cover_title).map((r) => ({ layout: 'cover', kicker: r.cover_kicker, title: r.cover_title, highlight: r.cover_highlight, theme: r.cover_theme || 'dark', bg_image: r.cover_image }));

// Shrink oversized text until each slide's content fits (runs in the page).
const fitScript = `
for (const c of document.querySelectorAll('.content')) {
  const fits = [...c.querySelectorAll('.fit')];
  let guard = 0;
  while (c.scrollHeight > c.clientHeight + 1 && guard++ < 80) {
    let shrunk = false;
    for (const el of fits) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs > 44) { el.style.fontSize = (fs * 0.94) + 'px'; shrunk = true; } }
    if (!shrunk) {
      for (const el of c.querySelectorAll('.body,.item,.col p,.step span,.sub')) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs > 24) el.style.fontSize = (fs * 0.95) + 'px'; }
    }
  }
  for (const el of fits) { // also stop single long words overflowing horizontally
    let g = 0; while (el.scrollWidth > el.clientWidth + 1 && g++ < 40) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * 0.95) + 'px';
  }
}
document.body.dataset.ready = '1';`;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>
${slides.map((s, i) => slideHTML(s, i, slides.length)).join('\n')}
${covers.map((s, i) => slideHTML(s, slides.length + i, slides.length + covers.length, true).replace(`id="s${slides.length + i}"`, `id="r${i}"`)).join('\n')}
<script>document.fonts.ready.then(() => {${fitScript}});</script></body></html>`;

rmSync(slidesDir, { recursive: true, force: true });
mkdirSync(slidesDir, { recursive: true });
const htmlPath = join(slidesDir, '_carousel.html');
writeFileSync(htmlPath, html);

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: 'load' });
await page.waitForSelector('body[data-ready="1"]', { timeout: 15000 });

const warnings = [];
for (let i = 0; i < slides.length; i++) {
  const el = page.locator(`#s${i}`);
  const overflow = await el.evaluate((n) => { const c = n.querySelector('.content'); return c.scrollHeight > c.clientHeight + 1; });
  if (overflow) warnings.push(`slide ${i + 1}: text still overflows — shorten it`);
  await el.screenshot({ path: join(slidesDir, `${String(i + 1).padStart(2, '0')}.png`) });
}
for (let i = 0; i < covers.length; i++) {
  await page.locator(`#r${i}`).screenshot({ path: join(slidesDir, `reel-cover-${String.fromCharCode(65 + i)}.png`) });
}
await browser.close();
rmSync(htmlPath);
console.log(`rendered ${slides.length} slides${covers.length ? ` + ${covers.length} reel covers` : ''} → ${slidesDir}`);
if (warnings.length) {
  console.log(warnings.join('\n'));
  process.exitCode = 2;
}
