# Funnel — from organic reach to paid project

Goal metric is **booked discovery calls**, not followers. Every piece of content has one job in this chain:

```
REEL (reach, non-followers)  ──►  PROFILE VISIT  ──►  LINK IN BIO / DM keyword  ──►  NICHE PAGE (UTM)  ──►  CAL.COM CALL or FORM  ──►  QUOTE  ──►  SALE
   TOFU                         CAROUSEL + PINNED     STORIES (daily)              moradesign.shop          20-min call               design approved → 50% / 50%
                                (trust, saves)        BOFU
```

## Stage jobs
| Stage | Format | Job | Main KPI |
|---|---|---|---|
| TOFU | Reels (trend-adapted, 7–25 s) | Stop the scroll of an SME owner, make them feel a money/time pain | reach from non-followers, 3-s hold, shares |
| MOFU | Carousels (7–9 slides), educational/demo reels | Prove Jordi understands their business and can fix it | saves, shares, profile visits |
| BOFU | Stories (daily), offer carousels, DM keyword | Turn warm viewers into conversations and calls | link clicks, DMs, calls booked |

## Weekly mix
~40% TOFU · 35% MOFU · 25% BOFU. Every post (even TOFU) ends with a soft next step; BOFU posts end with a hard CTA + risk reversal.

## DM keyword engine (main lead capture on Instagram)
1. Post CTA: "Comment **AUDIT** (or the keyword of the day) and I'll send you a free 3-minute video review of your website."
2. Reply to the comment publicly ("Sent you a DM 👀") → boosts engagement.
3. DM template (in `output/<date>/pack.md`): thank → ask for website/Instagram link + business type → promise the Loom review within 24 h.
4. Send a 3-min Loom: 3 quick wins + 1 big leak. End: "Want me to fix it? Here's a 20-min slot: <cal.com UTM link>. Design approved before you pay."
5. No website? Offer a free concept homepage idea instead (keyword **CONCEPT**).
Keywords rotate: AUDIT, BOOKING, AI, CONCEPT, WEBSITE. (Can be automated later with ManyChat; the templates are ready for it.)

## Tracking (no website changes needed)
- All links built with `node tools/utm.mjs` → `utm_source=instagram&utm_medium=social|bio|story|dm&utm_campaign=ig_<yyyymmdd>_<format>_<slug>`.
- Bio link: `https://moradesign.shop/?utm_source=instagram&utm_medium=bio&utm_campaign=ig_bio`.
- GA4 (consent-only) shows UTMs under Acquisition → Traffic acquisition; `generate_lead` events = bookings/forms. Formspree + Cal.com show real leads — log them weekly in `data/metrics.csv` (column `source_post` when the lead says where they came from; ask "How did you find me?" on every call).
