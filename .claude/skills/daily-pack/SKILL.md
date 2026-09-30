---
name: daily-pack
description: Generate today's Instagram content pack for Mora Design (trend research → carousel PNGs → 2 reel scripts → stories → DM reply), check it, log it, push it and send it to the user. Use for "genera el pack de hoy", "daily pack", the scheduled routine, or any request for today's Instagram content.
---

# Daily pack (orchestrator)

You coordinate; cheap subagents write. Do not read web pages or long files yourself. Work from the repo root (the folder holding this repo's CLAUDE.md, e.g. `/home/user/Mora-marketing` or `/home/user/mora-marketing`; `git rev-parse --show-toplevel`) and start every subagent prompt with "Repo root: <absolute path> (use absolute paths)." — subagents may start in another directory.

## 1. Slot
```bash
git pull -q || true
node tools/plan.mjs            # add --date YYYY-MM-DD to backfill
```
Keep the JSON (call it SLOT). It holds pillar, stage, niche, service, keyword, links, `deep_research`, `latest_research`, `out_dir`, `recent` (history for dedupe).
If `output/<date>/pack.md` already exists and `check.mjs` passes → skip to step 6 (never generate twice).

## 2. Trends
Spawn one Agent: `subagent_type: general-purpose`, `model: haiku`, prompt:
> Read .claude/agents/trend-scout.md and follow it. Mode: {deep if SLOT.deep_research else light}. Date: {date}. Previous file: {SLOT.latest_research}. Write research/{date}.json and reply only "done" or the error.

If spawning fails, do the light procedure of `.claude/skills/trend-research/SKILL.md` inline (≤ 3 WebSearch).

## 3. Write
Spawn one Agent: `subagent_type: general-purpose`, `model: sonnet`, prompt:
> Read .claude/agents/copywriter.md and follow it. SLOT: {SLOT JSON}. Research: research/{date}.json. Write {out_dir}/carousel.json and {out_dir}/pack.md. Reply only with the cover hook and the two reel hooks.

## 4. Visuals + render + QA
```bash
node tools/hf.mjs {out_dir}/carousel.json      # API if HF_KEY, else visuals.md with prompts
node tools/render.mjs {out_dir}/carousel.json  # exit 2 = text overflow → shorten that slide
node tools/check.mjs {out_dir}
```
Fix errors with small Edits yourself (shorten text, add keyword, fix link). Only if the pack is structurally wrong, re-prompt the copywriter once with the error lines. Re-run render + check until ✓. Warnings: fix if cheap.
Optional visual spot-check: read `slides/01.png` and the CTA slide only.

## 5. Weekly (only if weekday is `mon`)
Spawn Agent `general-purpose`, `model: sonnet`: "Read .claude/agents/analyst.md and follow it for the week ending {date}." It updates `strategy/learnings.md` and writes `{out_dir}/weekly-report.md`.

## 6. Log, commit, deliver
```bash
node tools/log.mjs add {out_dir}
git config user.name "Jordi Mora"; git config user.email "325608019+notMora@users.noreply.github.com"  # GitHub blocks the private email
git add -A && git commit -qm "content: pack {date} ({pillar}/{niche})" && git push -q origin HEAD:main
```
(If push is refused, push to the session's own branch and say so.)
Then send the user (SendUserFile, status `proactive`): all `{out_dir}/slides/*.png` + `{out_dir}/pack.md` (+ weekly-report.md on Mondays), caption in Spanish: "Pack de hoy: {pillar} · {niche} · keyword {KEYWORD}".
Final message (Spanish, ≤ 6 lines): cover hook, reel hooks, trend used, anything the user must do (e.g. HF manual prompts, metrics missing).
