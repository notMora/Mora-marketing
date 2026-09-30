---
name: reel-script
description: Write Instagram Reel scripts for Mora Design that win views from non-followers and push them to the profile and a DM keyword. Use for reel ideas, guiones, hooks, or the Reel A/B sections of the daily pack.
---

# Reel scripts

Every pack has two reels, written into `pack.md` with the exact structure of `tools/templates/pack.template.md`:
- **Reel A — trend**: a real trending audio/format from today's research file, adapted to a pain of SLOT.niche. 7–15 s. TOFU.
- **Reel B — authority/demo**: screen recording, talking head or before/after concept; teaches or shows one thing. 25–45 s. MOFU/BOFU.

## What makes them get views (apply all)
1. **Hook in 1.5 s** on three layers: a moving visual, on-screen text ≤ 8 words, and the first spoken line. Pick a formula from `strategy/hooks.md` not used yesterday.
2. **Target the owner**: name the niche in the on-screen text or first line ("Salon owners…", "Physios in Zürich…").
3. **Pattern interrupt every 2–3 s** (cut, zoom, new text); no dead air; cut breaths.
4. **Captions burned in**, big, centered, inside the central 4:5 zone (top/bottom 285 px are covered by UI).
5. **Loop**: the last line/frame leads back into the first so rewatches count.
6. **Shareable**: script it so an owner would send it to another owner ("send this to…").
7. **One CTA** at the end with the keyword → DM → call. TOFU reels can use a soft CTA ("follow for one fix a day") plus keyword in caption.
8. **Trend audio**: name it exactly as in research; tell Jordi to save it from the Reels audio page; if voice-over, audio at ~10–15%.
9. Original > reposted; no watermarks from other apps; 1080×1920; 30 fps.

## Shot table
Rows of `| Time | Shot — dirección (ES) | On-screen text (EN) | Voice (EN) |`. Directions in Spanish so Jordi can film fast; everything the audience sees or hears in English.
Shots must be filmable by one person with a phone and a laptop in < 20 min: screen recordings of concept sites/booking flows, desk b-roll, talking head, phone POV, text-on-screen over b-roll. Higgsfield video prompts only as optional b-roll.

## Metadata
Also fill `reels` in carousel.json: `{id, hook, hook_tag, trend, cover_title (≤ 6 words), cover_highlight}` → the renderer makes `slides/reel-cover-A.png` / `-B.png` for a clean grid.
