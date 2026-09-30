// Shared helpers for the marketing tools. Node 22, no dependencies.
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const SITE = 'https://moradesign.shop';
export const CAL = 'https://cal.com/notmora/20min';
export const TZ = 'Europe/Zurich';

export const readJSON = (p) => JSON.parse(readFileSync(p, 'utf8'));

// Today's date (YYYY-MM-DD) and weekday key in Zurich time.
export function zurichDate(d = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
      .formatToParts(d).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, weekday: parts.weekday.toLowerCase().slice(0, 3) };
}

export function weekdayOf(date) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }).toLowerCase();
}

export function dayOfYear(date) {
  const d = new Date(`${date}T12:00:00Z`);
  return Math.floor((d - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86400000);
}

// Build a tracked link. target: site path ("/services/web-design/"), "cal", or a full URL.
export function utm(target, { medium = 'social', format = 'post', slug = 'post', date } = {}) {
  const base = target === 'cal' ? CAL : /^https?:\/\//.test(target) ? target : SITE + (target.startsWith('/') ? target : `/${target}`);
  const url = new URL(base);
  const day = (date || zurichDate().date).replaceAll('-', '');
  url.searchParams.set('utm_source', 'instagram');
  url.searchParams.set('utm_medium', medium);
  url.searchParams.set('utm_campaign', `ig_${day}_${format}_${slug}`.toLowerCase().replace(/[^a-z0-9_-]/g, '-'));
  return url.toString();
}

export function latestResearch() {
  const dir = join(ROOT, 'research');
  if (!existsSync(dir)) return null;
  const files = readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort();
  return files.length ? join('research', files.at(-1)) : null;
}

// Resolve the globally installed playwright (preinstalled in the cloud image).
export async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
    return await import(join(globalRoot, 'playwright', 'index.mjs'));
  }
}

export function args(argv = process.argv.slice(2)) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}
