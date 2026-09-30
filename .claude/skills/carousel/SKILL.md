---
name: carousel
description: Write and render an on-brand Mora Design Instagram carousel (carousel.json → 1080×1350 PNGs). Use for any carousel/post request or step 3–4 of the daily pack.
---

# Carousel

Spec file: `output/{date}/carousel.json`. Full working example: `tools/templates/carousel.example.json` (copy its shape).
Render: `node tools/render.mjs output/{date}/carousel.json` · QA: `node tools/check.mjs output/{date}`.

## Arc (7–9 slides)
1. `cover` — hook ≤ 9 words + `sub` promise ("Swipe →"). Kicker names the niche ("For physio practice owners").
2. Re-hook: the pain in their words (`text` or `quote`).
3–6. Value: one idea per slide (`list`, `compare`, `stat`, `steps`, `text`, `image`).
7/8. Recap or before/after (the slide people save).
Last. `cta` — keyword big, `sub` with the free offer, `risk`: "Design approved before you pay".

## Layout fields
| layout | fields | default theme |
|---|---|---|
| cover | kicker, title, highlight, sub, bg_image?, image_prompt? | dark |
| text | kicker, title, highlight, body (≤ 40 words) | light |
| list | kicker?, title, items[≤6, ≤10 words each] | light |
| compare | title, left{label, items[]}, right{label, items[]} (left = old way, struck through) | dark |
| stat | kicker, value (short: "24/7", "3 taps", "11pm"), label, source? (required for real stats) | dark |
| quote | quote, highlight, author | light |
| steps | title, steps[{t, d}] (3–4) | light |
| image | kicker, bg_image or image_prompt, title, caption (e.g. "Concept project") | dark |
| cta | kicker, title, keyword, sub, button?, risk | lime |
Any slide: `theme` (dark/light/lime) to override; `highlight` = exact substring to mark in lime; `**text**` also highlights.
Alternate dark/light for rhythm; never 3 same-theme slides in a row.

## Copy rules
- Titles ≤ 12 words (renderer uppercases them). Plain English, owner's language, no jargon ("booking page", not "conversion funnel").
- Use numbers of time/effort, not invented results. Stats need `source`.
- Niche-specific details (physio: new-patient forms, no health data; beauty: long treatments, deposits; hair: stylist choice, walk-ins; trades: quote requests with photos, missed calls on site).
- Top-level fields: date, slug, pillar, stage, niche, service, keyword, hook_tag (from strategy/hooks.md), trend_ref, slides, caption, first_comment, hashtags (3–5), alt_text, link (SLOT.links.carousel), reels[{id, hook, hook_tag, trend, cover_title, cover_highlight, cover_image_prompt?}].

## Images (Higgsfield)
Max 2 `image_prompt`s per carousel (cover and/or one `image` slide). Describe a real-looking Swiss small-business scene, no text in image. `tools/hf.mjs` fills `bg_image` when the API is available; otherwise the slide renders typographic and prompts go to `visuals.md`. An `image` layout without an image renders only title/caption, so prefer image_prompt on the cover.
