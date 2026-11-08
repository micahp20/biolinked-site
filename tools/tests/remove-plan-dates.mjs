/**
 * Plan-date removal and schedule expansion.
 * Supabase, member-sync, and every non-GET are failed before the network.
 * Run: node tools/tests/remove-plan-dates.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8791;
const ROOT = new URL('../../', import.meta.url).pathname;
const SHOTS = '/opt/cursor/artifacts/remove-plan-dates';
mkdirSync(SHOTS, { recursive: true });

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(name)) out.push(p);
  }
  return out;
}
const pages = walk(ROOT).map((p) => p.slice(ROOT.length)).filter((rel) => {
  const text = readFileSync(join(ROOT, rel), 'utf8');
  return text.includes('portal-plan-controls.js?v=2');
});
const manifest = { pages: pages.length, invoicePages: 0, exceptions: [] };
for (const rel of pages) {
  const text = readFileSync(join(ROOT, rel), 'utf8');
  if (text.includes('function renderPay')) manifest.invoicePages += 1;
}
const shared = readFileSync(join(ROOT, 'portal-plan-controls.js'), 'utf8');
if (/Plan dates|type="date"|blp-date|hiddenNow/.test(shared)) {
  throw new Error('shared script still contains date controls');
}

const GUARD = `(() => {
  const bad = (url, method) => {
    const m = String(method || 'GET').toUpperCase();
    const u = String(url || '');
    if (m !== 'GET') return true;
    if (/supabase|save_state|get_state|member[_-]?sync|wk_push|wk_get|nut_push|nut_get|rpc\\//i.test(u)) return true;
    return false;
  };
  const log = (method, url) => { (window.__netlog = window.__netlog || []).push(String(method) + ' ' + String(url)); };
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

const CHECK = `(() => {
  const problems = [];
  const dateN = document.querySelectorAll('input[type="date"]').length;
  if (dateN) problems.push('date inputs ' + dateN);
  if (/Plan dates/.test(document.body.innerText)) problems.push('plan dates text');
  if (typeof go === 'function') go('sched');
  const row = document.querySelector('#doses .drow.dx-row');
  let expand = 'no-dx-row';
  if (row) {
    const before = JSON.stringify(typeof ALL === 'undefined' ? null : ALL);
    const inv = JSON.stringify(typeof INV === 'undefined' ? null : INV);
    row.click();
    const pan = row.nextElementSibling;
    const open1 = !!(pan && pan.classList.contains('dx-pan') && pan.classList.contains('open'));
    row.click();
    const shut = !!(pan && pan.classList.contains('dx-pan') && !pan.classList.contains('open'));
    row.focus();
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    const open2 = !!(pan && pan.classList.contains('open'));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    const shut2 = !!(pan && !pan.classList.contains('open'));
    if (!open1 || !shut || !open2 || !shut2) problems.push('schedule toggle ' + [open1, shut, open2, shut2].join(','));
    const ask = pan && pan.querySelector('[data-blp-act="ask"]');
    if (ask) {
      ask.click();
      if (pan.classList.contains('open') === false) problems.push('remove swallowed the row');
    }
    if (before !== JSON.stringify(typeof ALL === 'undefined' ? null : ALL)) problems.push('ALL changed');
    if (inv !== JSON.stringify(typeof INV === 'undefined' ? null : INV)) problems.push('INV changed');
    expand = 'ok';
  }
  if (typeof go === 'function') go('proto');
  const card = document.querySelector('#protoabout details.jc-compound');
  if (card) {
    card.open = false;
    card.querySelector('summary').click();
    const opened = card.open;
    card.querySelector('summary').click();
    const shut = !card.open;
    card.querySelector('summary').focus();
    card.querySelector('summary').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    if (!opened || !shut) problems.push('protocol toggle ' + opened + ',' + shut);
    if (card.querySelector('input[type="date"]')) problems.push('protocol date');
    if (!card.querySelector('[data-blp-act="ask"]')) problems.push('protocol remove missing');
  }
  let added = 'no-add';
  const btn = document.getElementById('pc-addbtn');
  const vial = document.getElementById('pc-vial');
  const bac = document.getElementById('pc-bac');
  const dose = document.getElementById('pc-dose');
  const name = document.getElementById('pc-name');
  const cmp = document.getElementById('pc-compound');
  if (btn && vial && bac && dose) {
    const allBefore = JSON.stringify(typeof ALL === 'undefined' ? null : ALL);
    const invBefore = JSON.stringify(typeof INV === 'undefined' ? null : INV);
    if (cmp) { cmp.value = '__custom__'; cmp.dispatchEvent(new Event('change')); }
    if (name) name.value = 'ZZ Fixture Peptide';
    vial.value = '10'; bac.value = '2'; dose.value = '1';
    [vial, bac, dose].forEach((el) => el.dispatchEvent(new Event('input', { bubbles: true })));
    btn.click();
    const list = document.getElementById('pc-list');
    const ok = !!(list && list.textContent.includes('ZZ Fixture Peptide'));
    const del = list && [...list.querySelectorAll('[data-del]')].find((b) => (b.getAttribute('aria-label') || '').includes('ZZ Fixture'));
    if (del) del.click();
    if (!ok) problems.push('add to list failed');
    if (allBefore !== JSON.stringify(typeof ALL === 'undefined' ? null : ALL)) problems.push('add changed ALL');
    if (invBefore !== JSON.stringify(typeof INV === 'undefined' ? null : INV)) problems.push('add changed INV');
    added = ok ? 'ok' : 'fail';
  }
  const root = document.getElementById('scroll') || document.documentElement;
  if (root.scrollWidth > root.clientWidth + 2) problems.push('overflow');
  return { problems, expand, added };
})()`;

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
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=9348', '--user-data-dir=/tmp/chrome-nodates-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9348/json/version').then((r) => r.json()); } catch (e) {}
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
    else { continued.push(method); send('Fetch.continueRequest', { requestId: msg.params.requestId }, session); }
  });
  const s = (method, params) => send(method, params || {}, session).then((r) => r.result);
  async function evaluate(expression) {
    const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 700));
    return r.result.value;
  }
  async function shot(name) {
    const img = await s('Page.captureScreenshot', { format: 'png' });
    writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
  }
  async function open(path, w, h) {
    await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + path });
    await delay(1000);
  }

  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Network.setBlockedURLs', { urls: ['*supabase.co*'] });
  await s('Network.setCacheDisabled', { cacheDisabled: true });
  await s('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  await s('Page.addScriptToEvaluateOnNewDocument', { source: GUARD });

  const failures = [];
  async function sweep(w, h, label) {
    for (const rel of pages) {
      const urlPath = '/' + rel.replace(/index\.html$/, '');
      try {
        await open(urlPath, w, h);
        const result = await evaluate(CHECK);
        if (result.problems.length) failures.push(label + ' ' + rel + ': ' + result.problems.join('; '));
      } catch (err) {
        failures.push(label + ' ' + rel + ': ' + String(err).slice(0, 180));
      }
    }
  }
  await sweep(1280, 900, 'pc');
  await sweep(390, 844, 'phone');

  await open('/arasche/', 1280, 900);
  await evaluate(`localStorage.setItem('arasche-app-a2hs','1'); localStorage.setItem('biolinked-planwin-arasche', JSON.stringify({v:1,items:{['Cycle 1\\u001fRetatrutide · 60 mg']:{start:'2099-01-01',removed:false}}})); true`);
  await s('Page.reload', { ignoreCache: true });
  await delay(900);
  const august = await evaluate(`(() => {
    const problems = [];
    const text = document.body.innerText;
    if (/Plan dates/.test(text) || document.querySelector('input[type="date"]')) problems.push('dates still visible');
    go('sched');
    if (typeof pickDay === 'function') pickDay(1);
    const names = [...document.querySelectorAll('#doses .drow')].map(r => (r.querySelector('.nm') || r).textContent);
    if (!names.some(n => n.includes('Retatrutide'))) problems.push('future date hid Retatrutide ' + names.join('|'));
    const stored = JSON.parse(localStorage.getItem('biolinked-planwin-arasche') || '{}');
    const leftover = Object.values(stored.items || {}).some(r => r && (r.start || r.end));
    if (leftover) problems.push('old dates kept');
    const row = [...document.querySelectorAll('#doses .drow.dx-row')].find(r => (r.getAttribute('data-dx') || '').includes('Retatrutide')) || document.querySelector('#doses .drow.dx-row');
    row.scrollIntoView({ block: 'center' });
    row.click();
    const pan = row.nextElementSibling;
    if (!pan || !pan.classList.contains('open')) problems.push('pc row did not open');
    return { problems, open: !!(pan && pan.classList.contains('open')) };
  })()`);
  august.problems.forEach((p) => failures.push('augustus pc ' + p));
  await shot('augustus-pc-schedule');
  await evaluate(`(() => { go('proto'); const card = [...document.querySelectorAll('#protoabout details.jc-compound')].find(c => c.textContent.includes('Retatrutide')); if (card) { card.open = true; card.scrollIntoView({ block: 'center' }); } return true; })()`);
  await shot('augustus-pc-protocol');

  await open('/arasche/', 390, 844);
  await evaluate(`localStorage.setItem('arasche-app-a2hs','1'); go('sched'); const row = document.querySelector('#doses .drow.dx-row'); if (row) { row.scrollIntoView({ block: 'center' }); row.click(); } return true;`);
  await delay(200);
  await shot('augustus-phone-schedule');
  await evaluate(`(() => { go('proto'); const card = document.querySelector('#protoabout details.jc-compound'); if (card) { card.open = true; card.scrollIntoView({ block: 'start' }); } return true; })()`);
  await shot('augustus-phone-protocol');

  const labs = await evaluate(`(() => { location.href = 'http://127.0.0.1:${PORT}/mpauldino/'; return true; })()`);
  await delay(1200);
  const labsOk = await evaluate(`(() => ({ score: (typeof LABS !== 'undefined' && LABS && LABS.score) || '', dates: document.querySelectorAll('input[type="date"]').length }))()`);

  const leaked = continued.filter((m) => m !== 'GET');
  const summary = {
    pages: manifest.pages,
    invoicePages: manifest.invoicePages,
    failures,
    leaked: leaked.length,
    labsScore: labsOk.score,
    labsDateInputs: labsOk.dates,
    ignored: labs
  };
  writeFileSync(SHOTS + '/coverage.json', JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
  ws.close();
  server.kill();
  chrome.kill();
  if (failures.length || leaked.length || labsOk.score !== '78' || labsOk.dates) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
