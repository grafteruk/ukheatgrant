// The "UK Heat Pump Grant Guide 2026" — served as a branded page behind the
// signed /guide magic link (see worker.js). Kept here as editable source so the
// facts stay current: BUS rules change often (this reflects the position after
// the April 2026 amendment regulations — EPC requirement removed, scheme to 2030,
// air-to-air eligible at £2,500). Installer framing: a single vetted MCS-certified
// installer we currently refer leads to (Kairi Heating Solutions) — matches the
// site's consent wording. Operated by GrafterUK Ltd (Co. No. 17303977).
export function guideHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="robots" content="noindex, nofollow">
<title>Your Guide to the UK Heat Pump Grant</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--green:#1A6B3C;--green-light:#2E8B57;--green-pale:#F0F7F3;--green-mid:#D4EBE0;--text:#1A1A1A;--text-mid:#3d3d3d;--muted:#6b7280;--border:#E0E8E4;--wash:#FAFAF8}
  body{font-family:'DM Sans',-apple-system,Segoe UI,sans-serif;color:var(--text);background:var(--wash);line-height:1.7;-webkit-text-size-adjust:100%}
  .bar{background:var(--green);color:#fff;padding:1rem 1.5rem}
  .bar .wrap{max-width:760px;margin:0 auto;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap}
  .bar .logo{font-family:'DM Serif Display',serif;font-size:1.2rem;line-height:1.1}
  .bar .logo span{display:block;font-family:'DM Sans';font-size:.72rem;font-weight:500;color:rgba(255,255,255,.75);letter-spacing:.04em}
  .bar a.cta{background:#fff;color:var(--green);font-weight:700;font-size:.82rem;padding:.55rem 1.1rem;border-radius:7px;text-decoration:none;white-space:nowrap}
  .wrap{max-width:760px;margin:0 auto;padding:0 1.5rem}
  main{padding:2.5rem 0 1rem}
  .lede{background:#fff;border:1px solid var(--border);border-radius:14px;padding:1.6rem 1.7rem;margin-bottom:2rem}
  h1{font-family:'DM Serif Display',serif;font-size:clamp(1.9rem,5vw,2.7rem);line-height:1.12;color:var(--green);margin-bottom:.5rem}
  .sub{color:var(--muted);font-size:1rem;margin-bottom:1rem}
  h2{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--green);line-height:1.2;margin:2.4rem 0 .8rem;padding-top:.4rem}
  h3{font-size:1rem;font-weight:700;margin:1.3rem 0 .3rem;color:var(--text)}
  p{margin-bottom:1rem;color:var(--text-mid)}
  ul{margin:0 0 1rem 1.2rem}
  li{margin-bottom:.5rem;color:var(--text-mid)}
  strong{color:var(--text);font-weight:600}
  a{color:var(--green)}
  table{width:100%;border-collapse:collapse;margin:.4rem 0 1.2rem;font-size:.95rem;background:#fff;border:1px solid var(--border);border-radius:10px;overflow:hidden}
  th{background:var(--green);color:#fff;text-align:left;padding:.7rem .9rem;font-size:.9rem}
  td{padding:.65rem .9rem;border-top:1px solid var(--border);color:var(--text-mid)}
  .note{background:var(--green-pale);border-left:4px solid var(--green-light);border-radius:8px;padding:.9rem 1.1rem;margin:.4rem 0 1.2rem;font-size:.95rem}
  .note strong{color:var(--green)}
  .toc{list-style:none;margin:.4rem 0 0}
  .toc li{margin-bottom:.4rem}
  .myth{margin:0 0 1.1rem}
  .myth .q{font-weight:600;color:var(--text)}
  .cta-box{background:var(--green);color:#fff;border-radius:14px;padding:1.8rem;text-align:center;margin:2.5rem 0 1rem}
  .cta-box h2{color:#fff;margin-top:0}
  .cta-box p{color:rgba(255,255,255,.85)}
  .cta-box a{display:inline-block;background:#fff;color:var(--green);font-weight:700;padding:.85rem 1.8rem;border-radius:8px;text-decoration:none;margin-top:.4rem}
  footer{border-top:1px solid var(--border);margin-top:2rem;padding:1.6rem 0 2.5rem}
  .disclaimer{font-size:.8rem;color:var(--muted);line-height:1.6}
  @media print{.bar a.cta,.cta-box a{display:none}body{background:#fff}}
</style>
</head>
<body>
<div class="bar"><div class="wrap"><div class="logo">UK Heat Pump Grant<span>Your plain-English guide</span></div><a class="cta" href="https://ukheatpumpgrant.co.uk/#check">Check eligibility</a></div></div>
<main><div class="wrap">

  <div class="lede">
    <h1>Your Guide to the UK Heat Pump Grant</h1>
    <p class="sub">A plain-English explainer of the Boiler Upgrade Scheme — how it works, who qualifies, and what to expect.</p>
    <p style="margin-bottom:.6rem"><strong>The headline: up to £7,500 off a new heat pump.</strong></p>
    <p style="margin-bottom:0">If you own a home in England or Wales and your current heating runs on gas, oil, LPG, or electric storage heaters, you may qualify for a government grant covering most of the cost of installing a low-carbon heat pump. This guide explains how it works in plain terms — no jargon, no sales pitch.</p>
  </div>

  <h2>What's inside</h2>
  <ul class="toc">
    <li>1. What is the Boiler Upgrade Scheme?</li>
    <li>2. Who qualifies for the grant?</li>
    <li>3. How much does a heat pump actually cost?</li>
    <li>4. What's the timeline — application to install?</li>
    <li>5. Common myths and honest truths</li>
    <li>6. What to do when you're ready</li>
  </ul>

  <h2>1. What is the Boiler Upgrade Scheme?</h2>
  <p>The Boiler Upgrade Scheme (BUS) is a UK government grant programme that helps homeowners replace fossil-fuel heating systems with low-carbon alternatives. It's run by Ofgem and funded by the Department for Energy Security and Net Zero.</p>
  <p>The grant amounts are fixed by the scheme:</p>
  <table>
    <tr><th>Heating system</th><th>Grant amount</th></tr>
    <tr><td>Air source heat pump</td><td>£7,500</td></tr>
    <tr><td>Ground source heat pump</td><td>£7,500</td></tr>
    <tr><td>Air-to-air heat pump <span style="color:var(--muted)">(newly eligible in 2026)</span></td><td>£2,500</td></tr>
    <tr><td>Biomass boiler (rural only)</td><td>£5,000</td></tr>
  </table>
  <p>The grant is paid directly to your installer, not to you. That means the installer reduces the price they quote you by the grant amount, then claims the money back from Ofgem. You never have to chase the government for the money.</p>
  <div class="note"><strong>How long is it available?</strong> The scheme has been extended more than once and is currently scheduled to run until <strong>2030</strong>. However, funding is allocated in annual budgets, and a given year's pot can be used up before the year ends — so while there's no imminent cliff-edge, it's not something to leave indefinitely either.</div>

  <h2>2. Who qualifies for the grant?</h2>
  <p>There are three main eligibility tests. Your property needs to pass all three:</p>
  <h3>Location</h3>
  <p>You must be in England or Wales. Scotland has a separate scheme (Home Energy Scotland Grant) and Northern Ireland is not currently covered.</p>
  <h3>Property type</h3>
  <p>Domestic properties only — owner-occupied homes, private landlords, and small non-domestic premises. Most house types qualify: detached, semi-detached, terraced, bungalows, even some flats with sole ownership of the heating system. New-build properties are generally excluded.</p>
  <h3>Replacing fossil-fuel heating</h3>
  <p>The grant is for replacing gas, oil, LPG, or electric storage heating. If you already have a heat pump and want to upgrade, you don't qualify. If you've never had central heating (e.g. rural off-grid), you do qualify — the grant covers first-time installations.</p>
  <div class="note"><strong>Good news on EPCs (rules relaxed in 2026):</strong> You used to need a valid Energy Performance Certificate with no outstanding loft or cavity-wall insulation recommendations. <strong>That requirement was removed in April 2026</strong> — you no longer need an EPC to qualify, and your installer assesses whether your home is suitably insulated during their survey instead. Good insulation still helps a heat pump run efficiently, but it's no longer a paperwork gate.</div>
  <div class="note"><strong>Quick eligibility check:</strong> Own your home in England or Wales? Currently on gas, oil, LPG, or electric storage heaters? Then you almost certainly qualify.</div>

  <h2>3. How much does a heat pump actually cost?</h2>
  <p>This is the question that matters most, and the one that gets the most confusing answers online. Here's a plain breakdown:</p>
  <table>
    <tr><th>&nbsp;</th><th>Typical range</th><th>After £7,500 grant</th></tr>
    <tr><td>Air source (small home)</td><td>£8,000 — £11,000</td><td>£500 — £3,500</td></tr>
    <tr><td>Air source (avg home)</td><td>£11,000 — £14,000</td><td>£3,500 — £6,500</td></tr>
    <tr><td>Air source (large home)</td><td>£14,000 — £18,000</td><td>£6,500 — £10,500</td></tr>
    <tr><td>Ground source</td><td>£18,000 — £30,000</td><td>£10,500 — £22,500</td></tr>
  </table>
  <p>Why the wide range? Heat pumps are sized to your home's heat loss, which depends on insulation level, number of rooms, ceiling heights, and how warm you like things. A well-insulated 3-bed semi might need a smaller, cheaper system than a draughty 2-bed Victorian terrace. The only way to get a real price is a survey.</p>
  <h3>What's included in the price?</h3>
  <ul>
    <li>Heat pump unit (the outdoor box)</li>
    <li>Hot water cylinder (most homes need this)</li>
    <li>Pipework, controls, and electrical work</li>
    <li>Installation labour</li>
    <li>MCS certification (required for the grant)</li>
    <li>5-year warranty on most systems</li>
  </ul>
  <h3>What might cost extra?</h3>
  <ul>
    <li>Larger radiators if your current ones are too small</li>
    <li>Underfloor heating (optional, not required)</li>
    <li>Removal of old boiler and tanks</li>
    <li>Upgrading your electrical consumer unit if it's old</li>
  </ul>
  <div class="note"><strong>Running costs:</strong> A properly-sized heat pump in a well-insulated home typically costs about the same to run as a modern gas boiler — sometimes a bit more, sometimes a bit less, depending on electricity tariff and house performance. The big savings come from being on a heat-pump-friendly tariff (like Octopus Cosy or Intelligent Go) which can cut running costs by 30-50%.</div>

  <h2>4. What's the timeline — application to install?</h2>
  <p>From your first enquiry to having a working heat pump usually takes 6-12 weeks. Here's what happens at each stage:</p>
  <h3>Week 1-2: Initial enquiry and survey</h3>
  <p>You're put in touch with a vetted MCS-certified installer — currently <strong>Kairi Heating Solutions</strong>, the installer we work with. They visit your home (or do a video survey) to measure rooms, check insulation, look at current radiators and the electrical setup, and discuss your needs.</p>
  <h3>Week 2-4: Quote, design and grant application</h3>
  <p>The installer prepares a heat loss calculation and a quote. This should specify the exact heat pump model, hot water cylinder size, any radiator changes, total price, and your grant amount. Alongside the design work, your installer can submit the grant application to Ofgem at the same time — these don't have to happen in sequence. Ofgem typically approves within 2-3 weeks, so by the time the design is signed off, the grant is usually confirmed and ready. You don't fill in any government forms yourself.</p>
  <h3>Week 4-6: Installation and commissioning</h3>
  <p>Once the design and grant are confirmed, <strong>Kairi Heating Solutions</strong> will be in touch to schedule the install and walk you through what to expect on the day. The install itself usually takes 2-5 days depending on your property. The engineers remove the old boiler, install the heat pump and cylinder, run pipework, and commission the system. You'll typically be without heating for 1-2 days during the changeover. Once running, the installer programmes the controls, tests the system across a full heating cycle, and shows you how to use it. You receive MCS paperwork, warranty documents, and (if you had one) the EPC update.</p>

  <h2>5. Common myths and honest truths</h2>
  <div class="myth"><p class="q">Myth: "Heat pumps don't work in cold weather."</p><p><strong>Honest truth:</strong> Modern air source heat pumps work effectively down to about -15°C, which is colder than almost anywhere in the UK gets. Norway, Finland, and Sweden — all colder than us — have the highest heat pump adoption rates in Europe. They work fine.</p></div>
  <div class="myth"><p class="q">Myth: "You need underfloor heating."</p><p><strong>Honest truth:</strong> You don't. Heat pumps work with normal radiators. Sometimes radiators need to be slightly larger than gas-system radiators because heat pumps run at a lower water temperature, but most modern radiators are already big enough. A good installer will tell you exactly which ones might need upgrading.</p></div>
  <div class="myth"><p class="q">Myth: "They're really loud."</p><p><strong>Honest truth:</strong> Modern heat pumps run at about 40-50 decibels at 1 metre away — quieter than a dishwasher, slightly louder than a fridge. There are minimum noise distance rules in planning regulations to keep neighbours happy.</p></div>
  <div class="myth"><p class="q">Myth: "You need planning permission."</p><p><strong>Honest truth:</strong> Most installations are covered by Permitted Development rights — no planning application needed. Exceptions: listed buildings, conservation areas, and flats. Your installer will confirm whether your specific property needs planning.</p></div>
  <div class="myth"><p class="q">Myth: "They take ages to heat the house up."</p><p><strong>Honest truth:</strong> Heat pumps are designed to run more steadily than a gas boiler — keeping the house at a constant temperature rather than blasting heat in bursts. Once you adjust to this approach, the house feels more comfortable overall. The 'always-on, low-output' approach is part of why running costs stay competitive.</p></div>
  <div class="myth"><p class="q">Myth: "The grant is hard to apply for."</p><p><strong>Honest truth:</strong> You don't apply. Your installer applies on your behalf and the £7,500 is deducted from your invoice before you pay anything. It's one of the simplest government grants to access.</p></div>

  <h2>6. What to do when you're ready</h2>
  <p>If you've read this far, you're probably curious whether a heat pump makes sense for your home. The honest answer is: it depends on your specific property, but in most cases for owner-occupied homes in England and Wales currently on gas/oil/LPG, the answer is yes — especially while the £7,500 grant is available.</p>
  <h3>The sensible next steps:</h3>
  <p><strong>Check your insulation.</strong> You no longer need an EPC to qualify (that rule was dropped in 2026), but a reasonably insulated home gets the best performance and running costs from a heat pump. Loft insulation is often cheap (£300-£600) and pays back fast.</p>
  <p><strong>Ask about the heat loss calculation.</strong> A good installer will do this properly. A bad one will guess based on house size. The heat loss calc is the foundation of a working system.</p>
  <p><strong>Check tariffs.</strong> Once installed, switching to a heat-pump-optimised electricity tariff makes a big difference to running costs.</p>
  <p><strong>Don't rush.</strong> The scheme currently runs until 2030, so you have time to find the right installer and design — but annual funding pots can run out, so don't sit on it indefinitely.</p>

  <div class="cta-box">
    <h2>Ready to get a quote?</h2>
    <p>Complete our short eligibility check and we'll connect you with a vetted MCS-certified installer for a no-obligation quote. No pushy sales calls — just one conversation with someone qualified to give you a real answer.</p>
    <a href="https://ukheatpumpgrant.co.uk/#check">Check my eligibility →</a>
  </div>

  <footer>
    <p class="disclaimer">This guide is for general information only. Figures, eligibility criteria, and grant amounts are accurate as of 2026 but may change — always confirm details with an MCS-certified installer or via gov.uk before making decisions. UK Heat Pump Grant is a service of <strong>GrafterUK Ltd</strong>, registered in England &amp; Wales (Company No. 17303977), 71–75 Shelton Street, London WC2H 9JQ. We are an independent service that connects homeowners with a vetted MCS-certified installer — currently Kairi Heating Solutions — and we are not affiliated with the UK Government.</p>
  </footer>

</div></main>
</body>
</html>`;
}
