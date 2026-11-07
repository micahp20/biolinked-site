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

const POINTS = { optimal: 4, average: 3, out: 1 };
const STATUS = { optimal: 'Optimal', average: 'Average', out: 'Out-of-range' };
const SOURCE = [
  ['jd-e2', '44.6', 'out', 'hormones'],
  ['jd-ft', '198.93', 'average', 'hormones'],
  ['jd-cort', '13.2', 'optimal', 'hormones'],
  ['jd-shbg', '33.6', 'optimal', 'hormones'],
  ['jd-tt', '868', 'optimal', 'hormones'],
  ['jd-tsh', '1.27', 'optimal', 'liver'],
  ['jd-cr', '1.24', 'out', 'liver'],
  ['jd-alp', '42.4', 'average', 'liver'],
  ['jd-egfr', '69.52', 'average', 'liver'],
  ['jd-ggt', '24.9', 'optimal', 'liver'],
  ['jd-alb', '4.36', 'unscored', 'liver'],
  ['jd-tghdl', '2.95', 'out', 'metabolic'],
  ['jd-ua', '6.87', 'average', 'metabolic'],
  ['jd-tg', '139', 'average', 'metabolic'],
  ['jd-fru', '230', 'optimal', 'metabolic'],
  ['jd-ldlapob', '1.13', 'out', 'metabolic'],
  ['jd-rem', '27.79', 'out', 'metabolic'],
  ['jd-hdl', '47.0', 'average', 'metabolic'],
  ['jd-tc', '145', 'average', 'metabolic'],
  ['jd-crp', '1.21', 'average', 'metabolic'],
  ['jd-ldl', '70.2', 'average', 'metabolic'],
  ['jd-tchdl', '3.08', 'average', 'metabolic'],
  ['jd-apob', '61.9', 'optimal', 'metabolic'],
  ['jd-vd', '47.0', 'average', 'iron'],
  ['jd-fer', '180', 'optimal', 'iron']
];

function scale(rows) {
  const scored = rows.filter((row) => row[2] !== 'unscored');
  const sum = scored.reduce((total, row) => total + POINTS[row[2]], 0);
  const max = scored.length * 4;
  return { n: rows.length, scored: scored.length, sum, max, score: Math.round(sum / max * 100) };
}

function assertMath() {
  if (SOURCE.length !== 25) throw new Error('marker count ' + SOURCE.length);
  const ids = SOURCE.map((row) => row[0]);
  if (new Set(ids).size !== 25) throw new Error('duplicate ids');
  const badges = { optimal: 0, average: 0, out: 0, unscored: 0 };
  SOURCE.forEach((row) => { badges[row[2]] += 1; });
  if (badges.optimal !== 8 || badges.average !== 11 || badges.out !== 5 || badges.unscored !== 1) {
    throw new Error('badge counts ' + JSON.stringify(badges));
  }
  const all = scale(SOURCE);
  const hormones = scale(SOURCE.filter((row) => row[3] === 'hormones'));
  const liver = scale(SOURCE.filter((row) => row[3] === 'liver'));
  const metabolic = scale(SOURCE.filter((row) => row[3] === 'metabolic'));
  const iron = scale(SOURCE.filter((row) => row[3] === 'iron'));
  const expect = { all: 73, hormones: 80, liver: 75, metabolic: 67, iron: 88, sum: 70, scored: 24 };
  const got = { all: all.score, hormones: hormones.score, liver: liver.score, metabolic: metabolic.score, iron: iron.score, sum: all.sum, scored: all.scored };
  if (JSON.stringify(got) !== JSON.stringify(expect) || all.max !== 96 || metabolic.sum !== 32 || metabolic.max !== 48 || hormones.sum !== 16 || liver.sum !== 15 || iron.sum !== 7) {
    throw new Error('score math ' + JSON.stringify({ got, all, hormones, liver, metabolic, iron }));
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
      if (!num.includes('73') || !num.includes('/100')) problems.push('score text ' + num);
      const grade = score ? (score.querySelector('.g') || {}).textContent || '' : '';
      if (grade !== 'Provisional · Kidney and Hormone Follow-up') problems.push('grade ' + grade);
      const chips = Array.from(document.querySelectorAll('#labsbody .dchip')).map((el) => el.textContent.replace(/\\s+/g, ' ').trim());
      const chipWant = ['80', '75', '67', '88'];
      if (chips.length !== 4 || chipWant.some((n, i) => !chips[i].startsWith(n))) problems.push('chips ' + chips.join(' || '));
      const rows = Array.from(document.querySelectorAll('#labsbody .lrow'));
      if (rows.length !== 25) problems.push('rows ' + rows.length);
      if (/No bloodwork on file/i.test(text)) problems.push('empty state showing');
      const refs = Array.from(document.querySelectorAll('#labsbody .lref')).map((el) => el.textContent.trim());
      if (refs.length !== 25 || refs.some((r) => r !== 'Not shown in supplied screenshots')) problems.push('ranges ' + refs.filter((r) => r !== 'Not shown in supplied screenshots').slice(0, 2).join(','));
      if (/\\bHigh\\b|\\bLow\\b|Out-of-range High/.test(text)) problems.push('directional out-of-range label');
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
      if (!/not a verified laboratory in-range/.test(text)) problems.push('average mapping missing');
      const ratio = document.getElementById('jd-ldlapob');
      if (!ratio || !/particle-size/.test(ratio.textContent)) problems.push('ldl apob explanation');
      return { problems, byId, chips };
    })()`);
    SOURCE.forEach((row) => {
      const got = report.byId[row[0]];
      const status = row[2] === 'unscored' ? 'Unscored' : STATUS[row[2]];
      if (!got) { report.problems.push('missing ' + row[0]); return; }
      if (!got.value.includes(row[1]) || got.status !== status) report.problems.push(row[0] + ' ' + JSON.stringify(got));
    });
    const unscored = Object.values(report.byId).filter((row) => row.status === 'Unscored').length;
    if (unscored !== 1 || Object.keys(report.byId).length !== 25) report.problems.push('split ' + Object.keys(report.byId).length + '/' + unscored);
    await evaluate(`(() => { const sc=document.getElementById('scroll'); if(sc) sc.scrollTop=0; if(typeof go==='function') go('labs'); })()`);
    await delay(150);
    await shot(name + '-top');
    await evaluate(`(() => { const el=document.getElementById('jd-cr'); if(el) el.scrollIntoView({block:'center'}); })()`);
    await delay(100);
    const opened = await evaluate(`(() => { if (typeof tt==='function') tt('jd-cr'); const tip=document.getElementById('jd-cr'); return {on: !!(tip && tip.classList.contains('on')), text: tip ? tip.innerText : ''}; })()`);
    if (!opened.on || !/out of range/.test(opened.text)) report.problems.push('creatinine detail');
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
