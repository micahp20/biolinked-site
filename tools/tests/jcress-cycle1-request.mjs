/**
 * jcress Cycle 1 request draft. Local static server.
 * Every Supabase/member-sync call and every non-GET is failed before the network.
 * Run: node tools/tests/jcress-cycle1-request.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8781;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/jcress-cycle1-request';
mkdirSync(SHOTS, { recursive: true });

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
    '--remote-debugging-port=9341', '--user-data-dir=/tmp/chrome-jcress-c1-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9341/json/version').then((r) => r.json()); } catch (e) {}
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
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 800));
    return r.result.value;
  }
  async function shot(name) {
    const img = await s('Page.captureScreenshot', { format: 'png' });
    writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
  }
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Network.setBlockedURLs', { urls: ['*supabase.co*'] });
  await s('Network.setCacheDisabled', { cacheDisabled: true });
  await s('Fetch.enable', { patterns: [{ urlPattern: '*', requestStage: 'Request' }] });
  await s('Page.addScriptToEvaluateOnNewDocument', { source: GUARD });

  const views = [
    ['desktop-light', 1280, 900, false, 'light'],
    ['phone-light', 390, 844, true, 'light'],
    ['desktop-dark', 1280, 900, false, 'dark'],
    ['phone-dark', 390, 844, true, 'dark']
  ];
  const reports = [];
  for (const [name, w, h, mobile, theme] of views) {
    await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/jcress/' });
    await delay(1200);
    await evaluate(`localStorage.setItem('jcress-app-theme', ${JSON.stringify(theme)})`);
    await s('Page.reload', { ignoreCache: true });
    await delay(1600);
    const report = await evaluate(`(() => {
      const problems = [];
      const box = document.getElementById('c1req');
      const text = box ? box.innerText : '';
      const title = document.getElementById('c1req-title');
      if (!title || title.textContent !== 'Cycle 1 request — pending clinician review') problems.push('title');
      if (!/Jamie Cress/.test(document.body.innerText)) problems.push('name missing');
      if (!/not an approved care plan/i.test(text)) problems.push('care-plan label');
      if (!/weight maintenance/.test(text)) problems.push('goal');
      if (!/were not written into Nutrition/.test(text)) problems.push('identity hold');
      if (!/age 32/.test(text) || !/5 ft 8/.test(text) || !/158–163 lb/.test(text)) problems.push('supplied profile');
      if (!/late forties/.test(text) || !/135-to-115/.test(text)) problems.push('existing profile report');
      const want = ['Retatrutide', 'Tesamorelin', 'MOTS-c', 'NAD+', 'KPV', 'Cagrilintide'];
      want.forEach((n) => { if (!text.includes(n)) problems.push('missing ' + n); });
      if (!/30 mg label · quantity 1/.test(text)) problems.push('reta qty');
      if (!/20 mg label · quantity 2/.test(text)) problems.push('tesa qty');
      if (!/40 mg label · quantity 1/.test(text)) problems.push('mots qty');
      if (!/1000 mg label · quantity 2/.test(text)) problems.push('nad qty');
      if (!/10 mg label · quantity 2/.test(text)) problems.push('kpv qty');
      if (!/10 mg label · quantity 1/.test(text)) problems.push('cagri qty');
      if (/\\$|BAC|shipping|\\bunits\\b|\\bmL\\b|SubQ|titrat|Monday|reconstitut|synerg/i.test(text)) problems.push('forbidden wording');
      if (!/down to 2\\.5/.test(text) || !/No unit was supplied/.test(text)) problems.push('tirz unit');
      if (!/April 30, 2026/.test(text) || !/April 30, 2027/.test(text) || !/two refills/.test(text)) problems.push('rx context');
      if (!/not treated as proof of what is being taken now/.test(text)) problems.push('rx inference');
      if (document.documentElement.getAttribute('data-theme') !== ${JSON.stringify(theme)}) problems.push('theme');
      const who = document.querySelector('.who .wn');
      if (!who || who.textContent.trim() !== 'Jamie Cress') problems.push('header identity');
      if (!(typeof PAID === 'number' && PAID === 959.99 && DUE === 0)) problems.push('paid constants');
      const inv = (typeof INV === 'undefined' ? [] : INV).map((row) => row.status + '|' + row.total + '|' + row.label);
      const invWant = [
        'paid|150|Cycle 1 · Fat Loss',
        'quote|150|Cycle 2 · Cognitive Enhancement · Quote',
        'paid|135|Cycle 3 · Recovery & Healing',
        'quote|295|Cycle 4 · Longevity & Anti-Aging · Quote',
        'quote|140|Cycle 5 · Sexual Health & Hormonal Balance · Quote',
        'quote|260|Cycle 6 · Sleep & Stress Relief · Quote',
        'paid|674.99|Add-On · Reta / Cartalax / KPV / Wolverine'
      ];
      if (JSON.stringify(inv) !== JSON.stringify(invWant)) problems.push('invoice map');
      const c1 = (typeof ALL === 'undefined' ? [] : ALL).filter((c) => (c.cy || []).indexOf('Cycle 1 · Fat Loss') >= 0).map((c) => c.n + '|' + c.d + '|' + c.u);
      if (JSON.stringify(c1) !== JSON.stringify(['Retatrutide · 30 mg|1 → 3 mg|10 → 30u','MOTS-c · 40 mg|1.6 mg|12u','NAD+ · 1000 mg|50 mg|25u'])) problems.push('cycle1 doses changed');
      const kpv = (typeof ALL === 'undefined' ? [] : ALL).filter((c) => /^KPV/.test(c.n)).map((c) => c.d + '|' + c.u + '|' + (c.cy || []).join(','));
      if (JSON.stringify(kpv) !== JSON.stringify(['1 mg|20u|Cycle 3 · Recovery & Healing'])) problems.push('kpv dose changed');
      const added = (typeof ALL === 'undefined' ? [] : ALL).filter((c) => /tesamorelin|cagrilintide/i.test(c.n));
      const addedMine = (typeof MINE === 'undefined' ? [] : MINE).filter((c) => /tesamorelin|cagrilintide/i.test(c.name));
      if (added.length || addedMine.length) problems.push('new products entered protocol data');
      if (!(typeof nutState === 'object' && nutState.age === 30 && nutState.weightLb === 180 && nutState.heightIn === 70 && nutState.sex === 'male')) problems.push('nutrition overwritten');
      const scroll = document.getElementById('scroll');
      if (scroll && scroll.scrollWidth - scroll.clientWidth > 2) problems.push('overflow');
      const cs = getComputedStyle(box);
      const bg = cs.backgroundColor;
      const border = cs.borderTopColor;
      return { problems, bg, border, items: box.querySelectorAll('.c1req-items li').length };
    })()`);
    if (report.items !== 6) report.problems.push('item rows ' + report.items);
    await evaluate(`(() => {
      const sc = document.getElementById('scroll');
      const el = document.getElementById('c1req');
      const to = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 70;
      sc.scrollTop = Math.max(0, to);
    })()`);
    await delay(200);
    await shot(name);
    if (name === 'desktop-light') {
      await evaluate(`typeof go==='function' && go('pay')`);
      await delay(300);
      const pay = await evaluate(`(() => {
        const text = (document.getElementById('v-pay') || {}).innerText || '';
        const problems = [];
        if (!/Paid/.test(text)) problems.push('paid label missing');
        if (/Tesamorelin|Cagrilintide|Cycle 1 request/.test(text)) problems.push('request leaked into invoice');
        if (typeof PAID !== 'number' || PAID !== 959.99 || DUE !== 0) problems.push('totals moved');
        return { problems, head: text.slice(0, 240) };
      })()`);
      report.problems.push(...pay.problems);
      await shot('desktop-light-invoice');
      await evaluate(`typeof go==='function' && go('sched'); if (typeof pickDay==='function') pickDay(1);`);
      await delay(300);
      const sched = await evaluate(`(() => {
        const text = (document.getElementById('v-sched') || {}).innerText || '';
        const problems = [];
        if (/Tesamorelin|Cagrilintide|Cycle 1 request/.test(text)) problems.push('request leaked into schedule');
        if (!/Retatrutide/.test(text)) problems.push('existing schedule missing reta');
        return problems;
      })()`);
      report.problems.push(...sched);
      await shot('desktop-light-schedule');
      await evaluate(`typeof go==='function' && go('proto')`);
    }
    if (name === 'phone-light') {
      await evaluate(`(() => {
        const sc = document.getElementById('scroll');
        const el = document.querySelector('#c1req .c1req-items');
        const to = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 70;
        sc.scrollTop = Math.max(0, to);
      })()`);
      await delay(150);
      await shot('phone-light-items');
    }
    reports.push({ name, problems: report.problems, bg: report.bg, border: report.border });
    console.log((report.problems.length ? 'FAIL ' : 'PASS ') + name + ' ' + report.problems.join(' | '));
  }
  const net = await evaluate(`window.__netlog || []`);
  const blockers = [];
  if (continued.some((row) => row.method !== 'GET')) blockers.push('continued non-GET');
  if (continued.some((row) => /supabase/i.test(row.url))) blockers.push('continued supabase');
  if (!(net || []).some((row) => row.method === 'POST' && /supabase|get_state/i.test(row.url))) blockers.push('member sync was not attempted');
  writeFileSync('/tmp/jcress-c1-results.json', JSON.stringify({ reports, blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  console.log(JSON.stringify({ blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  ws.close();
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
  if (reports.some((r) => r.problems.length) || blockers.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
