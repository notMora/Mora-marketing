# Mora Design — Instagram content system

Private marketing workspace for Jordi Mora / Mora Design (@jordimoradesign, moradesign.shop). It produces a daily, trend-based, sales-focused Instagram pack. **It is not the website.**

## Hard rules
- Never modify the website repo (`notMora/jordi-web`) or anything that is deployed. This repo is never deployed.
- Published content is in **English**; notes for Jordi are in Spanish.
- Never invent clients, results, testimonials, prices or scarcity (see `brand/brand-kit.md` → Proof rules).
- Never commit secrets. Higgsfield credentials come only from env vars `HF_KEY` or `HF_API_KEY` + `HF_API_SECRET`.
- Keep token use low: scripts do layout/links/QA; subagents on haiku/sonnet do research/writing; read only the files a step lists.

## Commands
| Need | Do |
|---|---|
| Today's pack ("genera el pack de hoy") | follow `.claude/skills/daily-pack/SKILL.md` |
| Trend research only | `.claude/skills/trend-research/SKILL.md` |
| A carousel / reel on a given topic | `.claude/skills/carousel/SKILL.md`, `.claude/skills/reel-script/SKILL.md` |
| Weekly review | `.claude/skills/weekly-review/SKILL.md` |
| Today's slot | `node tools/plan.mjs [--date YYYY-MM-DD]` |
| Render slides | `node tools/render.mjs output/<date>/carousel.json` |
| Higgsfield images | `node tools/hf.mjs output/<date>/carousel.json [--dry-run]` |
| Tracked link | `node tools/utm.mjs <path|cal> --medium social|bio|story|dm --format x --slug y` |
| QA | `node tools/check.mjs output/<date>` |
| History | `node tools/log.mjs recent [n]` · `node tools/log.mjs add output/<date>` |

Tools need only Node 22 and the globally installed `playwright` + Chromium (present in Claude Code cloud images).

## Map
- `brand/` identity, voice, offer, proof rules, fonts/assets
- `strategy/` funnel, pillars, `calendar.json` (weekly grid + rotations), hooks & CTAs, profile setup, learnings
- `.claude/skills/` procedures · `.claude/agents/` subagent briefs (trend-scout=haiku, copywriter=sonnet, analyst=sonnet). In sessions where these agents are not registered, spawn `general-purpose` with the listed model and "Read .claude/agents/<name>.md and follow it".
- `research/` daily trend JSON · `output/<date>/` carousel.json, pack.md, slides/*.png, visuals.md · `data/` content log + weekly metrics
