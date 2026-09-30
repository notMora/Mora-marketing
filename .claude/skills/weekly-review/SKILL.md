---
name: weekly-review
description: Weekly performance review for Mora Design Instagram — reads data/metrics.csv and the content log, updates strategy/learnings.md and the weekly grid, and writes a Spanish report. Runs on Mondays inside the daily pack, or on request ("revisión semanal", "qué está funcionando").
---

# Weekly review

Inputs (read only these): last 4 rows of `data/metrics.csv`, `node tools/log.mjs recent 14`, `strategy/learnings.md`, `strategy/calendar.json`.

1. If the last row of metrics.csv is older than 8 days or missing: write `output/{date}/weekly-report.md` with a short Spanish reminder of which numbers to add and where to find them (Instagram Insights → Professional dashboard; Formspree dashboard; Cal.com bookings), then stop.
2. Otherwise compute week-over-week: reach, non-follower %, saves+shares per post, profile visits, link clicks, keyword comments, DMs, calls, sales. Funnel conversion: profile visits → clicks → calls → sales.
3. Diagnose the weakest step of the funnel and give 3 concrete changes (e.g. "hooks name the niche", "more BOFU stories", "CTA keyword on reel B").
4. Update `strategy/learnings.md` (≤ 40 lines; keep the format; adjust pillar weights 0.5–1.5).
5. Only if one pillar clearly under-performs for 2+ weeks: swap it in `strategy/calendar.json` `weekly_grid` (keep ≥ 2 TOFU and ≥ 2 BOFU days).
6. Report `output/{date}/weekly-report.md` in Spanish: KPIs table, what worked (post dates), what to change, next week's focus. ≤ 40 lines.
