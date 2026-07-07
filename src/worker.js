/*
  Cloudflare Worker for ukheatpumpgrant.co.uk
  ---------------------------------------------------------------------------
  - Serves the existing static site unchanged, via the ASSETS binding.
  - Adds ONE endpoint, POST /api/confirm, which sends the enquirer their
    confirmation email through the Resend API. It is called ONLY by the main
    lead form on a successful submit (the "just researching" signup never
    calls it). Web3Forms still emails the lead to us as before — this Worker
    only handles the enquirer's confirmation, in parallel.

  Secrets (set with `wrangler secret put`, never in code / never committed):
    - RESEND_API_KEY      (required) Resend API key.
    - RECAPTCHA_SECRET    (optional) if set, /api/confirm verifies the form's
                          reCAPTCHA v3 token before sending — anti-abuse.
*/

const SENDER = 'UK Heat Pump Grant <info@ukheatpumpgrant.co.uk>';
const REPLY_TO = 'info@ukheatpumpgrant.co.uk';
const SUBJECT = 'Thanks for your heat pump enquiry — Kairi Heating Solutions will be in touch';

function buildBody(name) {
  const clean = (name || '').trim();
  const greeting = clean ? 'Hi ' + clean + ',' : 'Hi there,';

  const text = [
    greeting,
    '',
    'Thank you for your enquiry through ukheatpumpgrant.co.uk.',
    '',
    'Your details have been passed to Kairi Heating Solutions, our vetted MCS-certified installation partner. A member of their team will contact you shortly to discuss your enquiry, check your eligibility for available grants, and talk through the next steps.',
    '',
    'Kairi Heating Solutions is a fully MCS-certified heat pump installer — the certification required to access government grant funding.',
    '',
    'If you have any questions in the meantime, just reply to this email.',
    '',
    'Best regards,',
    'The team at ukheatpumpgrant.co.uk'
  ].join('\n');

  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html =
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;">' +
    '<p>' + esc(greeting) + '</p>' +
    '<p>Thank you for your enquiry through ukheatpumpgrant.co.uk.</p>' +
    '<p>Your details have been passed to <strong>Kairi Heating Solutions</strong>, our vetted MCS-certified installation partner. A member of their team will contact you shortly to discuss your enquiry, check your eligibility for available grants, and talk through the next steps.</p>' +
    '<p>Kairi Heating Solutions is a fully MCS-certified heat pump installer — the certification required to access government grant funding.</p>' +
    '<p>If you have any questions in the meantime, just reply to this email.</p>' +
    '<p>Best regards,<br>The team at ukheatpumpgrant.co.uk</p>' +
    '</div>';

  return { text, html };
}

function isValidEmail(e) {
  return typeof e === 'string' && e.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

async function verifyRecaptcha(token, secret, ip) {
  try {
    const params = new URLSearchParams({ secret, response: token || '' });
    if (ip) params.set('remoteip', ip);
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const j = await r.json();
    // reCAPTCHA v3: require success and a non-bot score.
    return j.success === true && (typeof j.score !== 'number' || j.score >= 0.5);
  } catch (e) {
    return false;
  }
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
  });
}

async function handleConfirm(request, env) {
  let data;
  try { data = await request.json(); }
  catch (e) { return json({ ok: false, error: 'bad_request' }, 400); }

  const email = data && data.email;
  const name = (data && data.name) || '';
  if (!isValidEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400);

  // Optional anti-abuse: verify the form's reCAPTCHA token when a secret is set.
  if (env.RECAPTCHA_SECRET) {
    const ok = await verifyRecaptcha(
      data.recaptcha_token, env.RECAPTCHA_SECRET, request.headers.get('CF-Connecting-IP'));
    if (!ok) return json({ ok: false, error: 'verification_failed' }, 403);
  }

  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'not_configured' }, 503);

  const { text, html } = buildBody(name);
  let resp;
  try {
    resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + env.RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: SENDER,
        to: [email],
        reply_to: REPLY_TO,
        subject: SUBJECT,
        text: text,
        html: html
      })
    });
  } catch (e) {
    return json({ ok: false, error: 'send_failed' }, 502);
  }

  if (!resp.ok) {
    // Log status only — never echo Resend's response (avoid leaking anything).
    console.warn('[confirm-email] Resend returned status', resp.status);
    return json({ ok: false, error: 'send_rejected' }, 502);
  }
  return json({ ok: true }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/confirm') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
      return handleConfirm(request, env);
    }
    // Everything else: serve the static site exactly as before.
    return env.ASSETS.fetch(request);
  }
};
