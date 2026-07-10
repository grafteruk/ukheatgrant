/*
  Cloudflare Worker for ukheatpumpgrant.co.uk
  ---------------------------------------------------------------------------
  - Serves the existing static site unchanged, via the ASSETS binding.
  - POST /api/confirm sends TWO emails via Cloudflare Email Sending (env.EMAIL):
    the enquirer's branded confirmation and the internal lead notification. Called
    only by the main lead form on a successful submit. Web3Forms still emails the
    lead to us as before, in parallel (belt-and-braces on a live revenue site).

  Binding: EMAIL (send_email) — domain ukheatpumpgrant.co.uk onboarded to Email
  Sending. No email API keys. (Migrated off Resend — CF native sending, 2026.)
  Secrets (wrangler secret put, never in code):
    - RECAPTCHA_SECRET    (optional) if set, /api/confirm verifies the form's
                          reCAPTCHA v3 token before sending — anti-abuse.
*/

const SENDER = 'UK Heat Pump Grant <info@ukheatpumpgrant.co.uk>';
const REPLY_TO = 'info@ukheatpumpgrant.co.uk';
const SUBJECT = 'Thanks for your heat pump enquiry — Kairi Heating Solutions will be in touch';

// Internal lead-notification recipient (fixed — this is us, not the enquirer).
const NOTIFY_TO = 'info@ukheatpumpgrant.co.uk';

// Maps raw quiz answer codes to human-readable labels for the notification.
const LABELS = {
  ownership: { yes: 'Yes — owns their home', no: 'No — rents' },
  region: { yes: 'England or Wales', no: 'Scotland or Northern Ireland' },
  heating: { 'gas': 'Gas boiler', 'oil': 'Oil boiler', 'lpg': 'LPG boiler', 'electric': 'Electric heating', 'heat-pump': 'Already has a heat pump' },
  property: { 'detached': 'Detached house', 'semi-detached': 'Semi-detached house', 'terraced': 'Terraced house', 'bungalow': 'Bungalow' },
  timeline: { 'within-3-months': 'Within 3 months', '3-6-months': '3–6 months', '6-12-months': '6–12 months', 'researching': 'Just researching' }
};

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

// One send via Cloudflare Email Sending (native env.EMAIL binding — no API key).
// Same branded templates; only the transport changes. Throws on error so callers
// can treat each send independently, exactly like resendSend did.
async function sendMail(env, msg) {
  const m = /<([^>]+)>/.exec(SENDER);
  const fromEmail = (m ? m[1] : SENDER).trim();
  const fromName = SENDER.replace(/<[^>]*>/, '').trim() || undefined;
  const res = await env.EMAIL.send({
    to: msg.to,
    from: { email: fromEmail, name: fromName },
    replyTo: msg.replyTo || REPLY_TO,
    subject: msg.subject,
    text: msg.text,
    html: msg.html
  });
  if (res && Array.isArray(res.permanent_bounces) && res.permanent_bounces.length &&
      !(Array.isArray(res.delivered) && res.delivered.length) &&
      !(Array.isArray(res.queued) && res.queued.length)) {
    throw new Error('cf_email_bounced');
  }
  return true;
}

