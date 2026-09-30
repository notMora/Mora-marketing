#!/usr/bin/env node
// Print a tracked link.
// node tools/utm.mjs /website-for-hair-salons/ --medium story --format story --slug dm-bookings [--date 2026-09-30]
// node tools/utm.mjs cal --medium dm --format dm --slug audit
import { utm, args } from './lib.mjs';

const a = args();
const target = a._[0];
if (!target) {
  console.error('usage: node tools/utm.mjs <path|cal|url> [--medium social|bio|story|dm] [--format carousel|reel|story|dm] [--slug x] [--date YYYY-MM-DD]');
  process.exit(1);
}
console.log(utm(target, { medium: a.medium, format: a.format, slug: a.slug, date: a.date }));
