#!/usr/bin/env node
// Higgsfield image generation for slides/reel covers that carry an "image_prompt".
// node tools/hf.mjs output/<date>/carousel.json [--dry-run] [--model <application id>]
//
// Auth (same as the official SDK): HF_KEY="api_key:api_secret"  or  HF_API_KEY + HF_API_SECRET.
// API: POST https://api.higgsfield.ai/<application>  (JSON arguments, header "Authorization: Key <key>")
//      → { request_id, status_url, cancel_url };  GET status_url → { status, images: [{ url }] }
// No key, no network or any error → never fails the pipeline: writes visuals.md with prompts to paste
// into the Higgsfield web app, and slides render with the typographic design instead.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { readJSON, args } from './lib.mjs';

const a = args();
const specPath = resolve(a._[0] || '');
if (!a._[0] || !existsSync(specPath)) {
  console.error('usage: node tools/hf.mjs output/<date>/carousel.json [--dry-run] [--model id]');
  process.exit(1);
}
const dir = dirname(specPath);
const spec = readJSON(specPath);
const BASE = 'https://api.higgsfield.ai';
const MODEL = a.model || process.env.HF_IMAGE_MODEL || 'bytedance/seedream/v4/text-to-image';
const KEY = process.env.HF_KEY || (process.env.HF_API_KEY && process.env.HF_API_SECRET ? `${process.env.HF_API_KEY}:${process.env.HF_API_SECRET}` : null);
const STYLE = 'photorealistic, natural light, muted colours, Swiss small-business interior, minimal, editorial, shallow depth of field, no text, no letters, no logos, no watermark';

// Jobs: slides and reel covers with a prompt and no image yet.
const jobs = [];
spec.slides.forEach((s, i) => s.image_prompt && !s.bg_image && jobs.push({ target: s, key: 'bg_image', name: `slide-${String(i + 1).padStart(2, '0')}`, prompt: s.image_prompt, ratio: '3:4' }));
(spec.reels || []).forEach((r) => r.cover_image_prompt && !r.cover_image && jobs.push({ target: r, key: 'cover_image', name: `reel-${r.id}`, prompt: r.cover_image_prompt, ratio: '9:16' }));

const headers = () => ({ Authorization: `Key ${KEY}`, 'Content-Type': 'application/json', 'User-Agent': 'mora-marketing/1.0' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generate(job) {
  const res = await fetch(`${BASE}/${MODEL}`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ prompt: `${job.prompt}. ${STYLE}`, aspect_ratio: job.ratio, resolution: '2K' }),
  });
  if (!res.ok) throw new Error(`submit ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { status_url } = await res.json();
  for (let t = 0; t < 60; t++) { // up to ~4 min
    await sleep(4000);
    const st = await (await fetch(status_url, { headers: headers() })).json();
    if (st.status === 'completed') {
      const url = st.images?.[0]?.url;
      if (!url) throw new Error('completed without image url');
      const img = await fetch(url);
      if (!img.ok) throw new Error(`download ${img.status}`);
      mkdirSync(join(dir, 'images'), { recursive: true });
      const rel = `images/${job.name}.${url.split('?')[0].split('.').pop().slice(0, 4) || 'png'}`;
      writeFileSync(join(dir, rel), Buffer.from(await img.arrayBuffer()));
      return rel;
    }
    if (['failed', 'nsfw', 'canceled'].includes(st.status)) throw new Error(`job ${st.status}`);
  }
  throw new Error('timeout');
}

const mode = !jobs.length ? 'none' : a['dry-run'] || !KEY ? 'manual' : 'api';
const lines = [`# Visuals — ${spec.date}`, '', `Mode: **${mode}**${mode === 'manual' ? (KEY ? ' (dry run)' : ' (no HF_KEY — paste these prompts in higgsfield.ai, save images to ./images/ and set bg_image/cover_image in carousel.json, then re-render)') : ''}`, `Model: ${MODEL}`, ''];
let generated = 0;
for (const job of jobs) {
  let result = 'manual';
  if (mode === 'api') {
    try {
      job.target[job.key] = await generate(job);
      result = `generated → ${job.target[job.key]}`;
      generated++;
    } catch (e) {
      result = `API error (${e.message}) → manual`;
    }
  }
  lines.push(`## ${job.name} (${job.ratio})`, '```', `${job.prompt}. ${STYLE}`, '```', `Status: ${result}`, '');
}
if (generated) writeFileSync(specPath, JSON.stringify(spec, null, 2) + '\n');
writeFileSync(join(dir, 'visuals.md'), lines.join('\n'));
console.log(`hf: mode=${mode} jobs=${jobs.length} generated=${generated} → ${join(dir, 'visuals.md')}`);
