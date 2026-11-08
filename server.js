'use strict';
// GroupDesks site server: static files + POST /api/early-access (emails via Resend). No dependencies.
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const RESEND_URL = process.env.RESEND_API_URL || 'https://api.resend.com/emails';
const FROM = process.env.FROM_EMAIL || 'GroupDesks <info@groupdesks.com>';
const NOTIFY = process.env.NOTIFY_EMAIL || 'info@groupdesks.com';

const PAGES = {
  '/': 'index.html', '/index.html': 'index.html',
  '/privacy': 'privacy.html', '/privacy.html': 'privacy.html',
  '/terms': 'terms.html', '/terms.html': 'terms.html'
};
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webp': 'image/webp'
};
const SIZES = ['2–5 people', '6–20 people', '21–50 people', '50+ people'];
const SEC = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// ---- helpers ----
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clean = (v, max) => String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

const hits = new Map(); // ip -> timestamps (simple in-memory rate limit)
function limited(ip) {
  const now = Date.now(), win = 60 * 60 * 1000, max = 5;
  const list = (hits.get(ip) || []).filter(t => now - t < win);
  if (list.length >= max) { hits.set(ip, list); return true; }
  list.push(now); hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < win)) hits.delete(k);
  return false;
}

function send(res, code, body, headers) {
  res.writeHead(code, Object.assign({}, SEC, headers));
  res.end(body);
}
function json(res, code, obj) {
  send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
}

function serveFile(res, file, method) {
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
    send(res, 200, method === 'HEAD' ? '' : data, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
  });
}

async function resend(msg) {
  const r = await fetch(RESEND_URL, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(msg)
  });
  if (!r.ok) throw new Error('Resend ' + r.status + ' ' + (await r.text()).slice(0, 300));
}

function notifyEmail(d) {
  const rows = [['Name', d.name], ['Email', d.email], ['WhatsApp', d.phone], ['Business', d.company || '-'], ['Team size', d.size || '-']];
  return {
    from: FROM, to: [NOTIFY], reply_to: d.email,
    subject: 'New enquiry from the website: ' + d.name,
    text: rows.map(r => r[0] + ': ' + r[1]).join('\n'),
    html: '<h2 style="font-family:Arial,sans-serif;color:#0E2A47">New enquiry from the website</h2><table style="font-family:Arial,sans-serif;font-size:15px;color:#0E2A47;border-collapse:collapse">' +
      rows.map(r => '<tr><td style="padding:6px 16px 6px 0;color:#48607A">' + r[0] + '</td><td style="padding:6px 0"><b>' + esc(r[1]) + '</b></td></tr>').join('') + '</table>'
  };
}

function ackEmail(d) {
  const first = d.name.split(' ')[0];
  return {
    from: FROM, to: [d.email], reply_to: NOTIFY,
    subject: 'Thanks for contacting GroupDesks',
    text: 'Hi ' + first + ',\n\nThanks for getting in touch with GroupDesks. We have received your details and will message you on WhatsApp (' + d.phone + ') shortly to set up your desks.\n\nIf you want to add anything, just reply to this email.\n\nTeam GroupDesks\nhttps://www.groupdesks.com',
    html: '<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.6;color:#0E2A47;max-width:520px">' +
      '<p style="font-size:22px;font-weight:700;margin:0 0 16px">Group<span style="color:#1468C8">Desks</span></p>' +
      '<p>Hi ' + esc(first) + ',</p>' +
      '<p>Thanks for getting in touch with GroupDesks. We have received your details and will message you on WhatsApp (<b>' + esc(d.phone) + '</b>) shortly to set up your desks.</p>' +
      '<p>If you want to add anything, just reply to this email.</p>' +
      '<p style="color:#48607A">Team GroupDesks<br><a href="https://www.groupdesks.com" style="color:#1468C8">www.groupdesks.com</a></p></div>'
  };
}

function readBody(req, max) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', c => { size += c.length; if (size > max) { reject(new Error('too large')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function handleForm(req, res) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  let body;
  try { body = JSON.parse(await readBody(req, 10 * 1024)); } catch (e) { return json(res, 400, { ok: false, error: 'bad_request' }); }
  if (clean(body.website, 200)) return json(res, 200, { ok: true }); // honeypot: pretend success
  const d = {
    name: clean(body.name, 100), email: clean(body.email, 254).toLowerCase(),
    phone: clean(body.phone, 30), company: clean(body.company, 150),
    size: SIZES.includes(body.size) ? body.size : ''
  };
  const digits = d.phone.replace(/\D/g, '');
  if (!d.name || digits.length < 10 || digits.length > 15 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) {
    return json(res, 400, { ok: false, error: 'invalid' });
  }
  if (limited(ip)) return json(res, 429, { ok: false, error: 'rate_limited' });
  if (!RESEND_API_KEY) { console.error('RESEND_API_KEY is not set'); return json(res, 500, { ok: false, error: 'not_configured' }); }
  try {
    await resend(notifyEmail(d)); // must succeed, or the lead is lost
  } catch (e) { console.error('notify failed:', e.message); return json(res, 502, { ok: false, error: 'send_failed' }); }
  try { await resend(ackEmail(d)); } catch (e) { console.error('ack failed:', e.message); } // lead is already saved
  json(res, 200, { ok: true });
}

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/api/early-access') {
    if (req.method !== 'POST') return json(res, 405, { ok: false });
    return handleForm(req, res).catch(e => { console.error(e); json(res, 500, { ok: false }); });
  }
  if (url === '/healthz') return send(res, 200, 'ok', { 'Content-Type': 'text/plain' });
  if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed');
  if (PAGES[url]) return serveFile(res, path.join(ROOT, PAGES[url]), req.method);
  if (url.startsWith('/assets/')) {
    let rel; try { rel = decodeURIComponent(url); } catch (e) { return send(res, 400, 'Bad request'); }
    const file = path.join(ROOT, rel);
    if (!file.startsWith(path.join(ROOT, 'assets') + path.sep)) return send(res, 404, 'Not found');
    return serveFile(res, file, req.method);
  }
  send(res, 404, 'Not found', { 'Content-Type': 'text/plain; charset=utf-8' });
}).listen(PORT, () => console.log('GroupDesks site listening on ' + PORT));
