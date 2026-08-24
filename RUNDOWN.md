# UK Heat Pump Grant — rundown
_Last updated: 2026-08-24_

## What it is
A lead-generation site for the UK Boiler Upgrade Scheme (the £7,500 heat pump grant, £9,000
for oil/LPG) at **ukheatpumpgrant.co.uk**. Homeowners run an eligibility quiz; qualifying
leads are captured, graded, and passed to a vetted MCS-certified installer. Revenue is
per-lead, tracked in a billing ledger.

## How it works
Cloudflare Worker serving static assets plus `src/worker.js` (~610 lines). Same estate
pattern as quashed and polishedpages-site.

- Multi-step eligibility quiz in the static pages.
- `POST` → **write the lead to KV first, then attempt email.** Durable capture before
  notification, so a mail failure can't lose a lead. This was a deliberate fix (`1380847`)
  after Web3Forms was removed entirely (`1c61a37`) — leads now come only from Cloudflare.
- Lead **grading is recomputed server-side** (`b3f122b`). The client sends a `lead_grade`
  but it's ignored, because a client-supplied grade is spoofable and grade drives billing value.
- Branded confirmation email to the homeowner + notification email to the operator, via
  Cloudflare Email Sending (`EMAIL` binding).
- `src/guide.js` — the lead magnet, delivered behind a **signed** `/guide` magic link rather
  than a public URL, linked from both confirmation emails.
- API hardening (`c233805`): Origin allowlist, per-IP hourly rate limit, reCAPTCHA
  **fail-closed**.
- Billing ledger (`b8e6ec9`-era, `b8ebe05`): **no TTL** — billing records are permanent
  business history, unlike raw leads. CSV export and a read-only `/admin`.
- Cookie consent implementing **Consent Mode v2** (`4180d09`).
- Content/SEO layer: blog with three fact-checked 2026 guides, pillar pages, sitemap,
  robots, FAQ schema.

**The KV namespace (`LEADS`, id `4183…`) is shared with quashed**, and the quashed worker's
daily digest cron covers *both* sites. That's why there's no cron in this repo's wrangler
config — the reporting lives next door.

Raw leads carry a 90-day TTL as a retention backstop, disclosed in the privacy policy.

## What it does today
- Runs the eligibility quiz and captures qualifying leads durably to KV.
- Grades leads A/B/C server-side and records conversion value by grade.
- Sends branded confirmation + operator notification emails.
- Delivers the guide behind a signed magic link.
- Rate-limits, origin-checks and CAPTCHA-gates the API, fail-closed.
- Cookie banner with Consent Mode v2.
- Read-only `/admin` over the billing ledger, with CSV export.
- Multi-page SEO content with corrected 2026 BUS facts including the £9,000 oil/LPG uplift.

## Current state
**Live and running.** https://ukheatpumpgrant.co.uk — verified 200 on 2026-08-24.

- Tests: `node test/grade.test.mjs` — **all grading tests pass** (6 cases plus an urgency
  invariant sweep), re-run and verified 2026-08-24. That is the *only* test suite here; the
  capture, email, admin and billing paths have **no automated tests**. Compare
  polishedpages-site's 17 failure-path tests for the same shape of endpoint — this repo is
  the weaker one.
- Working tree clean, in sync with `origin/main`. Last commit 2026-07-28 (ICO number).
- Search Console: verified in Google (sitemap Success, 11 pages) and imported into Bing.

## Legal/consent detail that must not be lost
**Leads captured before 11 July 2026 consented to their details going to Kairi Heating
Solutions specifically — those leads must not be re-routed to any other installer.** From
11 July 2026 the form consent reads "a vetted, MCS-certified heat pump installer"
(singular), with the privacy policy naming the current partner for transparency. Leads from
that date onward may go to whichever single vetted MCS-certified installer is the current
partner. Getting this wrong is a UK-GDPR breach, not a business inconvenience.

## What's next
1. **Add failure-path tests for the capture endpoint** — KV fails / email fails / both fail /
   bad origin / rate limit / CAPTCHA fails. The pattern is already written next door in
   `polishedpages-site/test/enquire.test.mjs`; copy it.
2. Watch the billing ledger and conversion-by-grade data — the grading rubric was tuned by
   hand and should be re-tuned against which grades actually convert for the installer.
3. Keep the BUS facts current. Grant amounts and scheme rules change; the blog and pillar
   pages state specific 2026 figures.
4. Confirm the installer partner relationship is still current before routing more leads.

## Gotchas
- **Shared KV with quashed.** Key prefixes are the only separation. A cleanup script that
  doesn't filter by prefix will destroy the other product's data. Nothing in this repo's
  tests asserts the prefix (polishedpages-site learned this lesson the hard way and added
  the assertion — this repo hasn't).
- **No cron in this repo.** The daily digest that reports on these leads runs on the
  *quashed* worker at 07:00 UTC. If you're wondering why the reporting stopped, look there.
- Billing-ledger entries have **no TTL** by design; raw leads expire at 90 days. Don't
  "tidy up" by adding a TTL to the ledger.
- reCAPTCHA fails closed — a missing or rotated secret silently kills all lead capture.
- No `package.json`. Tests run with bare `node`; deploys with `npx wrangler deploy`. On this
  machine prefix wrangler calls with `export NPM_CONFIG_CACHE=/tmp/npm-cache-pp`, and note
  the `.assetsignore` gotcha — `assets.directory` is `"."`, so the repo root is the web root
  and anything added here is publicly served unless excluded.
- The 11 July 2026 consent cutover above. Read it before touching lead routing.