// Branded internal lead notification — built from the full form payload.
function buildNotification(lead) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lab = (map, v) => (v && map[v]) ? map[v] : (v ? v : '—');

  const fullName = ((lead.first_name || '').trim() + ' ' + (lead.last_name || '').trim()).trim() || 'New lead';
  const email = (lead.email || '').trim();
  const phoneRaw = (lead.phone || '').trim();
  const phoneTel = phoneRaw.replace(/[^\d+]/g, '');
  const postcode = (lead.postcode || '').trim().toUpperCase() || '—';
  const grade = (lead.lead_grade || '').trim() || '—';
  const ownership = lab(LABELS.ownership, lead.ownership);
  const region = lab(LABELS.region, lead.region);
  const heating = lab(LABELS.heating, lead.heating_system);
  const property = lab(LABELS.property, lead.property_type);
  const timeline = lab(LABELS.timeline, lead.timeline);
  const consent = (lead.consent === 'yes' || lead.consent === true) ? 'Given (ticked on submit)' : 'Not recorded';

  let submitted;
  try {
    submitted = new Date().toLocaleString('en-GB', {
      timeZone: 'Europe/London', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }) + ' (UK time)';
  } catch (e) { submitted = new Date().toUTCString(); }

  const gradeBg = { A: '#1A6B3C', B: '#B8860B', C: '#5d6f80' }[grade] || '#5d6f80';
  const subject = 'New Heat Pump Grant Lead — ' + fullName;

  const text = [
    'New Heat Pump Grant Lead', '',
    'Name:        ' + fullName,
    'Phone:       ' + (phoneRaw || '—'),
    'Email:       ' + (email || '—'),
    'Postcode:    ' + postcode,
    'Lead grade:  ' + grade, '',
    'Homeowner:       ' + ownership,
    'Region:          ' + region,
    'Current heating: ' + heating,
    'Property type:   ' + property,
    'Timeline:        ' + timeline,
    'Consent:         ' + consent,
    'Submitted:       ' + submitted,
    'Source:          ukheatpumpgrant.co.uk — main eligibility form', '',
    'Sent alongside your Web3Forms notification during the parallel-running period.'
  ].join('\n');

  const row = (l, v) => '<tr><td style="padding:10px 14px;background:#FAFAF8;color:#5d6f80;width:42%;border-bottom:1px solid #EEF2F0;">' + esc(l) + '</td><td style="padding:10px 14px;color:#1A1A1A;font-weight:600;border-bottom:1px solid #EEF2F0;">' + esc(v) + '</td></tr>';
  const rowLast = (l, v) => '<tr><td style="padding:10px 14px;background:#FAFAF8;color:#5d6f80;width:42%;">' + esc(l) + '</td><td style="padding:10px 14px;color:#1A1A1A;font-weight:600;">' + esc(v) + '</td></tr>';

  const html =
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9edf0;margin:0;padding:0;">' +
      '<tr><td align="center" style="padding:12px;">' +
        '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E0E8E4;">' +
          '<tr><td style="background:#1A6B3C;padding:26px 32px;">' +
            '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:23px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">UK Heat Pump Grant</div>' +
            '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.72);letter-spacing:0.1em;text-transform:uppercase;margin-top:5px;">New lead notification</div>' +
          '</td></tr>' +
          '<tr><td style="height:4px;background:#2E8B57;font-size:0;line-height:0;">&nbsp;</td></tr>' +
          '<tr><td style="padding:24px 32px 8px;font-family:Arial,Helvetica,sans-serif;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
              '<td style="vertical-align:middle;">' +
                '<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:22px;font-weight:700;color:#1A1A1A;line-height:1.2;">' + esc(fullName) + '</div>' +
                '<div style="font-size:12px;color:#777;margin-top:3px;">New enquiry via the main eligibility form</div>' +
              '</td>' +
              '<td style="vertical-align:middle;text-align:right;white-space:nowrap;">' +
                '<span style="display:inline-block;background:' + gradeBg + ';color:#fff;font-size:12px;font-weight:700;letter-spacing:0.03em;padding:6px 12px;border-radius:100px;">GRADE ' + esc(grade) + '</span>' +
              '</td>' +
            '</tr></table>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;background:#F0F7F3;border:1px solid #D4EBE0;border-radius:8px;"><tr>' +
              '<td style="padding:14px 16px;border-right:1px solid #D4EBE0;width:50%;">' +
                '<div style="font-size:10px;color:#5d6f80;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">Phone</div>' +
                '<a href="tel:' + esc(phoneTel) + '" style="font-size:18px;font-weight:700;color:#1A6B3C;text-decoration:none;">' + esc(phoneRaw || '—') + '</a>' +
              '</td>' +
              '<td style="padding:14px 16px;width:50%;">' +
                '<div style="font-size:10px;color:#5d6f80;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;">Email</div>' +
                '<a href="mailto:' + esc(email) + '" style="font-size:14px;font-weight:600;color:#1A6B3C;text-decoration:none;word-break:break-all;">' + esc(email || '—') + '</a>' +
              '</td>' +
            '</tr></table>' +
          '</td></tr>' +
          '<tr><td style="padding:16px 32px 8px;font-family:Arial,Helvetica,sans-serif;">' +
            '<div style="font-size:11px;color:#5d6f80;text-transform:uppercase;letter-spacing:0.09em;font-weight:700;margin-bottom:6px;">Lead details</div>' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E0E8E4;border-radius:8px;overflow:hidden;font-size:14px;">' +
              row('Postcode', postcode) +
              row('Homeowner', ownership) +
              row('Region', region) +
              row('Current heating', heating) +
              row('Property type', property) +
              row('Timeline', timeline) +
              row('Lead grade', grade) +
              row('Consent', consent) +
              row('Submitted', submitted) +
              rowLast('Source', 'ukheatpumpgrant.co.uk — main eligibility form') +
            '</table>' +
          '</td></tr>' +
          '<tr><td style="padding:14px 32px 26px;font-family:Arial,Helvetica,sans-serif;">' +
            '<div style="font-size:12px;color:#777;">Sent alongside your Web3Forms notification during the parallel-running period.</div>' +
          '</td></tr>' +
          '<tr><td style="background:#0F3D25;padding:20px 32px;font-family:Arial,Helvetica,sans-serif;">' +
            '<div style="font-size:13px;color:rgba(255,255,255,0.9);font-weight:700;margin-bottom:7px;">UK Heat Pump Grant</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7;">' +
              'Operated by GrafterUK Ltd &middot; Registered in England &amp; Wales, Company No. 17303977<br>' +
              'Internal lead notification &middot; Contact: <a href="mailto:info@ukheatpumpgrant.co.uk" style="color:rgba(255,255,255,0.78);text-decoration:none;">info@ukheatpumpgrant.co.uk</a>' +
            '</div>' +
          '</td></tr>' +
        '</table>' +
      '</td></tr>' +
    '</table>';

  return { subject, text, html };
}

