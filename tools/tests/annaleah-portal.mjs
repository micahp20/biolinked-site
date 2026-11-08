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
      if (document.getElementById('alref')) problems.push('custom reference block');
      const box = document.getElementById('protoabout');
      const text = box ? box.textContent : '';
      const head = box ? box.querySelector('.jc-cycle-head h2') : null;
      if (!head || head.textContent !== 'Cycle 1 · Fat Loss') problems.push('cycle head ' + (head && head.textContent));
      if (!box || !box.querySelector('.jc-compound')) problems.push('missing Jamie compound card');
      if (/prescriber|supplied reference|not an active schedule|Master Cycle 1|Why these together|About this plan/i.test(text)) problems.push('rejected wording');
      const who = document.querySelector('.who .wn');
      if (!who || who.textContent.trim() !== 'Annaleah') problems.push('header ' + (who && who.textContent));
      if (/Jamie|Cress|Paul/.test(document.body.innerText)) problems.push('other client name visible');
      const need = [
        'start 0.5 mg (titrate slow)',
        '5u',
        'Mon + Thu, 1 mg/wk, hold >=4 wks',
        'step up only if appetite control fades & nausea quiet',
        '20mg only (10mg retired); one 20mg = 2x the 10mg',
        '~1.33 mg',
        'M/W/F',
        '50 mg',
        '25u',
        'M/W/F, push slowly',
        '500 mcg',
        'Timing not provided',
        '10u',
        'titrate'
      ];
      need.forEach((s) => { if (!text.includes(s)) problems.push('missing ' + s); });
      if ((text.match(/Timing not provided/g) || []).length < 2) problems.push('blank timing count');
      if (/1 → 3 mg|10 → 30u|Semax|Wolverine|Sixty|60 mg vial/.test(text)) problems.push('Jamie protocol copied');
      const kpv = ALL.find((c) => c.n.indexOf('KPV') === 0);
      const cag = ALL.find((c) => c.n.indexOf('Cagrilintide') === 0);
      if (!kpv || kpv.u || (kpv.days && kpv.days.length) || kpv.c !== 'Timing not provided') problems.push('kpv invented timing');
      if (!cag || cag.u !== '10u' || (cag.days && cag.days.length) || cag.c !== 'Timing not provided') problems.push('cagri timing');
      if (CYC.length !== 1 || CYC[0].n !== 'Cycle 1 · Fat Loss') problems.push('extra cycles');
      if (document.documentElement.getAttribute('data-theme') !== ${JSON.stringify(theme)}) problems.push('theme');
      if (!(PAID === 0 && DUE === 0 && INV.length === 1 && INV[0].status === 'quote' && INV[0].total === 434.96 && ALL.length === 6)) problems.push('invoice data');
      const defs = box.querySelectorAll('.bl-compound-definition').length;
      const roles = box.querySelectorAll('.bl-compound-role').length;
      if (defs !== 6 || roles !== 6) problems.push('explanations ' + defs + '/' + roles);
      if (!/Role in this plan/.test(text)) problems.push('role label');
      if (!/does not by itself establish the benefit of injections/.test(text)) problems.push('nad limit');
      if (CS_SLUG !== 'annaleah' || SCHKEY !== 'biolinked-sched-annaleah' || KP !== 'annaleah-app-') problems.push('identity keys');
      if (nutState.age !== 32 || nutState.heightIn !== 68 || nutState.weightLb !== null || nutState.sex !== '' || nutState.goal !== 'maintain') problems.push('nut state');
      const sexOn = document.querySelectorAll('#v-nutr .nut-seg-btn[data-grp="sex"].on').length;
      if (sexOn !== 0) problems.push('sex selected');
      const weight = document.getElementById('nut-w');
      if (!weight || weight.value !== '' || weight.placeholder !== '158–163') problems.push('weight filled');
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
      const card = document.querySelector('.jc-compound');
      const h2 = document.querySelector('.jc-cycle-head h2');
      const title = document.querySelector('.lx-title');
      const styleOf = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { font: cs.fontFamily, size: cs.fontSize, radius: cs.borderRadius, bg: cs.backgroundColor, color: cs.color };
      };
      return { problems, style: { card: styleOf(card), h2: styleOf(h2), title: styleOf(title) } };
    })()`);
    await evaluate(`(() => {
      if (typeof go==='function') go('proto');
      const sc = document.getElementById('scroll');
      const el = document.getElementById('protoabout');
      if (sc && el) sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 12);
    })()`);
    await delay(180);
    await shot(name);
    if (name === 'desktop-light') {
      await evaluate(`typeof go==='function' && go('pay')`);
      await delay(250);
      const pay = await evaluate(`(() => {
        const text = (document.getElementById('v-pay') || {}).innerText || '';
        const problems = [];
        if (!/\\$434\\.96/.test(text)) problems.push('total ' + text.slice(0, 220));
        if (!/\\$50\\.00/.test(text) || !/\\$120\\.00/.test(text) || !/\\$100\\.00/.test(text) || !/\\$40\\.00/.test(text) || !/\\$14\\.97/.test(text) || !/\\$9\\.99/.test(text)) problems.push('line prices');
        if (/Pending|FREE|Paid in full/.test(text)) problems.push('wrong commercial state');
        if (!document.querySelector('#v-pay .invoice-pay-now')) problems.push('pay now missing');
        if (document.querySelectorAll('#payhero .bal').length !== 0) problems.push('top quote card');
        if (document.querySelectorAll('#paylist .ocard').length !== 1) problems.push('invoice card count');
        if (document.querySelector('#paylist .os')) problems.push('summary paragraph');
        if (!/Cycle 1 · Fat Loss/.test(text) || !/QUOTE/.test(text)) problems.push('heading');
        return { problems, head: text.slice(0, 300) };
      })()`);
      report.problems.push(...pay.problems);
      await shot('desktop-light-invoice');
      await evaluate(`(() => {
        if (typeof go==='function') go('proto');
        const card = document.querySelector('#protoabout details.jc-compound');
        if (card) card.open = true;
        const sc = document.getElementById('scroll');
        if (sc && card) sc.scrollTop = Math.max(0, card.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 12);
      })()`);
      await delay(200);
      await shot('annaleah-expanded');
      const modal = await evaluate(`(() => {
        const problems = [];
        const sheet = document.getElementById('s-inv');
        function links() {
          return Array.from(document.querySelectorAll('#i-pay a, #i-pay button')).map((el) => ({
            cls: el.className,
            href: el.getAttribute('href') || '',
            note: el.getAttribute('data-note') || '',
            text: (el.textContent || '').replace(/\\s+/g, ' ').trim()
          }));
        }
        openInv(0);
        if (!sheet.classList.contains('on')) problems.push('modal did not open');
        let rows = links();
        closeSheet();
        if (sheet.classList.contains('on')) problems.push('modal did not close');
        openInv(0);
        if (!sheet.classList.contains('on')) problems.push('modal did not reopen');
        rows = links();
        const venmo = rows.find((r) => r.cls.indexOf('vm') >= 0);
        const cash = rows.find((r) => r.cls.indexOf('ca') >= 0);
        const zelle = rows.find((r) => r.cls.indexOf('zl') >= 0);
        if (!venmo || venmo.href !== 'https://venmo.com/u/Micahp20' || venmo.note !== 'BioLinked — Annaleah — Cycle 1') problems.push('venmo ' + JSON.stringify(venmo));
        if (!cash || cash.href !== 'https://cash.app/$micahpauldino/434.96') problems.push('cash ' + JSON.stringify(cash));
        if (!zelle || zelle.text.indexOf('720-938-0698') < 0) problems.push('zelle ' + JSON.stringify(zelle));
        const body = (document.getElementById('i-items') || {}).innerText || '';
        if (!/\\$434\\.96/.test(body) || !/\\$14\\.97/.test(body) || !/2-Day UPS/.test(body)) problems.push('modal lines');
        if ((document.getElementById('i-sum') || {}).textContent) problems.push('modal summary');
        if (!/Cycle 1 · Fat Loss/.test((document.getElementById('i-name') || {}).textContent || '')) problems.push('modal title');
        return { problems, rows };
      })()`);
      report.problems.push(...modal.problems);
      await evaluate(`(() => { const s=document.getElementById('s-inv'); const b=document.querySelector('#i-pay'); if(s&&b) s.scrollTop=Math.max(0,b.offsetTop-24); })()`);
      await delay(150);
      await shot('annaleah-pay-modal');
      await evaluate(`typeof closeSheet==='function' && closeSheet()`);
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
        const cards = document.querySelectorAll('#protoabout .jc-compound');
        const el = cards[cards.length - 1];
        sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 88);
      })()`);
      await delay(150);
      await shot('phone-light-addons');
      await evaluate(`typeof go==='function' && go('pay')`);
      await delay(200);
      const phoneInvoice = await evaluate(`(() => {
        const problems = [];
        const text = (document.getElementById('v-pay') || {}).innerText || '';
        if (document.querySelectorAll('#payhero .bal').length !== 0) problems.push('phone top quote card');
        if (document.querySelectorAll('#paylist .ocard').length !== 1) problems.push('phone invoice cards');
        if (document.querySelector('#paylist .os')) problems.push('phone summary');
        if (!/Cycle 1 · Fat Loss/.test(text) || !/QUOTE/.test(text)) problems.push('phone heading');
        if (!/\\$434\\.96/.test(text) || !/\\$14\\.97/.test(text) || !/\\$9\\.99/.test(text)) problems.push('phone lines');
        if (!document.querySelector('#v-pay .invoice-pay-now')) problems.push('phone pay now');
        return problems;
      })()`);
      report.problems.push(...phoneInvoice);
      await shot('phone-invoice');
      await evaluate(`typeof openInv==='function' && openInv(0)`);
      await delay(200);
      const phonePay = await evaluate(`(() => {
        const problems = [];
        const sheet = document.getElementById('s-inv');
        if (!sheet || !sheet.classList.contains('on')) problems.push('phone modal');
        const cash = document.querySelector('#i-pay a.ca');
        if (!cash || cash.getAttribute('href') !== 'https://cash.app/$micahpauldino/434.96') problems.push('phone cash');
        if (!/\\$434\\.96/.test((document.getElementById('i-items')||{}).innerText||'')) problems.push('phone total');
        return problems;
      })()`);
      report.problems.push(...phonePay);
      await shot('phone-pay-modal');
      await evaluate(`typeof closeSheet==='function' && closeSheet()`);
    }
    reports.push({ name, problems: report.problems });
    console.log((report.problems.length ? 'FAIL ' : 'PASS ') + name + ' ' + report.problems.join(' | '));
  }
  const net = await evaluate(`window.__netlog || []`);
  const parity = { problems: [] };
  async function cycleShot(slug, file, theme) {
    await s('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/' + slug + '/' });
    await delay(800);
    await evaluate(`localStorage.setItem(${JSON.stringify(slug + '-app-theme')}, ${JSON.stringify(theme || 'light')})`);
    await s('Page.reload', { ignoreCache: true });
    await delay(1600);
    const style = await evaluate(`(() => {
      if (typeof go==='function') go('proto');
      const sc = document.getElementById('scroll');
      const el = document.getElementById('protoabout');
      if (sc && el) sc.scrollTop = Math.max(0, el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 12);
      const card = document.querySelector('.jc-compound');
      const h2 = document.querySelector('.jc-cycle-head h2');
      const title = document.querySelector('.lx-title');
      const grab = (el) => {
        if (!el) return null;
        const cs = getComputedStyle(el);
        return { font: cs.fontFamily, size: cs.fontSize, radius: cs.borderRadius, weight: cs.fontWeight, lh: cs.lineHeight };
      };
      return { card: grab(card), h2: grab(h2), title: grab(title), who: (document.querySelector('.who .wn')||{}).textContent || '' };
    })()`);
    await delay(120);
    await shot(file);
    return style;
  }
  const annaleahStyle = await cycleShot('annaleah', 'annaleah-cycles', 'light');
  const jamieStyle = await cycleShot('jcress', 'jcress-cycles', 'light');
  ['card', 'h2', 'title'].forEach((key) => {
    if (JSON.stringify(annaleahStyle[key]) !== JSON.stringify(jamieStyle[key])) {
      parity.problems.push(key + ' ' + JSON.stringify({ annaleah: annaleahStyle[key], jamie: jamieStyle[key] }));
    }
  });
  if (annaleahStyle.who.trim() !== 'Annaleah' || jamieStyle.who.trim() !== 'Jamie Cress') parity.problems.push('names ' + annaleahStyle.who + ' / ' + jamieStyle.who);
  await s('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/annaleah/' });
  await delay(500);
  await evaluate(`localStorage.setItem('annaleah-app-theme','light')`);
  await s('Page.reload', { ignoreCache: true });
  await delay(1400);
  await evaluate(`(() => { if (typeof go==='function') go('proto'); const sc=document.getElementById('scroll'); const el=document.getElementById('protoabout'); if(sc&&el) sc.scrollTop=Math.max(0, el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-8); })()`);
  await shot('annaleah-cycles-phone');
  await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/jcress/' });
  await delay(500);
  await evaluate(`localStorage.setItem('jcress-app-theme','light')`);
  await s('Page.reload', { ignoreCache: true });
  await delay(1400);
  await evaluate(`(() => { if (typeof go==='function') go('proto'); const sc=document.getElementById('scroll'); const el=document.getElementById('protoabout'); if(sc&&el) sc.scrollTop=Math.max(0, el.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-8); })()`);
  await shot('jcress-cycles-phone');
  await s('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  await s('Page.navigate', { url: 'http://127.0.0.1:' + PORT + '/jcress/' });
  await delay(500);
  await evaluate(`localStorage.setItem('jcress-app-theme','light')`);
  await s('Page.reload', { ignoreCache: true });
  await delay(1400);
  await evaluate(`(() => { if (typeof go==='function') go('proto'); const card=document.querySelector('#protoabout details.jc-compound'); if(card) card.open=true; const sc=document.getElementById('scroll'); if(sc&&card) sc.scrollTop=Math.max(0, card.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-12); })()`);
  await shot('jcress-expanded');
  await evaluate(`typeof go==='function' && go('pay')`);
  await delay(200);
  await shot('jcress-invoice');
  console.log(parity.problems.length ? 'FAIL parity ' + parity.problems.join(' | ') : 'PASS parity');
  const blockers = [];
  if (continued.some((row) => row.method !== 'GET')) blockers.push('continued non-GET');
  if (continued.some((row) => /supabase/i.test(row.url))) blockers.push('continued supabase');
  if (!(net || []).some((row) => row.method === 'POST' && /supabase|get_state/i.test(row.url))) blockers.push('member sync was not attempted');
  writeFileSync('/tmp/annaleah-results.json', JSON.stringify({ reports, blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  console.log(JSON.stringify({ blockers, blocked: (net || []).length, continued: continued.length }, null, 2));
  ws.close();
  chrome.kill('SIGKILL');
  server.kill('SIGKILL');
  if (reports.some((r) => r.problems.length) || blockers.length || parity.problems.length) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
