#!/usr/bin/env node
// Quality gate for a daily pack. Exit 1 on errors (fix them), warnings are advisory.
// node tools/check.mjs output/<date>
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ROOT, readJSON } from './lib.mjs';
import { entries } from './log.mjs';

const dir = resolve(ROOT, process.argv[2] || '');
const errors = [];
const warns = [];
const err = (m) => errors.push(m);
const warn = (m) => warns.push(m);
const words = (s = '') => String(s).split(/\s+/).filter(Boolean).length;

const specPath = join(dir, 'carousel.json');
if (!existsSync(specPath)) {
  console.error(`missing ${specPath}`);
  process.exit(1);
}
const p = readJSON(specPath);
const packPath = join(dir, 'pack.md');
const pack = existsSync(packPath) ? readFileSync(packPath, 'utf8') : '';
const allText = JSON.stringify(p) + '\n' + pack;

// Structure
for (const k of ['date', 'slug', 'pillar', 'stage', 'niche', 'service', 'keyword', 'hook_tag', 'slides', 'caption', 'hashtags', 'alt_text', 'link', 'reels'])
  if (p[k] === undefined || p[k] === '') err(`carousel.json: missing "${k}"`);
const n = p.slides?.length || 0;
if (n < 7 || n > 10) err(`slides: ${n} (want 7–9)`);
if (p.slides?.[0]?.layout !== 'cover') err('slide 1 must be layout "cover"');
if (p.slides?.at(-1)?.layout !== 'cta') err('last slide must be layout "cta"');
const LAYOUTS = ['cover', 'text', 'list', 'compare', 'stat', 'quote', 'steps', 'image', 'cta'];
p.slides?.forEach((s, i) => {
  if (!LAYOUTS.includes(s.layout)) err(`slide ${i + 1}: unknown layout "${s.layout}"`);
  if (words(s.title) > 12) err(`slide ${i + 1}: title ${words(s.title)} words (max 12)`);
  if (words(s.body) > 40) err(`slide ${i + 1}: body ${words(s.body)} words (max 40)`);
  if ((s.items || []).some((x) => words(x) > 10)) err(`slide ${i + 1}: list item over 10 words`);
  if ((s.items || []).length > 6) err(`slide ${i + 1}: more than 6 items`);
});
if (words(p.slides?.[0]?.title) > 9) warn(`cover hook is ${words(p.slides[0].title)} words — punchier under 9`);

// Caption, hashtags, link, CTA
if ((p.caption || '').length > 2200) err('caption over 2200 chars');
if ((p.caption || '').split('\n')[0].length > 125) warn('caption line 1 over 125 chars (gets cut before "more")');
if (!Array.isArray(p.hashtags) || p.hashtags.length < 3 || p.hashtags.length > 5) err('hashtags: want 3–5');
if (!/utm_source=instagram/.test(p.link || '') || !/moradesign\.shop|cal\.com\/notmora/.test(p.link || '')) err('link must be a UTM link to moradesign.shop or cal.com (use tools/utm.mjs)');
if (p.keyword && !(p.caption || '').includes(p.keyword)) err(`caption must contain the keyword ${p.keyword}`);
const cta = p.slides?.at(-1) || {};
if (p.keyword && ![cta.keyword, cta.title, cta.sub, cta.button].join(' ').includes(p.keyword) && !/link in bio|book/i.test([cta.title, cta.sub, cta.button].join(' ')))
  err('CTA slide must show the keyword or a booking CTA');
if (!(p.reels || []).length) err('reels: add hook/hook_tag metadata for each reel script');

// Pack sections
if (!pack) err('missing pack.md');
for (const h of ['## Carousel', '## Reel A', '## Reel B', '## Stories', '## DM reply'])
  if (pack && !pack.includes(h)) err(`pack.md: missing section "${h}"`);
if (pack && !/utm_source=instagram/.test(pack)) err('pack.md: no UTM link (stories/DM need one)');

// Brand and honesty rules
const BANNED = ['elevate', 'unlock', 'game-changer', 'game changer', "in today's digital", 'skyrocket', 'guaranteed'];
for (const b of BANNED) if (allText.toLowerCase().includes(b)) err(`banned phrase: "${b}"`);
if (/(CHF|€|\$|EUR|USD)\s?\d|\d+\s?(CHF|€|francs)/i.test(allText)) err('price mentioned — no public prices');
if (/\b(my|our) client[s]? (got|saw|increased|doubled)|case study|testimonial|\d+% more (bookings|clients|leads)/i.test(allText))
  warn('possible claimed result/testimonial — only allowed if real and approved by Jordi');
if (/\d+\s?%/.test(JSON.stringify(p.slides)) && !p.slides.some((s) => s.source)) warn('percentage on slides without a "source" field');
if (/spots? left|only \d+ (spots|places)/i.test(allText)) warn('scarcity claim — only if true');

// Dedupe vs history
const hist = entries().filter((e) => e.date !== p.date);
const tok = (s) => new Set(String(s).toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w) => w.length > 2));
const sim = (x, y) => { const A = tok(x), B = tok(y); const inter = [...A].filter((w) => B.has(w)).length; return inter / Math.max(1, Math.min(A.size, B.size)); };
for (const e of hist.slice(-30)) {
  if (sim(e.hook, p.slides?.[0]?.title) >= 0.7) err(`cover hook too similar to ${e.date}: "${e.hook}"`);
  for (const r of p.reels || []) for (const old of e.reels || []) if (sim(old.hook, r.hook) >= 0.7) warn(`reel ${r.id} hook similar to ${e.date}: "${old.hook}"`);
}
const prev = hist.at(-1);
if (prev && prev.hook_tag === p.hook_tag) warn(`same hook formula [${p.hook_tag}] as ${prev.date}`);
if (prev && prev.niche === p.niche && prev.pillar === p.pillar) warn('same niche + pillar as previous post');

// Rendered files
const sd = join(dir, 'slides');
if (existsSync(sd)) {
  const pngs = readdirSync(sd).filter((f) => /^\d+\.png$/.test(f)).length;
  if (pngs !== n) err(`slides/: ${pngs} PNGs for ${n} slides — re-run render`);
} else warn('slides not rendered yet (node tools/render.mjs)');

for (const w of warns) console.log(`WARN  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(errors.length ? `✗ ${errors.length} error(s)` : `✓ pack OK (${warns.length} warning(s))`);
process.exit(errors.length ? 1 : 0);