async function handleConfirm(request, env) {
  let data;
  try { data = await request.json(); }
  catch (e) { return json({ ok: false, error: 'bad_request' }, 400); }

  const email = data && data.email;
  const name = (data && (data.name || data.first_name)) || '';
  if (!isValidEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400);

  // Optional anti-abuse: verify the form's reCAPTCHA token when a secret is set.
  if (env.RECAPTCHA_SECRET) {
    const ok = await verifyRecaptcha(
      data.recaptcha_token, env.RECAPTCHA_SECRET, request.headers.get('CF-Connecting-IP'));
    if (!ok) return json({ ok: false, error: 'verification_failed' }, 403);
  }

  // Two independent sends via Cloudflare Email Sending: the enquirer confirmation
  // and the internal lead notification to us. allSettled → a failure in one never
  // blocks the other, and Web3Forms is a separate client-side path, unaffected.
  const confirmation = buildBody(name);
  const notification = buildNotification(data);
  const [confRes, notifRes] = await Promise.allSettled([
    sendMail(env, { to: email, subject: SUBJECT, text: confirmation.text, html: confirmation.html, replyTo: REPLY_TO, tag: 'confirm-email' }),
    // Reply-To = info@ (leads go to Ben/Kairi; we don't reply to customers directly).
    sendMail(env, { to: NOTIFY_TO, subject: notification.subject, text: notification.text, html: notification.html, replyTo: REPLY_TO, tag: 'lead-notify' })
  ]);

  // ok reflects the LEAD notification (the capture that must not be lost — Web3Forms
  // is gone, so this is the only path). The customer confirmation is best-effort.
  const st = (r) => r.status === 'fulfilled' ? 'sent' : 'failed';
  return json({ ok: notifRes.status === 'fulfilled', confirmation: st(confRes), notification: st(notifRes) }, 200);
}

