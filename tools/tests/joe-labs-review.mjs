/**
 * Joe Labs score card. Local static server. Every Supabase/member-sync call
 * and every non-GET is blocked before the network.
 * Run: node tools/tests/joe-labs-review.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8773;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/joe-labs-scorecard';
mkdirSync(SHOTS, { recursive: true });

const SCORED = {
  'jd-tt': ['868', 'In-range', 3],
  'jd-egfr': ['69.52', 'In-range', 3],
  'jd-apob': ['61.9', 'Optimal', 4],
  'jd-hdl': ['47.0', 'In-range', 3],
  'jd-tc': ['145', 'Optimal', 4],
  'jd-tg': ['139', 'In-range', 3],
  'jd-crp': ['1.21', 'In-range', 3],
  'jd-ua': ['6.87', 'Out-of-range High', 1],
  'jd-vd': ['47.0', 'In-range', 3]
};

function assertMath() {
  const pts = Object.values(SCORED).map((row) => row[2]);
  const sum = pts.reduce((a, b) => a + b, 0);
  const avg = sum / pts.length;
  const score = Math.round(avg / 4 * 100);
  if (pts.length !== 9 || sum !== 27 || score !== 75) {
    throw new Error('score math ' + JSON.stringify({ pts: pts.length, sum, avg, score }));
  }
}

const GUARD = `(() => {
  const bad = (url, method) => {
    const m = String(method || 'GET').toUpperCase();
    const u = String(url || '');
    if (m !== 'GET') return true;
    if (/supabase|save_state|get_state|member[_-]?sync|wk_get|nut_get/i.test(u)) return true;
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
  assertMath();
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: ROOT.pathname, stdio: 'ignore' });
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=9337', '--user-data-dir=/tmp/chrome-joe-score-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9337/json/version').then((r) => r.json()); } catch (e) {}
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
    const block = method !== 'GET' || /supabase|save_state|get_state|member[_-]?sync|wk_get|nut_get/i.test(url);
    if (block) send('Fetch.failRequest', { requestId: msg.params.requestId, errorReason: 'BlockedByClient' }, session);
    else { continued.push({ method, url }); send('Fetch.continueRequest', { requestId: msg.params.requestId }, session); }
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
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/jdelorenzo/?score=1' });
    await delay(1500);
    await evaluate(`localStorage.setItem('jdelorenzo-app-theme', ${JSON.stringify(theme)})`);
    await s('Page.reload', { ignoreCache: true });
    await delay(1700);
    const report = await evaluate(`(() => {
      if (typeof go === 'function') go('labs');
      const problems = [];
      const host = document.getElementById('labsbody');
      const text = host ? host.innerText : '';
      if (document.querySelector('.qcard')) problems.push('old card UI still present');
      const score = document.querySelector('#labsbody .score');
      if (!score) problems.push('missing score card');
      const num = score ? (score.querySelector('.n') || {}).textContent || '' : '';
      if (!num.includes('75') || !num.includes('/100')) problems.push('score text ' + num);
      const grade = score ? (score.querySelector('.g') || {}).textContent || '' : '';
      if (!/9 of 25 scored/.test(grade)) problems.push('grade ' + grade);
      const chips = Array.from(document.querySelectorAll('#labsbody .dchip')).map((el) => el.textContent.replace(/\\s+/g, ' ').trim());
      if (chips.length !== 4 || chips.some((c) => !c.startsWith('75'))) problems.push('chips ' + chips.join(' || '));
      const rows = Array.from(document.querySelectorAll('#labsbody .lrow'));
      if (rows.length !== 25) problems.push('rows ' + rows.length);
      if (/No bloodwork on file/i.test(text)) problems.push('empty state showing');
      const refs = Array.from(document.querySelectorAll('#labsbody .lref')).map((el) => el.textContent.trim());
      if (refs.length !== 25 || refs.some((r) => r !== 'Not provided')) problems.push('ranges ' + refs.filter((r) => r !== 'Not provided').slice(0, 3).join(','));
      const byId = {};
      rows.forEach((row) => {
        const tip = row.querySelector('.ltip');
        const id = tip ? tip.id : '';
        byId[id] = {
          value: ((row.querySelector('.lv') || {}).textContent || '').replace(/\\s+/g, ''),
          status: ((row.querySelector('.pill') || {}).textContent || '').trim()
        };
      });
      const scroll = document.getElementById('scroll');
      if (scroll && scroll.scrollWidth - scroll.clientWidth > 2) problems.push('overflow');
      if (!(typeof PAID !== 'undefined' && PAID === 610 && DUE === 0)) problems.push('invoice constants');
      if (document.documentElement.getAttribute('data-theme') !== ${JSON.stringify(theme)}) problems.push('theme');
      const rule = text.includes('Each marker scores 4 if optimal');
      if (!rule) problems.push('rubric text missing');
      return { problems, byId, chips };
    })()`);
    Object.keys(SCORED).forEach((id) => {
      const got = report.byId[id];
      if (!got) { report.problems.push('missing ' + id); return; }
      if (!got.value.includes(SCORED[id][0]) || got.status !== SCORED[id][1]) report.problems.push(id + ' ' + JSON.stringify(got));
    });
    const unscored = Object.values(report.byId).filter((row) => row.status === 'Unscored').length;
    const scoredN = Object.values(report.byId).filter((row) => row.status !== 'Unscored').length;
    if (unscored !== 16 || scoredN !== 9) report.problems.push('split ' + scoredN + '/' + unscored);
    await evaluate(`(() => { const sc=document.getElementById('scroll'); if(sc) sc.scrollTop=0; if(typeof go==='function') go('labs'); })()`);
    await delay(150);
    await shot(name + '-top');
    await evaluate(`(() => { const el=document.getElementById('jd-cr'); if(el) el.scrollIntoView({block:'center'}); })()`);
    await delay(100);
    const opened = await evaluate(`(() => { if (typeof tt==='function') tt('jd-cr'); const tip=document.getElementById('jd-cr'); return {on: !!(tip && tip.classList.contains('on')), text: tip ? tip.innerText : ''}; })()`);
    if (!opened.on || !/urine ACR/.test(opened.text)) report.problems.push('creatinine detail');
    await shot(name + '-row');
    if (name === 'desktop-light') {
      await evaluate(`typeof go==='function' && go('pay')`);
      await delay(250);
      const pay = await evaluate(`((document.getElementById('v-pay')||{}).innerText||'')`);
      if (!/Paid to date \$610\.00/.test(pay) || !/Quoted \$0\.00/.test(pay)) report.problems.push('invoice view');
      await shot('desktop-light-invoice');
    }
    reports.push({ name, problems: report.problems });
    console.log((report.problems.length ? 'FAIL ' : 'PASS ') + name + ' ' + report.problems.join(' | '));
  }
  const net = await evaluate(`window.__netlog || []`);
  const blockers = [];
  if (continued.some((row) => row.method !== 'GET')) blockers.push('continued non-GET');
  if (continued.some((row) => /supabase/i.test(row.url))) blockers.push('continued supabase');
  if (!(net || []).some((row) => row.method === 'POST' && /supabase|get_state/i.test(row.url))) blockers.push('member sync was not attempted');
  if (!(net || []).some((row) => row.method === 'GET' && /supabase/i.test(row.url))) blockers.push('supabase GET was not attempted');
  writeFileSync('/tmp/joe-score-results.json', JSON.stringify({ reports, blockers, blocked: (net || []).length }, null, 2));
  console.log(JSON.stringify({ blockers, blocked: (net || []).length }, null, 2));
  ws.close();
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
  if (reports.some((r) => r.problems.length) || blockers.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
