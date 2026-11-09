/**
 * mpauldino Nov 2026 labs. Local static server.
 * Every Supabase/member-sync call and every non-GET is failed before the network.
 * Run: node tools/tests/mpauldino-labs-nov2026.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8788;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/mpauldino-labs';
mkdirSync(SHOTS, { recursive: true });

const source = readFileSync(new URL('../../mpauldino/labs-nov2026.js', import.meta.url), 'utf8');
const window = {};
eval(source);
const data = window.MP_LABS;
const rows = data.secs.flatMap((s) => s.rows);
const scored = rows.filter((r) => r.pts != null);
const pts = scored.reduce((sum, r) => sum + r.pts, 0);
if (data.score !== '95' || scored.length !== 50 || pts !== 189) {
  throw new Error('score math ' + data.score + ' ' + scored.length + ' ' + pts);
}
if (scored.filter((r) => r.pts === 4).length !== 43 || scored.filter((r) => r.pts === 3).length !== 5 || scored.filter((r) => r.pts === 1).length !== 2) {
  throw new Error('bucket counts');
}

const GUARD = `(() => {
  const bad = (url, method) => {
    const m = String(method || 'GET').toUpperCase();
    const u = String(url || '');
    if (m !== 'GET') return true;
    if (/supabase|save_state|get_state|member[_-]?sync|wk_push|wk_get|nut_push|nut_get|rpc\\//i.test(u)) return true;
    return false;
  };
  const log = (method, url) => {
    (window.__netlog = window.__netlog || []).push({ method: String(method || '').toUpperCase(), url: String(url || '') });
  };
  const orig = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = (init && init.method) || (input && input.method) || 'GET';
    if (bad(url, method)) { log(method, url); return Promise.reject(new TypeError('blocked')); }
    return orig.apply(this, arguments);
  };
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) { this.__bls = { method, url }; return open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    const meta = this.__bls || { method: 'GET', url: '' };
    if (bad(meta.url, meta.method)) { log(meta.method, meta.url); throw new Error('blocked'); }
    return send.apply(this, arguments);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = function (url) { log('BEACON', url); return false; };
  if (navigator.serviceWorker) navigator.serviceWorker.register = function () { return Promise.reject(new Error('sw blocked')); };
})();`;

function cdp(ws) {
  const pending = new Map();
  const sessions = new Map();
  let seq = 0;
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const box = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) box.reject(new Error(JSON.stringify(msg.error)));
      else box.resolve(msg);
    } else if (msg.method && sessions.has(msg.sessionId || '')) sessions.get(msg.sessionId || '')(msg);
  });
  function send(method, params = {}, sessionId) {
    const id = ++seq;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      const payload = { id, method, params };
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }
  return { send, sessions };
}

async function main() {
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT.pathname, stdio: 'ignore' });
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=9346', '--user-data-dir=/tmp/chrome-mp-labs-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9346/json/version').then((r) => r.json()); } catch (e) {}
  }
  if (!ver) throw new Error('Chrome did not open');
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const { send, sessions } = cdp(ws);
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const attached = await send('Target.attachToTarget', { targetId: target.result.targetId, flatten: true });
  const session = attached.result.sessionId;
  const continued = [];
  sessions.set(session, (msg) => {
    if (msg.method !== 'Fetch.requestPaused') return;
    const req = msg.params.request;
    const method = String(req.method || 'GET').toUpperCase();
    const url = req.url || '';
    const block = method !== 'GET' || /supabase|save_state|get_state|member[_-]?sync|wk_push|wk_get|nut_push|nut_get|rpc\//i.test(url);
    if (block) send('Fetch.failRequest', { requestId: msg.params.requestId, errorReason: 'BlockedByClient' }, session);
    else { continued.push({ method, url }); send('Fetch.continueRequest', { requestId: msg.params.requestId }, session); }
  });
  const s = (method, params) => send(method, params || {}, session).then((r) => r.result);
  async function evaluate(expression) {
    const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 900));
    return r.result.value;
  }
  async function shot(name) {
    const img = await s('Page.captureScreenshot', { format: 'png' });
    writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
  }
  async function openLabs(w, h, theme) {
    await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/mpauldino/' });
    await delay(1400);
    await evaluate(`(() => { document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)}); go('labs'); return true; })()`);
    await delay(300);
  }

  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Network.setBlockedURLs', { urls: ['*supabase.co*'] });
  await s('Network.setCacheDisabled', { cacheDisabled: true });
  await s('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  await s('Page.addScriptToEvaluateOnNewDocument', { source: GUARD });

  const problems = [];
  function check(cond, msg) { if (!cond) problems.push(msg); }

  await openLabs(390, 844, 'light');
  const report = await evaluate(`(() => {
    const problems = [];
    const host = document.getElementById('labsbody');
    const text = host ? host.innerText : '';
    if (!host || !host.querySelector('.score')) problems.push('score card missing');
    if (!text.includes('Custom wellness score')) problems.push('score label');
    if (!text.includes('95')) problems.push('score number');
    if (!text.includes('189')) problems.push('point total');
    if (LABS.score !== '95') problems.push('data score ' + LABS.score);
    const need = ['80', '4.8', '63', '67', '40', '76', '988', '206.7', '2.03', '1.2', '30', '34.5', '17.7', '51.2', '99.8', '11/02/2026 08:49', '11/05/2026 17:14'];
    need.forEach((n) => { if (!text.includes(n)) problems.push('missing ' + n); });
    if (!text.includes('Not a diagnosis') && !text.includes('not a diagnosis')) problems.push('disclaimer');
    if (!text.includes('No urgent')) problems.push('urgency line');
    if (!text.includes('Newcastle')) problems.push('guidance cite');
    const alp = document.getElementById('n2-alp');
    const mch = document.getElementById('n2-mch');
    const alpRow = alp && alp.closest('.lrow');
    const mchRow = mch && mch.closest('.lrow');
    if (!alpRow || !/LOW/i.test(alpRow.innerText) || !alp.textContent.includes('below the printed range 36')) problems.push('ALP flag');
    if (!mchRow || !/HIGH/i.test(mchRow.innerText) || !mch.textContent.includes('above the printed range 27.0')) problems.push('MCH flag');
    if (!/UPPER LIMIT/i.test(text)) problems.push('hgb pill');
    if (/\\bTRT\\b|B12|folate|zinc|donate|05\\/20\\/1981|720-938|Mountain/.test(text)) problems.push('forbidden wording');
    if (text.includes(' MT')) problems.push('timezone added');
    const scored = LABS.secs.flatMap(s => s.rows).filter(r => r.pts != null);
    if (scored.length !== 50) problems.push('scored ' + scored.length);
    if (INV.length !== 0 || PAID !== 0 || DUE !== 0) problems.push('invoice changed');
    if (!CMP[0] || !CMP[0].n.includes('Testosterone Cypionate')) problems.push('protocol changed');
    if (!document.querySelector('script[src="/portal-plan-controls.js?v=2"]')) problems.push('plan controls missing');
    if (document.querySelector('#labsbody .ldef')) problems.push('speculative definition shown');
    const card = [...document.querySelectorAll('#labsbody .score')].find((n) => /custom wellness score/i.test(n.innerText));
    const close = [...document.querySelectorAll('button')].find((b) => (b.getAttribute('aria-label') || b.textContent || '').trim() === '×' || b.textContent === '×');
    if (close) close.click();
    if (card) card.scrollIntoView({ block: 'start' });
    return { problems, ready: !!card };
  })()`);
  report.problems.forEach((p) => problems.push(p));
  await shot('phone-light-score');
  await evaluate(`(() => { const alp = document.getElementById('n2-alp'); alp.closest('.lrow').scrollIntoView({ block: 'center' }); alp.classList.add('on'); return true; })()`);
  await shot('phone-light-alp');

  for (const [w, h, theme] of [[390, 844, 'dark'], [1280, 900, 'light'], [360, 800, 'light'], [430, 932, 'dark']]) {
    await openLabs(w, h, theme);
    const layout = await evaluate(`(() => {
      const problems = [];
      const text = (document.getElementById('labsbody') || {}).innerText || '';
      if (!text.includes('95') || !text.includes('Alkaline phosphatase')) problems.push('labs missing');
      const root = document.getElementById('scroll') || document.documentElement;
      if (root.scrollWidth > root.clientWidth + 2) problems.push('overflow ' + root.scrollWidth);
      if (document.documentElement.scrollWidth > window.innerWidth + 2) problems.push('page overflow');
      return problems;
    })()`);
    layout.forEach((p) => problems.push(w + ' ' + theme + ' ' + p));
  }
  await openLabs(1280, 900, 'light');
  await evaluate(`(() => { const card = [...document.querySelectorAll('#labsbody .score')].find((n) => /custom wellness score/i.test(n.innerText)); if (card) card.scrollIntoView({ block: 'center' }); return true; })()`);
  await shot('desktop-light-labs');
  await openLabs(390, 844, 'dark');
  await evaluate(`(() => { const card = [...document.querySelectorAll('#labsbody .score')].find((n) => /custom wellness score/i.test(n.innerText)); if (card) card.scrollIntoView({ block: 'start' }); return true; })()`);
  await shot('phone-dark-score');

  const leaked = continued.filter((r) => r.method !== 'GET' || /supabase|save_state|get_state|member[_-]?sync|rpc\//i.test(r.url));
  check(leaked.length === 0, 'network leak ' + JSON.stringify(leaked.slice(0, 3)));
  console.log(JSON.stringify({ problems, blocked: (await evaluate('window.__netlog||[]')).length }, null, 2));
  ws.close();
  server.kill();
  chrome.kill();
  if (problems.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