// Green-branded shell for the lightweight "just researching" guide signup emails.
function greenShell(label, inner) {
  return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9edf0;margin:0;padding:0;">' +
    '<tr><td align="center" style="padding:12px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #E0E8E4;">' +
    '<tr><td style="background:#1A6B3C;padding:24px 32px;"><div style="font-family:Georgia,\'Times New Roman\',serif;font-size:21px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">UK Heat Pump Grant</div>' +
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.72);letter-spacing:0.1em;text-transform:uppercase;margin-top:5px;">' + label + '</div></td></tr>' +
    '<tr><td style="height:4px;background:#2E8B57;font-size:0;line-height:0;">&nbsp;</td></tr>' +
    '<tr><td style="padding:26px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#1A1A1A;">' + inner + '</td></tr>' +
    '<tr><td style="background:#0F3D25;padding:18px 32px;font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(255,255,255,0.55);line-height:1.7;">Operated by GrafterUK Ltd &middot; Company No. 17303977 &middot; <a href="mailto:info@ukheatpumpgrant.co.uk" style="color:rgba(255,255,255,0.78);text-decoration:none;">info@ukheatpumpgrant.co.uk</a><br>Not affiliated with the UK Government. We connect homeowners with MCS-certified installers.</td></tr>' +
    '</table></td></tr></table>';
}

async function handleResearch(request, env) {
  let d;
  try { d = await request.json(); } catch (e) { return json({ ok: false, error: 'bad_request' }, 400); }
  const email = d && d.email;
  if (!isValidEmail(email)) return json({ ok: false, error: 'invalid_email' }, 400);
  if (env.RECAPTCHA_SECRET) {
    const ok = await verifyRecaptcha(d.recaptcha_token, env.RECAPTCHA_SECRET, request.headers.get('CF-Connecting-IP'));
    if (!ok) return json({ ok: false, error: 'verification_failed' }, 403);
  }
  const notif = {
    subject: 'New guide signup — ' + email,
    text: 'New "just researching" guide signup (not a full eligibility lead).\n\nEmail: ' + email + '\nSource: ukheatpumpgrant.co.uk research signup',
    html: greenShell('New guide signup', '<p style="margin:0 0 8px;">Someone signed up for the guide (not a full eligibility lead):</p><p style="margin:0;font-size:18px;font-weight:700;"><a href="mailto:' + email + '" style="color:#1A6B3C;text-decoration:none;">' + email + '</a></p>')
  };
  const conf = {
    subject: 'Thanks for your interest — UK Heat Pump Grant',
    text: 'Hi,\n\nThanks for your interest in the heat pump grant scheme. We\'ll be in touch with useful, no-pressure information on grants and what they could mean for your home.\n\nWhen you\'re ready to check your eligibility properly, just head back to ukheatpumpgrant.co.uk.\n\nBest regards,\nThe team at ukheatpumpgrant.co.uk',
    html: greenShell('Thanks for your interest', '<p style="margin:0 0 14px;">Thanks for your interest in the heat pump grant scheme. We\'ll be in touch with useful, no-pressure information on grants and what they could mean for your home.</p><p style="margin:0 0 14px;">When you\'re ready to check your eligibility properly, just head back to <a href="https://ukheatpumpgrant.co.uk" style="color:#1A6B3C;font-weight:600;text-decoration:none;">ukheatpumpgrant.co.uk</a>.</p><p style="margin:0;">Best regards,<br><strong>The team at ukheatpumpgrant.co.uk</strong></p>')
  };
  const [n] = await Promise.allSettled([
    sendMail(env, { to: NOTIFY_TO, subject: notif.subject, text: notif.text, html: notif.html, tag: 'research-notify' }),
    sendMail(env, { to: email, subject: conf.subject, text: conf.text, html: conf.html, tag: 'research-confirm' })
  ]);
  return json({ ok: n.status === 'fulfilled' }, 200);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/confirm') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
      return handleConfirm(request, env);
    }
    if (url.pathname === '/api/research') {
      if (request.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405);
      return handleResearch(request, env);
    }
    // Everything else: serve the static site exactly as before.
    return env.ASSETS.fetch(request);
  }
};
