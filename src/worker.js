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

  // Branded HTML — email-client-safe: table layout, inline styles, no external
  // assets. Matches the ukheatpumpgrant.co.uk green branding. Same content as
  // the plain-text version above (which stays as the fallback part).
  const html =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9edf0;margin:0;padding:0;">' +
      '<tr><td align="center" style="padding:12px;">' +
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E0E8E4;">' +
          '<tr><td style="background:#1A6B3C;padding:28px 32px;">' +
            '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:23px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">UK Heat Pump Grant</div>' +
            '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.72);letter-spacing:0.1em;text-transform:uppercase;margin-top:5px;">Enquiry received</div>' +
          '</td></tr>' +
          '<tr><td style="height:4px;background:#2E8B57;font-size:0;line-height:0;">&nbsp;</td></tr>' +
          '<tr><td style="padding:32px 32px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1A1A1A;">' +
            '<p style="margin:0 0 16px;">' + esc(greeting) + '</p>' +
            '<p style="margin:0 0 16px;">Thank you for your enquiry through <a href="https://ukheatpumpgrant.co.uk" style="color:#1A6B3C;font-weight:600;text-decoration:none;">ukheatpumpgrant.co.uk</a>.</p>' +
            '<p style="margin:0 0 16px;">Your details have been passed to <strong>Kairi Heating Solutions</strong>, our vetted MCS-certified installation partner. A member of their team will contact you shortly to discuss your enquiry, check your eligibility for available grants, and talk through the next steps.</p>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;">' +
              '<tr><td style="background:#F0F7F3;border-left:4px solid #2E8B57;border-radius:6px;padding:14px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#1A4A2E;">' +
                'Kairi Heating Solutions is a fully MCS-certified heat pump installer — the certification required to access government grant funding.' +
              '</td></tr>' +
            '</table>' +
            '<p style="margin:0 0 20px;">If you have any questions in the meantime, just reply to this email.</p>' +
            '<p style="margin:0;">Best regards,<br><strong>The team at ukheatpumpgrant.co.uk</strong></p>' +
          '</td></tr>' +
          '<tr><td style="background:#0F3D25;padding:22px 32px;font-family:Arial,Helvetica,sans-serif;">' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.9);font-weight:700;margin-bottom:7px;">UK Heat Pump Grant</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7;">' +
              'Operated by GrafterUK Ltd &middot; Registered in England &amp; Wales, Company No. 17303977<br>' +
              'Contact: <a href="mailto:info@ukheatpumpgrant.co.uk" style="color:rgba(255,255,255,0.78);text-decoration:none;">info@ukheatpumpgrant.co.uk</a><br>' +
              'This email is not affiliated with the UK Government. We connect homeowners with MCS-certified installers.' +
            '</div>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr>' +
    '</table>';

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
