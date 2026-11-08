/**
 * Paid add-on invoices for Matt, Ameris, and Becky.
 * Supabase, member-sync, and every non-GET are failed before the network.
 * Run: node tools/tests/paid-addon-invoices.mjs
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8794;
const ROOT = new URL('../../', import.meta.url).pathname;
const GUARD = `(() => {
  const bad = (url, method) => {
    const m = String(method || 'GET').toUpperCase();
    const u = String(url || '');
    if (m !== 'GET') return true;
    if (/supabase|save_state|get_state|member[_-]?sync|wk_push|wk_get|nut_push|nut_get|rpc\\//i.test(u)) return true;
    return false;
  };
  const orig = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = (init && init.method) || (input && input.method) || 'GET';
    if (bad(url, method)) return Promise.reject(new TypeError('blocked'));
    return orig.apply(this, arguments);
  };
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) { this.__bls = { method, url }; return open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function () {
    const meta = this.__bls || { method: 'GET', url: '' };
    if (bad(meta.url, meta.method)) throw new Error('blocked');
    return send.apply(this, arguments);
  };
  if (navigator.sendBeacon) navigator.sendBeacon = function () { return false; };
  if (navigator.serviceWorker) navigator.serviceWorker.register = function () { return Promise.reject(new Error('sw')); };
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
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT, stdio: 'ignore' });
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=9352', '--user-data-dir=/tmp/chrome-paid-' + Date.now(), 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9352/json/version').then((r) => r.json()); } catch (e) {}
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
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500));
    return r.result.value;
  }
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Network.setBlockedURLs', { urls: ['*supabase.co*'] });
  await s('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  await s('Page.addScriptToEvaluateOnNewDocument', { source: GUARD });

  const cases = [
    ['/mhartman/', '2043.99', '249.99', 'KLOW Blend 80 mg', '760'],
    ['/ahartman/', '1,500.00', '100.00', 'Retatrutide 30 mg', '405'],
    ['/bdelorenzo/', '364.98', '134.98', 'GHK-Cu · 50 mg · 2 vials', '230']
  ];
  const problems = [];
  for (const [path, paid, total, marker, old] of cases) {
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + path });
    await delay(1200);
    const result = await evaluate(`(() => {
      go('pay');
      const text = document.getElementById('paylist').innerText;
      const problems = [];
      if (String(PAID) !== ${JSON.stringify(paid === '1,500.00' ? '1500' : paid.replace(/,/g,''))} && Number(PAID).toFixed(2) !== ${JSON.stringify(paid.replace(/,/g,''))}) problems.push('PAID ' + PAID);
      if (Number(DUE) !== 0) problems.push('DUE ' + DUE);
      if (!text.includes(${JSON.stringify(total)})) problems.push('total missing');
      if (!text.includes(${JSON.stringify(marker)})) problems.push('marker missing');
      if (!text.includes(${JSON.stringify(old)})) problems.push('history missing');
      if (text.includes('Pay now')) problems.push('pay action remains');
      if (!text.includes('Paid in full')) problems.push('paid line missing');
      const quotes = INV.filter(o => o.status === 'quote' || o.status === 'due');
      if (quotes.length) problems.push('quote remains');
      return { problems, paid: PAID, due: DUE };
    })()`);
    result.problems.forEach((p) => problems.push(path + ' ' + p));
  }
  const leaked = continued.filter((m) => m !== 'GET');
  console.log(JSON.stringify({ problems, leaked: leaked.length }, null, 2));
  ws.close();
  server.kill();
  chrome.kill();
  if (problems.length || leaked.length) process.exit(1);
}
main().catch((err) => { console.error(err); process.exit(1); });
