/**
 * Annaleah portal draft. Local static server.
 * Every Supabase/member-sync call and every non-GET is failed before the network.
 * Run: node tools/tests/annaleah-portal.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8784;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/annaleah-portal';
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
    '--remote-debugging-port=9344', '--user-data-dir=/tmp/chrome-annaleah-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9344/json/version').then((r) => r.json()); } catch (e) {}
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
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/annaleah/' });
    await delay(700);
    await evaluate(`localStorage.setItem('annaleah-app-theme', ${JSON.stringify(theme)})`);
    await s('Page.reload', { ignoreCache: true });
    await delay(1600);
    const report = await evaluate(`(() => {
      const problems = [];
      const box = document.getElementById('alref');
      const text = box ? box.innerText : '';
      const title = document.getElementById('alref-title');
      if (!title || title.textContent !== 'Master Cycle 1 — supplied prescriber reference') problems.push('title');
      const who = document.querySelector('.who .wn');
      if (!who || who.textContent.trim() !== 'Annaleah') problems.push('header ' + (who && who.textContent));
      if (/Jamie|Cress|Paul/.test(document.body.innerText)) problems.push('other client name visible');
      const need = [
        'start 0.5 mg (titrate slow)',
        '5u',
        'Mon + Thu AM, 1 mg/wk, hold >=4 wks',
        'Start slow: 0.5mg Mon+Thu=1mg/wk, hold >=4 wks; step up only if appetite control fades & nausea quiet',
        'start 0.5 mg, titrate slow',
        'Mon + Thu, AM',
        '1 mg',
        '10u',
        'daily AM',
        'daily, AM',
        '20mg only (10mg retired); one 20mg = 2x the 10mg',
        '~1.33 mg',
        'M/W/F',
        '50 mg',
        '25u',
        'M/W/F, push slowly',
        '500 mcg',
        'Blank in the supplied reference',
        'Not specified in supplied reference',
        'titrate',
        'Cagrilintide is absent',
        'Weight maintenance',
        '158–163 lb',
        'early September'
      ];
      need.forEach((s) => { if (!text.includes(s)) problems.push('missing ' + s); });
      if ((text.match(/Not specified in supplied reference/g) || []).length < 2) problems.push('timing count');
      if (/\\$\\d|Paid|FREE/.test(text)) problems.push('money in reference');
      if (document.documentElement.getAttribute('data-theme') !== ${JSON.stringify(theme)}) problems.push('theme');
      if (!(PAID === 0 && DUE === 0 && INV.length === 0 && ALL.length === 0 && MINE.length === 0)) problems.push('data arrays');
      if (CS_SLUG !== 'annaleah' || SCHKEY !== 'biolinked-sched-annaleah' || KP !== 'annaleah-app-') problems.push('identity keys');
      if (nutState.age !== 32 || nutState.heightIn !== 68 || nutState.weightLb !== null || nutState.sex !== '' || nutState.goal !== 'maintain') problems.push('nut state');
      const sexOn = document.querySelectorAll('#v-nutr .nut-seg-btn[data-grp="sex"].on').length;
      if (sexOn !== 0) problems.push('sex selected');
      if (document.getElementById('nut-w').value !== '') problems.push('weight filled');
      if (document.getElementById('nut-age').value !== '32') problems.push('age field');
      if (document.getElementById('nut-ft').value !== '5' || document.getElementById('nut-in').value !== '8') problems.push('height field');
      const cal = (document.getElementById('nut-cal-sub') || {}).textContent || '';
      if (!/No single calorie target/.test(cal)) problems.push('calorie calculated');
      const keys = Object.keys(localStorage);
      if (keys.some((k) => /jcress|pcress|dh-app|Jamie|Cress/.test(k))) problems.push('foreign storage ' + keys.join(','));
      const scroll = document.getElementById('scroll');
      if (scroll && scroll.scrollWidth - scroll.clientWidth > 2) problems.push('overflow');
      const labs = (document.getElementById('v-labs') || {}).innerText || '';
      if (!/No bloodwork on file/.test(labs) || /Worth drawing|the cut/.test(labs)) problems.push('labs');
      return { problems };
    })()`);
    await evaluate(`(() => {
      const sc = document.getElementById('scroll');
      const el = document.getElementById('alref');
      sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 88);
    })()`);
    await delay(180);
    await shot(name);
    if (name === 'desktop-light') {
      await evaluate(`typeof go==='function' && go('pay')`);
      await delay(250);
      const pay = await evaluate(`(() => {
        const text = (document.getElementById('v-pay') || {}).innerText || '';
        const problems = [];
        if (!/Quote pending/.test(text) || !/Pending/.test(text)) problems.push('quote label');
        if (/\\$|Paid|FREE/.test(text)) problems.push('priced or paid invoice');
        if (!/Retatrutide 30 mg/.test(text) || !/Cagrilintide 10 mg/.test(text) || !/Qty 2/.test(text)) problems.push('lines');
        if (document.querySelector('#v-pay .invoice-pay-now, #v-pay .paybtn')) problems.push('pay button');
        return { problems, head: text.slice(0, 300) };
      })()`);
      report.problems.push(...pay.problems);
      await shot('desktop-light-invoice');
      await evaluate(`typeof go==='function' && go('sched'); if (typeof pickDay==='function') pickDay(1);`);
      await delay(250);
      const sched = await evaluate(`(() => {
        const text = (document.getElementById('v-sched') || {}).innerText || '';
        const problems = [];
        if (!/Nothing scheduled/.test(text)) problems.push('schedule not empty');
        if (/Retatrutide|Tesamorelin|Cagrilintide|KPV|5u|500 mcg/.test(text)) problems.push('schedule activated');
        return problems;
      })()`);
      report.problems.push(...sched);
      await shot('desktop-light-schedule');
    }
    if (name === 'phone-light') {
      await evaluate(`(() => {
        const sc = document.getElementById('scroll');
        const el = document.querySelectorAll('#alref .alref-card')[4];
        sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 88);
      })()`);
      await delay(150);
      await shot('phone-light-addons');
    }
    reports.push({ name, problems: report.problems });
    console.log((report.problems.length ? 'FAIL ' : 'PASS ') + name + ' ' + report.problems.join(' | '));
  }
  const net = await evaluate(`window.__netlog || []`);
  const blockers = [];
  if (continued.some((row) => row.method !== 'GET')) blockers.push('continued non-GET');
  if (continued.some((row) => /supabase/i.test(row.url))) blockers.push('continued supabase');
  if (!(net || []).some((row) => row.method === 'POST' && /supabase|get_state/i.test(row.url))) blockers.push('member sync was not attempted');
  writeFileSync('/tmp/annaleah-results.json', JSON.stringify({ reports, blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  console.log(JSON.stringify({ blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  ws.close();
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
  if (reports.some((r) => r.problems.length) || blockers.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
