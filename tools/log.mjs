#!/usr/bin/env node
// Content log: dedupe memory for the writer, kept compact.
// node tools/log.mjs recent [n]         → one line per past post
// node tools/log.mjs add output/<date>  → append that day's post to data/content-log.jsonl
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, readJSON } from './lib.mjs';

const LOG = join(ROOT, 'data/content-log.jsonl');

export function entries() {
  if (!existsSync(LOG)) return [];
  return readFileSync(LOG, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

export function recent(n = 21) {
  return entries().slice(-n).map((e) =>
    `${e.date} ${e.pillar}/${e.niche}/${e.service} [${e.hook_tag}] "${e.hook}" | reels: ${(e.reels || []).map((r) => `[${r.hook_tag}] ${r.hook}`).join(' ; ')}`,
  );
}

function add(dir) {
  const post = readJSON(join(resolve(ROOT, dir), 'carousel.json'));
  if (entries().some((e) => e.date === post.date)) {
    console.log(`already logged: ${post.date}`);
    return;
  }
  const entry = {
    date: post.date,
    slug: post.slug,
    pillar: post.pillar,
    stage: post.stage,
    niche: post.niche,
    service: post.service,
    keyword: post.keyword,
    hook_tag: post.hook_tag,
    hook: post.slides[0].title,
    reels: (post.reels || []).map(({ hook, hook_tag, trend }) => ({ hook, hook_tag, trend })),
  };
  appendFileSync(LOG, JSON.stringify(entry) + '\n');
  console.log(`logged ${entry.date} ${entry.slug}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [cmd, arg] = process.argv.slice(2);
  if (cmd === 'add' && arg) add(arg);
  else if (cmd === 'recent') console.log(recent(Number(arg) || 21).join('\n') || '(empty log)');
  else {
    console.error('usage: node tools/log.mjs recent [n] | add output/<date>');
    process.exit(1);
  }
}
