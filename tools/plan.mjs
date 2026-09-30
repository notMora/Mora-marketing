#!/usr/bin/env node
// Print today's content slot as compact JSON (the only planning input the writer needs).
// node tools/plan.mjs [--date YYYY-MM-DD]
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readJSON, zurichDate, weekdayOf, dayOfYear, utm, latestResearch, args, CAL } from './lib.mjs';
import { recent } from './log.mjs';

const a = args();
const date = a.date || zurichDate().date;
const weekday = weekdayOf(date);
const cal = readJSON(join(ROOT, 'strategy/calendar.json'));
const slot = cal.weekly_grid[weekday];
const n = dayOfYear(date);
const niche = cal.niches[n % cal.niches.length];
const service = cal.services[Math.floor(n / cal.niches.length) % cal.services.length];
const keyword = cal.keyword_overrides[slot.pillar] || service.keyword;
const outDir = join('output', date);
mkdirSync(join(ROOT, outDir), { recursive: true });

const learnings = join(ROOT, 'strategy/learnings.md');
const weights = existsSync(learnings)
  ? (readFileSync(learnings, 'utf8').match(/^money-leaks .*$/m) || [''])[0]
  : '';

const slug = `${slot.pillar}-${niche.id}`;
console.log(JSON.stringify({
  date,
  weekday,
  ...slot,
  niche,
  service,
  keyword,
  deep_research: weekday === cal.deep_research_day || !latestResearch(),
  latest_research: latestResearch(),
  out_dir: outDir,
  links: {
    carousel: utm(niche.path, { format: 'carousel', slug, date }),
    reel: utm(niche.path, { format: 'reel', slug, date }),
    story: utm(service.path, { medium: 'story', format: 'story', slug, date }),
    dm_call: utm('cal', { medium: 'dm', format: 'dm', slug: keyword, date }),
    cal: CAL,
  },
  outputs: cal.daily_outputs,
  weights,
  recent: recent(21),
}));
