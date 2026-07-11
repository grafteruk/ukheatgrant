# ukheatgrant

Lead-gen site for the UK Boiler Upgrade Scheme (£7,500 heat pump grant) at
ukheatpumpgrant.co.uk. Cloudflare Worker (static assets + `src/worker.js`):
eligibility quiz → lead capture to KV (`LEADS`, 90-day TTL) → branded
confirmation + lead-notification emails via Cloudflare Email Sending.

## Consent-wording cutover — 11 July 2026

Leads captured **before 11 July 2026** consented to their details being passed
to **Kairi Heating Solutions specifically** — those leads must not be re-routed
to any other installer.

From 11 July 2026 the form consent reads "a vetted, MCS-certified heat pump
installer" (singular), with the privacy policy naming the current partner for
transparency. Leads from this date onward may be routed to whichever single
vetted MCS-certified installer we currently partner with.

## Tests

`node test/grade.test.mjs` — lead-grading rubric (extracted from index.html).
