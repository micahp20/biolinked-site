/**
 * Joe Labs review: render check with every Supabase / member-sync call and
 * every non-GET request blocked. Local fixtures only. Does not write
 * production client state, send mail, or charge anything.
 *
 * Run: node tools/tests/joe-labs-review.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8771;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/joe-labs';
mkdirSync(SHOTS, { recursive: true });

const MARKERS = [
  ['tsh', 'TSH', '1.27', 'uIU/mL', 'OPTIMAL', 'Favorable'],
  ['creatinine', 'Creatinine', '1.24', 'mg/dL', 'OUT OF RANGE', 'Needs clinician follow-up'],
  ['alp', 'ALP', '42.4', 'U/L', 'AVERAGE', 'Intermediate'],
  ['egfr', 'eGFR', '69.52', 'mL/min/1.73m2', 'AVERAGE', 'Needs clinician follow-up'],
  ['ggt', 'GGT', '24.9', 'U/L', 'OPTIMAL', 'Favorable'],
  ['tghdl', 'Triglyceride / HDL ratio', '2.95', 'ratio', 'OUT OF RANGE', 'Intermediate'],
  ['uric', 'Uric acid', '6.87', 'mg/dL', 'AVERAGE', 'Intermediate'],
  ['tg', 'Triglycerides', '139', 'mg/dL', 'AVERAGE', 'Intermediate'],
  ['vitd', 'Vitamin D', '47.0', 'ng/mL', 'AVERAGE', 'Favorable'],
  ['fructosamine', 'Fructosamine', '230', 'umol/L', 'OPTIMAL', 'Favorable'],
  ['albumin', 'Albumin', '4.36', 'g/dL', 'Not readable', 'Favorable'],
  ['ferritin', 'Ferritin', '180', 'ng/mL', 'OPTIMAL', 'Favorable'],
  ['ldlapob', 'LDL / ApoB ratio', '1.13', 'ratio', 'OUT OF RANGE', 'Not a clinical target'],
  ['remnant', 'Remnant cholesterol', '27.79', 'mg/dL', 'OUT OF RANGE', 'Intermediate'],
  ['hdl', 'HDL', '47.0', 'mg/dL', 'AVERAGE', 'Intermediate'],
  ['tc', 'Total cholesterol', '145', 'mg/dL', 'AVERAGE', 'Favorable'],
  ['hscrp', 'hsCRP', '1.21', 'mg/L', 'AVERAGE', 'Intermediate'],
  ['ldl', 'LDL', '70.2', 'mg/dL', 'AVERAGE', 'Favorable'],
  ['tchdl', 'Total cholesterol / HDL ratio', '3.08', 'ratio', 'AVERAGE', 'Favorable'],
  ['apob', 'ApoB', '61.9', 'mg/dL', 'OPTIMAL', 'Favorable'],
  ['e2', 'Estradiol', '44.6', 'pg/mL', 'OUT OF RANGE', 'Needs clinician follow-up'],
  ['freet', 'Free testosterone', '198.93', 'pg/mL', 'AVERAGE', 'Insufficient context'],
  ['cortisol', 'Cortisol', '13.2', 'ug/dL', 'OPTIMAL', 'Insufficient context'],
  ['shbg', 'SHBG', '33.6', 'nmol/L', 'OPTIMAL', 'Favorable'],
  ['totalt', 'Total testosterone', '868', 'ng/dL', 'OPTIMAL', 'Not low — review timing']
];

function assertMath() {
  const round2 = (n) => Math.round(n * 100) / 100;
  const checks = [
    [round2(139 / 47), 2.96, '139/47'],
    [round2(145 / 47), 3.09, '145/47'],
    [round2(70.2 / 61.9), 1.13, '70.2/61.9'],
    [round2(145 - 47 - 70.2), 27.8, 'remnant'],
    [145 - 47, 98, 'non-HDL']
  ];
  for (const [got, want, name] of checks) {
    if (got !== want) throw new Error(name + ' expected ' + want + ' got ' + got);
  }
}

const GUARD = `(() => {
  const bad = (url, method) => {
    const m = String(method || 'GET').toUpperCase();
    const u = String(url || '');
    if (m !== 'GET') return true;
    if (/supabase/i.test(u)) return true;
    if (/save_state|get_state|member[_-]?sync/i.test(u)) return true;
    return false;
  };
  const log = (method, url) => {
    const row = { method: String(method || '').toUpperCase(), url: String(url || '') };
    (window.__netlog = window.__netlog || []).push(row);
  };
  const orig = window.fetch;
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    const method = (init && init.method) || (input && input.method) || 'GET';
    if (bad(url, method)) {
      log(method, url);
      return Promise.reject(new TypeError('blocked by test'));
    }
    return orig.apply(this, arguments);
  };
  const open = XMLHttpRequest.prototype.open;
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.__bls = { method: method, url: url };
    return open.apply(this, arguments);
  };
  XMLHttpRequest.prototype.send = function () {
    const meta = this.__bls || { method: 'GET', url: '' };
    if (bad(meta.url, meta.method)) {
      log(meta.method, meta.url);
      throw new Error('blocked by test');
    }
    return send.apply(this, arguments);
  };
  if (navigator.sendBeacon) {
    navigator.sendBeacon = function (url) {
      log('BEACON', url);
      return false;
    };
  }
  if (navigator.serviceWorker && navigator.serviceWorker.register) {
    navigator.serviceWorker.register = function () {
      return Promise.reject(new Error('service worker blocked in test'));
    };
  }
})();`;

function cdp(ws) {
  const pending = new Map();
  const sessions = new Map();
  let seq = 0;
  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg);
    } else if (msg.method && sessions.has(msg.sessionId || '')) {
      sessions.get(msg.sessionId || '')(msg);
    }
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

async function evaluate(s, expression) {
  const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 800));
  return r.result.value;
}

async function shot(s, name) {
  const img = await s('Page.captureScreenshot', { format: 'png' });
  writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
}

async function main() {
  assertMath();
  const server = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], {
    cwd: ROOT.pathname,
    stdio: 'ignore'
  });
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=9334',
    '--user-data-dir=/tmp/chrome-joe-labs-' + Date.now(),
    '--window-size=1280,900',
    'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40; i++) {
    await delay(250);
    try {
      ver = await fetch('http://127.0.0.1:9334/json/version').then((r) => r.json());
      break;
    } catch (e) { /* chrome still starting */ }
  }
  if (!ver) throw new Error('Chrome DevTools did not open');
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.addEventListener('open', res);
    ws.addEventListener('error', rej);
  });
  const { send, sessions } = cdp(ws);
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const attached = await send('Target.attachToTarget', { targetId: target.result.targetId, flatten: true });
  const session = attached.result.sessionId;
  const continued = [];
  const cdpBlocked = [];
  const finished = [];
  sessions.set(session, (msg) => {
    if (msg.method === 'Fetch.requestPaused') {
      const req = msg.params.request;
      const method = String(req.method || 'GET').toUpperCase();
      const url = req.url || '';
      const block = method !== 'GET' || /supabase/i.test(url) || /save_state|get_state|member[_-]?sync/i.test(url);
      if (block) {
        cdpBlocked.push({ method, url });
        send('Fetch.failRequest', { requestId: msg.params.requestId, errorReason: 'BlockedByClient' }, session);
      } else {
        continued.push({ method, url });
        send('Fetch.continueRequest', { requestId: msg.params.requestId }, session);
      }
    }
    if (msg.method === 'Network.responseReceived' || msg.method === 'Network.loadingFinished') {
      const url = (msg.params.response && msg.params.response.url) || msg.params.url || '';
      if (/supabase/i.test(url)) finished.push(url);
    }
  });
  const s = (method, params) => send(method, params || {}, session).then((r) => r.result);
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Network.setBlockedURLs', { urls: ['*supabase.co*', '*supabase.in*'] });
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
    await s('Network.setCacheDisabled', { cacheDisabled: true });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/jdelorenzo/?labsreview=1' });
    await delay(1600);
    await evaluate(s, `(() => { localStorage.setItem('jdelorenzo-app-theme', ${JSON.stringify(theme)}); })()`);
    await s('Page.reload', { ignoreCache: true });
    await delay(1800);
    const report = await evaluate(s, `(() => {
      const problems = [];
      const host = document.getElementById('labsbody');
      if (typeof go === 'function') go('labs');
      const themeNow = document.documentElement.getAttribute('data-theme');
      const cards = Array.from(document.querySelectorAll('#labsbody .qcard'));
      const rows = cards.map((card) => ({
        id: card.getAttribute('data-marker'),
        name: (card.querySelector('.qname') || {}).textContent || '',
        value: (card.querySelector('.qnum') || {}).textContent || '',
        unit: (card.querySelector('.qval em') || {}).textContent || '',
        source: (card.querySelector('.qsrc') || {}).textContent || '',
        read: (card.querySelector('.qread') || {}).textContent || '',
        sourceLabel: (card.querySelector('.qfield .k') || {}).textContent || '',
        readLabel: card.querySelectorAll('.qfield .k')[1] ? card.querySelectorAll('.qfield .k')[1].textContent : '',
        change: (card.querySelector('.qchg') || {}).textContent || ''
      }));
      const text = host ? host.innerText : '';
      const ranks = Array.from(document.querySelectorAll('.qtop-ranks li')).map((li) => li.textContent.trim());
      const count = host ? host.getAttribute('data-marker-count') : '';
      if (count !== '25' || cards.length !== 25) problems.push('count ' + count + '/' + cards.length);
      if (themeNow !== ${JSON.stringify(theme)}) problems.push('theme ' + themeNow);
      if (/No bloodwork on file/i.test(text)) problems.push('empty state still showing');
      const low = text.toLowerCase();
      if (/\\b\\d+\\s*\\/\\s*100\\b|overall score|all healthy/.test(low)) problems.push('score or clearance language');
      const must = [
        'Collection date:',
        'not provided',
        'November 7, 2026',
        'not a draw date',
        'not a percentage',
        '2.96',
        '3.09',
        '2.95',
        '3.08',
        'approximately consistent',
        'not exact rounding',
        '27.79',
        '27.8',
        'method unconfirmed',
        'not a particle-size diagnosis',
        'not proof of optimal therapy',
        'Not low',
        'Insufficient context',
        'urine albumin-to-creatinine ratio',
        'Not medical advice',
        '98 mg/dL',
        'Comparison date not provided',
        'Not readable'
      ];
      must.forEach((bit) => { if (!low.includes(bit.toLowerCase())) problems.push('missing ' + bit); });
      if ((low.match(/insufficient context/g) || []).length < 2) problems.push('free T and cortisol context');
      if (/optimal therapy/.test(text) && !/not proof of optimal therapy/.test(text)) problems.push('optimal therapy claim');
      if (/free T3|thyroid antibodies/i.test(text)) problems.push('routine thyroid add-ons');
      if (/2026 ACC|ACC\\/AHA dyslipidemia|once in a lifetime/i.test(text)) problems.push('unverified 2026 guideline');
      const scroll = document.getElementById('scroll');
      const overflow = scroll ? scroll.scrollWidth - scroll.clientWidth : 999;
      if (overflow > 2) problems.push('horizontal overflow ' + overflow);
      const inv = typeof INV === 'undefined' ? null : INV;
      const paidOk = typeof PAID !== 'undefined' && PAID === 610 && typeof DUE !== 'undefined' && DUE === 0 && Array.isArray(inv) && inv.every((row) => row.status === 'paid');
      if (!paidOk) problems.push('invoice data changed');
      const doses = (typeof CMP === 'undefined' ? [] : CMP).map((c) => c.n + '|' + c.d + '|' + c.u);
      if (doses.length !== 8 || !/2\\.5 mg/.test(doses[0] || '')) problems.push('protocol doses changed');
      const tile = (document.getElementById('bts-labs') || {}).textContent || '';
      if (/No bloodwork/i.test(tile) || /score/i.test(tile)) problems.push('home tile ' + tile);
      const net = window.__netlog || [];
      const badNet = net.filter((row) => row.method === 'GET' && !/supabase|save_state|get_state/i.test(row.url));
      return { problems, rows, ranks, tile, overflow, themeNow, netCount: net.length, badNet, doses, textLen: text.length };
    })()`);

    const expectedRanks = [
      'Repeat creatinine and eGFR, and add a urine albumin-to-creatinine ratio (ACR). Creatinine is 1.24 mg/dL (source app: out of range) and eGFR is 69.52 (KDIGO category G2, mildly decreased). G2 without kidney damage is not a CKD diagnosis. Review muscle mass, creatine, cooked meat, hard training, and hydration. The undated creatinine increase and eGFR drop are a reason to repeat the tests.',
      'Estradiol is 44.6 pg/mL (source app: out of range). A clinician should review symptoms, timing, and the assay. ADLM recommends a sensitive mass-spectrometry method for men. Do not change any medication, peptide, or dose from this number.'
    ];
    if (JSON.stringify(report.ranks) !== JSON.stringify(expectedRanks)) report.problems.push('top ranks mismatch');
    MARKERS.forEach((m, i) => {
      const row = report.rows[i];
      if (!row) { report.problems.push('missing row ' + m[0]); return; }
      const got = [row.id, row.name, row.value, row.unit, row.source, row.read];
      if (JSON.stringify(got) !== JSON.stringify(m)) report.problems.push('marker ' + m[0] + ' ' + JSON.stringify(got));
      if (row.sourceLabel !== 'Source app' || row.readLabel !== 'Our read') report.problems.push('labels ' + m[0]);
      if (!/Comparison date not provided/.test(row.change)) report.problems.push('change ' + m[0]);
    });

    await evaluate(s, `(() => {
      const sc = document.getElementById('scroll');
      if (sc) sc.scrollTop = 0;
      if (typeof go === 'function') go('labs');
    })()`);
    await delay(200);
    await shot(s, name + '-top');
    await evaluate(s, `(() => {
      const el = document.getElementById('lab-sec-thyroid');
      if (el) el.scrollIntoView({ block: 'start' });
    })()`);
    await delay(150);
    await shot(s, name + '-markers');
    const openId = name.startsWith('phone') ? 'lab-e2' : 'lab-creatinine';
    const opened = await evaluate(s, `(() => {
      const card = document.getElementById(${JSON.stringify(openId)});
      const summary = card && card.querySelector('summary');
      if (summary) summary.click();
      const detail = card && card.querySelector('details');
      if (card) card.scrollIntoView({ block: 'center' });
      const open = !!(detail && detail.open);
      const detailText = card ? card.innerText : '';
      return { open, hasFollow: /Needs clinician follow-up/.test(detailText), len: detailText.length };
    })()`);
    if (!opened.open || !opened.hasFollow) report.problems.push('detail did not open');
    await delay(150);
    await shot(s, name + '-detail');

    if (name === 'desktop-light') {
      await evaluate(s, `typeof go==='function' && go('pay')`);
      await delay(200);
      const pay = await evaluate(s, `(() => {
        const t = (document.getElementById('v-pay') || {}).innerText || '';
        return { paid: /Paid/.test(t), dueZero: /\\$0\\.00|0 due|paid in full/i.test(t), snippet: t.slice(0, 280) };
      })()`);
      if (!pay.paid) report.problems.push('invoice view lost paid state ' + pay.snippet);
      await shot(s, 'desktop-light-invoice');
      await evaluate(s, `typeof go==='function' && go('labs')`);
    }
    reports.push({ name, problems: report.problems, tile: report.tile, overflow: report.overflow, netCount: report.netCount, opened });
    console.log((report.problems.length ? 'FAIL ' : 'PASS ') + name + ' ' + report.problems.join(' | '));
  }

  await delay(400);
  const net = await evaluate(s, `window.__netlog || []`);
  const nonGetContinued = continued.filter((row) => row.method !== 'GET');
  const supabaseContinued = continued.filter((row) => /supabase|save_state|get_state/i.test(row.url));
  const pageNonBlocked = (net || []).filter((row) => row.method === 'GET' && !/supabase|save_state|get_state/i.test(row.url));
  const supabaseAttempts = (net || []).filter((row) => /supabase|get_state|save_state/i.test(row.url));
  const blockers = [];
  if (nonGetContinued.length) blockers.push('continued non-GET ' + nonGetContinued.length);
  if (supabaseContinued.length) blockers.push('continued supabase ' + supabaseContinued.length);
  if (finished.length) blockers.push('finished supabase ' + finished.length);
  if (pageNonBlocked.length) blockers.push('page guard blocked a plain GET');
  if (!supabaseAttempts.some((row) => row.method === 'POST')) blockers.push('no Supabase POST was attempted, so the write block was not proven');
  if (!supabaseAttempts.some((row) => row.method === 'GET')) blockers.push('no Supabase GET was attempted, so that block was not proven');
  if (supabaseAttempts.some((row) => row.method !== 'GET' && row.method !== 'POST' && row.method !== 'BEACON')) blockers.push('unexpected blocked method');

  const out = {
    reports,
    blockers,
    pageBlocked: (net || []).length,
    cdpBlocked: cdpBlocked.length,
    continuedGets: continued.length,
    sampleBlocked: (net || []).slice(0, 8),
    sampleCdp: cdpBlocked.slice(0, 8)
  };
  writeFileSync('/tmp/joe-labs-results.json', JSON.stringify(out, null, 2));
  console.log(JSON.stringify({ blockers, pageBlocked: out.pageBlocked, cdpBlocked: out.cdpBlocked, continuedGets: out.continuedGets }, null, 2));
  ws.close();
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
  const failedViews = reports.filter((r) => r.problems.length);
  if (failedViews.length || blockers.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
