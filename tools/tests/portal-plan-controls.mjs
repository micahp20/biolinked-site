/**
 * Shared portal plan controls and invoice summary strip.
 * Local static server. Every Supabase/member-sync call and every non-GET
 * is failed before the network. Invoice JSON is only read.
 * Run: node tools/tests/portal-plan-controls.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const PORT = 8786;
const ROOT = new URL('../../', import.meta.url);
const SHOTS = '/opt/cursor/artifacts/portal-plan-controls';
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
    '--remote-debugging-port=9345', '--user-data-dir=/tmp/chrome-planctl-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], { stdio: 'ignore' });
  let ver = null;
  for (let i = 0; i < 40 && !ver; i++) {
    await delay(250);
    try { ver = await fetch('http://127.0.0.1:9345/json/version').then((r) => r.json()); } catch (e) {}
  }
  if (!ver) throw new Error('Chrome did not open');
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const { send, sessions } = cdp(ws);
  const target = await send('Target.createTarget', { url: 'about:blank' });
  const attached = await send('Target.attachToTarget', { targetId: target.result.targetId, flatten: true });
  const session = attached.result.sessionId;
  const continued = [];
  let passPlan = false;
  sessions.set(session, (msg) => {
    if (msg.method !== 'Fetch.requestPaused') return;
    const req = msg.params.request;
    const method = String(req.method || 'GET').toUpperCase();
    const url = req.url || '';
    const planAsset = /portal-plan-controls\.(js|css)/.test(url);
    const block = method !== 'GET' || /supabase|save_state|get_state|member[_-]?sync|wk_push|wk_get|nut_push|nut_get|rpc\//i.test(url) || (!passPlan && planAsset);
    if (block) send('Fetch.failRequest', { requestId: msg.params.requestId, errorReason: 'BlockedByClient' }, session);
    else { continued.push({ method, url }); send('Fetch.continueRequest', { requestId: msg.params.requestId }, session); }
  });
  const s = (method, params) => send(method, params || {}, session).then((r) => r.result);
  async function evaluate(expression) {
    const r = await s('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 1200));
    return r.result.value;
  }
  async function shot(name) {
    const img = await s('Page.captureScreenshot', { format: 'png' });
    writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
  }
  async function openPage(path, w, h, theme) {
    await s('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 700 });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + path });
    await delay(900);
    if (theme) {
      await evaluate(`(() => { document.documentElement.setAttribute('data-theme', ${JSON.stringify(theme)}); return true; })()`);
    }
    await delay(400);
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

  await openPage('/mmccarthy/', 390, 844, 'light');
  await evaluate(`go('pay')`);
  await delay(300);
  await shot('before-phone-invoice');
  const beforeInvoice = await evaluate(`(() => {
    const list = document.getElementById('paylist');
    const text = list ? list.innerText : '';
    return {
      rebuild: text.includes('Wolverine 2.0 + GHK-Cu'),
      prime: text.includes('HGH (year supply) + N-Acetyl'),
      os: document.querySelectorAll('#paylist .os').length
    };
  })()`);
  check(beforeInvoice.rebuild && beforeInvoice.prime && beforeInvoice.os >= 2, 'before state did not show paid summary paragraphs: ' + JSON.stringify(beforeInvoice));
  await evaluate(`go('proto')`);
  await delay(200);
  await shot('before-phone-landing');

  passPlan = true;
  await s('Page.reload', { ignoreCache: true });
  await delay(1600);
  await evaluate(`(() => { document.documentElement.setAttribute('data-theme', 'light'); return true; })()`);
  await evaluate(`go('proto')`);
  await delay(300);
  await shot('after-phone-landing');
  await evaluate(`go('pay')`);
  await delay(300);
  await shot('after-phone-invoice');

  const paid = await evaluate(`(() => {
    const problems = [];
    const list = document.getElementById('paylist');
    const text = list ? list.innerText : '';
    const data = JSON.stringify(INV.map(o => ({ label: o.label, status: o.status, total: o.total, summary: o.summary, items: o.items })));
    window.__invSnap = data;
    window.__allSnap = JSON.stringify(ALL);
    if (document.querySelector('#payhero .bal')) problems.push('paid hero card still present');
    if (document.querySelector('#paylist .os')) problems.push('paid summary paragraph still present');
    if (text.includes('Wolverine 2.0 + GHK-Cu')) problems.push('rebuild summary still visible');
    if (text.includes('HGH (year supply) + N-Acetyl')) problems.push('prime summary still visible');
    if (!text.includes('The Rebuild')) problems.push('rebuild name missing');
    if (!text.includes('The Prime Stack')) problems.push('prime name missing');
    if (!text.includes('$164.99')) problems.push('164.99 missing');
    if (!text.includes('$1,384.94')) problems.push('1384.94 missing');
    if (!text.includes('Paid in full')) problems.push('paid-in-full row missing');
    const pills = [...document.querySelectorAll('#paylist .pill')].map(p => p.textContent.trim());
    if (!pills.includes('Paid')) problems.push('paid badge missing ' + pills.join(','));
    if (INV[0].total !== 164.99 || INV[1].total !== 1384.94) problems.push('INV totals changed');
    if (!INV[0].summary.includes('paid in full') || !INV[1].summary.includes('paid in full')) problems.push('summary data removed');
    openInv(0);
    const sum0 = document.getElementById('i-sum').textContent.trim();
    const name0 = document.getElementById('i-name').textContent;
    const items0 = document.getElementById('i-items').innerText;
    if (sum0) problems.push('payment summary still shown: ' + sum0);
    if (!name0.includes('The Rebuild')) problems.push('sheet name ' + name0);
    if (!items0.includes('$60.00') || !items0.includes('$164.99')) problems.push('sheet lines missing');
    openInv(1);
    const sum1 = document.getElementById('i-sum').textContent.trim();
    const items1 = document.getElementById('i-items').innerText;
    if (sum1) problems.push('prime payment summary still shown');
    if (!items1.includes('$1,384.94') || !items1.includes('$1,100.00')) problems.push('prime sheet lines missing');
    if (document.getElementById('i-tag').textContent.trim() !== 'Paid') problems.push('sheet badge');
    closeSheet();
    return { problems, paysum: document.getElementById('paysum').textContent };
  })()`);
  paid.problems.forEach((p) => problems.push('mmccarthy invoice: ' + p));
  check(/Paid to date/.test(paid.paysum), 'paysum missing: ' + paid.paysum);

  await evaluate(`go('sched')`);
  await delay(250);
  const opened = await evaluate(`(() => {
    const row = [...document.querySelectorAll('#doses .drow')].find(r => (r.getAttribute('data-dx') || '').includes('Cartalax'));
    if (!row) return { ok: false, reason: 'no cartalax row', names: [...document.querySelectorAll('#doses .drow')].map(r => r.getAttribute('data-dx')) };
    row.click();
    const pan = row.nextElementSibling;
    if (pan) pan.scrollIntoView({ block: 'center' });
    const ctl = pan && pan.querySelector('.blp-ctl');
    return {
      ok: !!(pan && pan.classList.contains('dx-pan') && pan.classList.contains('open') && ctl),
      note: document.getElementById('dosenote') ? document.getElementById('dosenote').textContent : '',
      buttons: ctl ? [...ctl.querySelectorAll('button')].map(b => b.textContent.trim()) : []
    };
  })()`);
  check(opened.ok, 'schedule expand controls missing: ' + JSON.stringify(opened));
  check(/Dates and removal apply to your plan on this device/.test(opened.note || ''), 'readonly label: ' + opened.note);
  await shot('after-phone-schedule-cartalax');

  await evaluate(`go('proto')`);
  const dates = await evaluate(`(() => {
    const problems = [];
    const card = [...document.querySelectorAll('#protoabout .jc-compound')].find(c => c.querySelector('summary') && c.querySelector('summary').childNodes[0].textContent.includes('Wolverine'));
    if (!card) return ['wolverine card missing'];
    card.open = true;
    const box = card.querySelector('.blp-ctl');
    if (!box) return ['protocol controls missing'];
    const cycle = card.closest('.jc-cycle').querySelector('h2').textContent.trim();
    const name = card.querySelector('summary').childNodes[0].textContent.trim();
    const start = box.querySelector('.blp-start');
    const end = box.querySelector('.blp-end');
    start.value = '2026-12-01';
    end.value = '2026-11-01';
    box.querySelector('[data-blp-act="save"]').click();
    const err = card.querySelector('.blp-err');
    if (!err || err.hidden) problems.push('invalid range did not show');
    const key = BLPlan.key(cycle, name);
    const stored = BLPlan.load().items[key];
    if (stored) problems.push('invalid range was saved');
    end.value = '2026-12-15';
    card.querySelector('[data-blp-act="save"]').click();
    const saved = BLPlan.load().items[key];
    if (!saved || saved.start !== '2026-12-01' || saved.end !== '2026-12-15') problems.push('save failed ' + JSON.stringify(saved));
    card.querySelector('.blp-start').value = '2026-12-02';
    card.querySelector('[data-blp-act="cancel"]').click();
    const afterCancel = card.querySelector('.blp-start').value;
    if (afterCancel !== '2026-12-01') problems.push('cancel left ' + afterCancel);
    if (BLPlan.load().items[key].end !== '2026-12-15') problems.push('cancel wrote storage');
    const twin = card.closest('.jc-cycle').cloneNode(true);
    twin.querySelector('h2').textContent = 'Cycle 9 · Twin';
    twin.querySelectorAll('.blp-ctl').forEach(n => n.remove());
    document.getElementById('protoabout').appendChild(twin);
    BLPlan.mount();
    const twinCard = twin.querySelector('.jc-compound');
    twinCard.open = true;
    twinCard.querySelector('.blp-start').value = '2026-01-01';
    twinCard.querySelector('.blp-end').value = '2026-02-01';
    twinCard.querySelector('[data-blp-act="save"]').click();
    const twinKey = BLPlan.key('Cycle 9 · Twin', name);
    const a = BLPlan.load().items[key];
    const b = BLPlan.load().items[twinKey];
    if (!b || b.start !== '2026-01-01') problems.push('twin key missing');
    if (!a || a.end !== '2026-12-15') problems.push('original cycle key changed');
    if (key === twinKey) problems.push('keys collided');
    twin.remove();
    window.__planKey = key;
    window.__planName = name;
    return problems;
  })()`);
  dates.forEach((p) => problems.push('dates: ' + p));

  await s('Page.reload', { ignoreCache: true });
  await delay(1500);
  const reloaded = await evaluate(`(() => {
    const problems = [];
    const card = [...document.querySelectorAll('#protoabout .jc-compound')].find(c => (c.querySelector('summary') || {}).textContent.includes('Wolverine'));
    const start = card && card.querySelector('.blp-start');
    if (!start || start.value !== '2026-12-01') problems.push('reload lost start ' + (start && start.value));
    if (card.querySelector('.blp-end').value !== '2026-12-15') problems.push('reload lost end');
    go('sched');
    const names = [...document.querySelectorAll('#doses .drow')].map(r => r.getAttribute('data-dx') || r.textContent);
    if (names.some(n => n.includes('Wolverine'))) problems.push('future start still on schedule');
    if (!names.some(n => n.includes('Cartalax'))) problems.push('other compound dropped');
    const inv = JSON.stringify(INV.map(o => ({ total: o.total, summary: o.summary, items: o.items })));
    if (INV[0].total !== 164.99 || INV[1].total !== 1384.94) problems.push('reload changed totals');
    window.__invAfter = inv;
    return problems;
  })()`);
  reloaded.forEach((p) => problems.push('reload: ' + p));

  const removed = await evaluate(`(() => {
    const problems = [];
    const allBefore = JSON.stringify(ALL);
    const invBefore = JSON.stringify(INV);
    go('proto');
    const card = [...document.querySelectorAll('#protoabout .jc-compound')].find(c => (c.querySelector('summary') || {}).textContent.includes('Wolverine'));
    card.open = true;
    const cycle = card.closest('.jc-cycle').querySelector('h2').textContent.trim();
    const name = card.querySelector('summary').childNodes[0].textContent.trim();
    const planKey = BLPlan.key(cycle, name);
    card.querySelector('[data-blp-act="ask"]').click();
    if (card.querySelector('.blp-confirm').hidden) problems.push('confirm did not open');
    card.querySelector('[data-blp-act="abort"]').click();
    if (BLPlan.load().items[planKey] && BLPlan.load().items[planKey].removed) problems.push('abort removed');
    card.querySelector('[data-blp-act="ask"]').click();
    card.querySelector('[data-blp-act="confirm"]').click();
    const rec = BLPlan.load().items[planKey];
    if (!rec || !rec.removed) problems.push('remove did not save');
    if (INV[0].total !== 164.99) problems.push('remove changed invoice');
    const still = [...document.querySelectorAll('#protoabout .jc-compound')].some(c => (c.querySelector('summary') || {}).textContent.includes('Wolverine'));
    if (!still) problems.push('remove deleted the protocol card');
    const live = [...document.querySelectorAll('#protoabout .jc-compound')].find(c => (c.querySelector('summary') || {}).textContent.includes('Wolverine'));
    if (!live.querySelector('[data-blp-act="restore"]')) problems.push('restore missing');
    go('sched');
    if ([...document.querySelectorAll('#doses .drow')].some(r => (r.getAttribute('data-dx') || '').includes('Wolverine'))) problems.push('removed compound still scheduled');
    go('proto');
    const again = [...document.querySelectorAll('#protoabout .jc-compound')].find(c => (c.querySelector('summary') || {}).textContent.includes('Wolverine'));
    again.querySelector('[data-blp-act="restore"]').click();
    if (BLPlan.load().items[planKey].removed) problems.push('restore left removed');
    again.querySelector('[data-blp-act="clear"]').click();
    if (BLPlan.load().items[planKey]) problems.push('clear left a record');
    if (JSON.stringify(ALL) !== allBefore) problems.push('ALL changed');
    if (JSON.stringify(INV) !== invBefore) problems.push('INV changed');
    return problems;
  })()`);
  removed.forEach((p) => problems.push('remove: ' + p));

  const mmStore = await evaluate(`localStorage.getItem('biolinked-planwin-mmccarthy')`);
  await openPage('/annaleah/', 390, 844, 'light');
  const anna = await evaluate(`(() => {
    const problems = [];
    go('pay');
    const text = document.getElementById('paylist').innerText;
    if (document.querySelector('#paylist .os')) problems.push('quote summary paragraph remains');
    if (document.querySelector('#payhero .bal')) problems.push('quote hero remains');
    if (!text.includes('$434.96')) problems.push('434.96 missing');
    if (!text.includes('Pay now')) problems.push('pay now missing');
    if (text.includes('1× Retatrutide 30 mg · 2× Tesamorelin')) problems.push('quote summary visible');
    if (INV[0].total !== 434.96) problems.push('annaleah total changed');
    if (!INV[0].summary.includes('Retatrutide')) problems.push('annaleah summary data removed');
    const paysum = document.getElementById('paysum').textContent;
    if (!paysum.includes('$434.96')) problems.push('paysum ' + paysum);
    if (localStorage.getItem('biolinked-planwin-annaleah')) problems.push('annaleah inherited plan storage');
    return { problems, paysum };
  })()`);
  anna.problems.forEach((p) => problems.push('annaleah: ' + p));
  check(await evaluate(`localStorage.getItem('biolinked-planwin-mmccarthy')`) === mmStore, 'annaleah visit changed mmccarthy plan storage');

  await openPage('/mmccarthy/', 390, 844, 'light');
  check(await evaluate(`localStorage.getItem('biolinked-planwin-mmccarthy')`) === mmStore, 'return to mmccarthy lost plan storage');

  await openPage('/dbejar/', 390, 844, 'light');
  const dbejar = await evaluate(`(() => {
    const problems = [];
    if (typeof go === 'function') go('pay');
    const text = (document.getElementById('paylist') || {}).innerText || '';
    if (document.querySelector('#paylist .os')) problems.push('legacy summary remains');
    if (!text.includes('$380.00')) problems.push('paid 380 missing');
    if (!text.includes('Fat Loss')) problems.push('paid cycle name missing');
    const paid = INV.find(o => o.status === 'paid');
    if (!paid || paid.total !== 380) problems.push('paid record changed');
    if (paid && text.includes(paid.summary)) problems.push('paid summary paragraph visible');
    return problems;
  })()`);
  dbejar.forEach((p) => problems.push('dbejar: ' + p));

  await openPage('/mpauldino/hb/', 1280, 900, 'light');
  const hb = await evaluate(`(() => {
    const problems = [];
    if (!window.__blPlanControls) problems.push('script did not load');
    const before = INV.length;
    INV.push({
      label: 'Paid Order 1 · Cycle 1 · The Rebuild',
      status: 'paid',
      total: 164.99,
      summary: 'Wolverine 2.0 + GHK-Cu + Cartalax + BAC water + shipping · $164.99 · paid in full',
      items: [{ n: 'Wolverine 2.0 20 mg × 1 vial @ $60', amt: 60 }, { n: 'Shipping', amt: 9.99 }]
    });
    renderPay();
    const text = document.getElementById('paylist').innerText;
    if (document.querySelector('#paylist .os')) problems.push('hb summary remains');
    if (!text.includes('The Rebuild') || !text.includes('$164.99') || !text.includes('Paid')) problems.push('hb rows missing: ' + text.slice(0, 240));
    openInv(INV.length - 1);
    if ((document.getElementById('i-sum').textContent || '').trim()) problems.push('hb i-sum remains');
    if (!document.getElementById('i-items').innerText.includes('$60.00')) problems.push('hb line missing');
    INV.pop();
    renderPay();
    if (INV.length !== before) problems.push('hb fixture left data');
    return problems;
  })()`);
  hb.forEach((p) => problems.push('hb: ' + p));

  const views = [
    [360, 800, 'light'],
    [390, 844, 'light'],
    [430, 932, 'light'],
    [1280, 900, 'light'],
    [390, 844, 'dark'],
    [1280, 900, 'dark']
  ];
  for (const [w, h, theme] of views) {
    await openPage('/mmccarthy/', w, h, theme);
    const layout = await evaluate(`(() => {
      const problems = [];
      const phone = ${w} <= 480;
      const cta = document.querySelector('#v-proto .lx-cta');
      const tile = document.querySelector('#v-proto .bl-tile');
      const title = document.querySelector('#v-proto .lx-title');
      if (cta) {
        const fs = parseFloat(getComputedStyle(cta).fontSize);
        const mh = parseFloat(getComputedStyle(cta).minHeight);
        if (phone && (fs > 18 || mh > 48)) problems.push('cta still large ' + fs + '/' + mh);
        if (!phone && fs < 20) problems.push('desktop cta collapsed ' + fs);
      }
      if (tile && phone) {
        const mh = parseFloat(getComputedStyle(tile).minHeight);
        if (mh > 52) problems.push('tile still tall ' + mh);
      }
      if (title && phone && parseFloat(getComputedStyle(title).fontSize) > 32) problems.push('title still large');
      const btn = document.querySelector('.bls-bar .bls-btn');
      if (btn && phone && parseFloat(getComputedStyle(btn).minHeight) < 44) problems.push('back button under 44');
      const root = document.getElementById('scroll') || document.documentElement;
      if (root.scrollWidth > root.clientWidth + 2) problems.push('overflow ' + root.scrollWidth + '>' + root.clientWidth);
      if (document.documentElement.scrollWidth > window.innerWidth + 2) problems.push('page overflow');
      return problems;
    })()`);
    layout.forEach((p) => problems.push('layout ' + w + ' ' + theme + ': ' + p));
  }

  await openPage('/mmccarthy/', 390, 844, 'dark');
  await evaluate(`go('pay')`);
  await delay(200);
  await shot('after-phone-invoice-dark');

  const leaked = continued.filter((r) => r.method !== 'GET' || /supabase|save_state|get_state|member[_-]?sync|rpc\//i.test(r.url));
  check(leaked.length === 0, 'network continued blocked calls: ' + JSON.stringify(leaked.slice(0, 5)));
  const pageLog = await evaluate(`window.__netlog || []`);
  check(Array.isArray(pageLog), 'net log missing');

  console.log(JSON.stringify({ problems, continuedBlocked: leaked.length, pageBlocks: pageLog.length }, null, 2));
  ws.close();
  server.kill();
  chrome.kill();
  if (problems.length) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
