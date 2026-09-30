---
name: trend-research
description: Find what is trending on Instagram right now (audios, reel formats, carousel formats, platform changes, SME/AI news) and translate it into ideas for Mora Design. Writes a compact research/YYYY-MM-DD.json. Use for trend research, "qué está en tendencia", or step 2 of the daily pack.
---

# Trend research

Output: `research/{date}.json` — max ~60 lines, facts only, every item with a source URL. No prose files.

## Modes
- **deep** (Mondays or no previous file): up to 10 WebSearch queries.
- **light** (other days): copy the previous file's `reel_formats`, `carousel_formats`, `platform_news`; refresh `audios` and add today's items with up to 3 queries. Set `"based_on": "<previous file>"`.

## Queries (replace {Month YYYY} and use this week's wording)
deep:
1. `trending Instagram reels audio this week {Month YYYY}`
2. `Instagram trends this week {Month YYYY}`
3. `Instagram algorithm update {Month YYYY}`
4. `Instagram carousel trends {Month YYYY}`
5. `TikTok trends this week {Month YYYY}` (arrives on Reels 1–2 weeks later)
6. `small business owner reels trend {Month YYYY}`
7. `web designer instagram content ideas {YYYY}`
8. `AI for small business news this week`
9. `Google Business Profile update {Month YYYY}`
10. `KMU Schweiz Digitalisierung {YYYY}` or `Swiss small business online booking {YYYY}`
light: 1, 2, and one of 8/9/10 (rotate).

Use WebSearch result summaries. WebFetch only if a page is essential; if the proxy says EGRESS_BLOCKED, stop fetching for the day.
Prefer sources dated within the last 7 days (socialbee, buffer, metricool, later, newengen, creators.instagram.com, socialmediatoday, techcrunch).

## Schema
```json
{
  "date": "YYYY-MM-DD", "mode": "deep|light", "based_on": null,
  "audios": [{ "name": "", "artist": "", "vibe": "", "adapt": "how an SME-website reel would use it", "source": "url" }],
  "reel_formats": [{ "name": "", "how": "", "adapt": "Mora Design version", "source": "url" }],
  "carousel_formats": [{ "name": "", "why": "", "adapt": "", "source": "url" }],
  "platform_news": [{ "item": "", "impact": "what to change in our posts", "source": "url" }],
  "industry_hooks": [{ "topic": "", "angle": "hook for salon/physio/trades owners", "source": "url" }],
  "ideas": ["trend → pillar → one-line post idea"]
}
```
Limits: audios 4–8, reel_formats 3–6, carousel_formats 2–4, platform_news ≤ 4, industry_hooks ≤ 4, ideas 5.
Skip anything unsafe for the brand (explicit, political, tragedy, mocking people). Audio names must be real (copied from sources), never invented.
