/**
 * Regression: calculator Add to list / Add to schedule / Add compound.
 * Uses headless Chrome against the local static site. Supabase and other
 * mutation hosts are blocked. Does not read or write production client state.
 *
 * Run: node tools/tests/calc-add-actions.mjs
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

const ROOT = new URL('../../', import.meta.url);
const PORT = 8765;
const SHOTS = '/tmp/calc-add-shots';
mkdirSync(SHOTS, { recursive: true });

const PAGES = [
  ['nprince', '/nprince/', 'schedule-controls'],
  ['erica', '/erica/', 'erica-standard'],
  ['dbejar', '/dbejar/', 'older-no-parent-capture'],
  ['cpauldino', '/cpauldino/', 'gk-schedule'],
  ['mpauldino', '/mpauldino/', 'gk-editor'],
  ['hb', '/mpauldino/hb/', 'silent-legacy']
];
const VIEWS = [
  ['desktop', 1280, 900, false],
  ['mobile', 390, 844, true]
];

function walk(dir, out=[]) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = dir + '/' + name;
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function staticCoverage() {
  const files = walk(ROOT.pathname.replace(/\/$/, ''));
  const html = files.filter(f => f.endsWith('.html'));
  const withBtn = html.filter(f => readFileSync(f, 'utf8').includes('id="pc-addbtn"'));
  const missing = withBtn.filter(f => !readFileSync(f, 'utf8').includes('/calc-feedback.js?v=1'));
  const sw = files.filter(f => f.endsWith('/sw.js'));
  const swForBtn = sw.filter(f => {
    const index = f.replace(/sw\.js$/, 'index.html');
    try { return readFileSync(index, 'utf8').includes('id="pc-addbtn"'); }
    catch { return false; }
  });
  const swMissing = swForBtn.filter(f => !readFileSync(f, 'utf8').includes('calc-feedback.js'));
  return {
    calculatorPages: withBtn.length,
    missingScript: missing.map(f => f.replace(ROOT.pathname, '')),
    siblingWorkers: swForBtn.length,
    workersMissingScript: swMissing.map(f => f.replace(ROOT.pathname, ''))
  };
}

let msgId = 0;
function cdp(ws) {
  const pending = new Map();
  const sessions = new Map();
  ws.addEventListener('message', ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const {resolve, reject} = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg);
    } else if (msg.method && sessions.has(msg.sessionId || '')) {
      sessions.get(msg.sessionId || '')(msg);
    }
  });
  function send(method, params={}, sessionId) {
    const id = ++msgId;
    return new Promise((resolve, reject) => {
      pending.set(id, {resolve, reject});
      const payload = {id, method, params};
      if (sessionId) payload.sessionId = sessionId;
      ws.send(JSON.stringify(payload));
    });
  }
  return {send, sessions};
}

async function main() {
  const coverage = staticCoverage();
  if (coverage.missingScript.length || coverage.workersMissingScript.length) {
    console.log(JSON.stringify(coverage, null, 2));
    throw new Error('coverage gap');
  }
  const chrome = spawn('/usr/bin/google-chrome', [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage',
    '--remote-debugging-port=9333', '--user-data-dir=/tmp/chrome-calc-actions-' + Date.now(),
    '--window-size=1280,900', 'about:blank'
  ], {stdio:'ignore'});
  await delay(700);
  const ver = await fetch('http://127.0.0.1:9333/json/version').then(r => r.json());
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.addEventListener('open', res); ws.addEventListener('error', rej); });
  const {send, sessions} = cdp(ws);
  const target = await send('Target.createTarget', {url:'about:blank'});
  const attached = await send('Target.attachToTarget', {targetId: target.result.targetId, flatten: true});
  const session = attached.result.sessionId;
  const logs = [];
  const blocked = [];
  sessions.set(session, msg => {
    if (msg.method === 'Runtime.exceptionThrown') {
      const d = msg.params.exceptionDetails;
      logs.push('EXC ' + ((d.exception && (d.exception.description || d.exception.value)) || d.text));
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      logs.push('ERR ' + msg.params.args.map(a => a.value || a.description || '').join(' '));
    }
    if (msg.method === 'Fetch.requestPaused') {
      const url = msg.params.request.url;
      blocked.push(url);
      send('Fetch.failRequest', {requestId: msg.params.requestId, errorReason: 'BlockedByClient'}, session);
    }
  });
  const s = (method, params) => send(method, params || {}, session).then(r => r.result);
  await s('Page.enable');
  await s('Runtime.enable');
  await s('Network.enable');
  await s('Fetch.enable', {patterns: [
    {urlPattern: '*supabase.co*', requestStage: 'Request'},
    {urlPattern: '*stripe.com*', requestStage: 'Request'},
    {urlPattern: '*cash.app*', requestStage: 'Request'},
    {urlPattern: '*venmo.com*', requestStage: 'Request'}
  ]});

  const results = [];
  for (const [id, path, variant] of PAGES) {
    for (const [view, w, h, mobile] of VIEWS) {
      const name = id + '-' + view;
      logs.length = 0;
      await s('Emulation.setDeviceMetricsOverride', {width: w, height: h, deviceScaleFactor: 1, mobile});
      await s('Network.setCacheDisabled', {cacheDisabled: true});
      await s('Page.navigate', {url: 'http://127.0.0.1:' + PORT + path + '?calcact=1'});
      await delay(1400);
      await evaluate(s, `(() => { try { localStorage.clear(); } catch (e) {} })()`);
      await s('Page.reload', {ignoreCache: true});
      await delay(1400);
      const out = await evaluate(s, `(() => {
        const guard = {
          inv: typeof INV === 'undefined' ? null : JSON.stringify(INV),
          all: typeof ALL === 'undefined' ? null : JSON.stringify((ALL||[]).map(c => ({n:c.n,d:c.d,u:c.u,rec:c.rec,days:c.days,b:c.b}))),
          due: typeof DUE === 'undefined' ? null : DUE,
          paid: typeof PAID === 'undefined' ? null : PAID
        };
        try { localStorage.setItem('bl-weekday-probe', 'keep-mon'); } catch (e) {}
        if (typeof sheet === 'function') sheet('calc');
        return {guard, hasAdd: !!document.getElementById('pc-addbtn'), hasSch: !!(document.getElementById('pc-schbtn') || document.getElementById('pc-schedbtn')), hasEd: !!document.getElementById('ed-addbtn'), hasGk: !!document.getElementById('gkAddBtn')};
      })()`);
      await delay(500);
      await evaluate(s, `(() => {
        const sel = document.getElementById('pc-compound');
        const name = document.getElementById('pc-name');
        const vial = document.getElementById('pc-vial');
        const bac = document.getElementById('pc-bac');
        const dose = document.getElementById('pc-dose');
        function fire(el){ if(!el) return; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
        if (sel) { sel.value = '__custom__'; fire(sel); }
        if (name) { name.value = ''; fire(name); }
        if (vial) { vial.value = '0'; fire(vial); }
        if (bac) { bac.value = '0'; fire(bac); }
        if (dose) { dose.value = '0'; fire(dose); }
      })()`);
      const emptyClick = await clickButton(s, 'pc-addbtn');
      await delay(180);
      const empty = await evaluate(s, toastState());
      await shot(s, name + '-empty');
      const filled = await evaluate(s, `(() => {
        const sel = document.getElementById('pc-compound');
        const name = document.getElementById('pc-name');
        const vial = document.getElementById('pc-vial');
        const bac = document.getElementById('pc-bac');
        const dose = document.getElementById('pc-dose');
        const unit = document.getElementById('pc-doseunit');
        function fire(el){ if(!el) return; el.dispatchEvent(new Event('input', {bubbles:true})); el.dispatchEvent(new Event('change', {bubbles:true})); }
        if (sel) { sel.value = '__custom__'; fire(sel); }
        if (name) { name.value = 'Test Draw'; fire(name); }
        if (vial) { vial.value = '10'; fire(vial); }
        if (bac) { bac.value = '2'; fire(bac); }
        if (dose) { dose.value = '1'; fire(dose); }
        if (unit) { unit.value = 'mg'; fire(unit); }
        const customUnit = document.getElementById('pc-vialunit');
        if (customUnit) { customUnit.value = 'mg'; fire(customUnit); }
        return {vial: vial && vial.value, bac: bac && bac.value, dose: dose && dose.value, name: name && name.value};
      })()`);
      const addClick = await clickButton(s, 'pc-addbtn');
      await delay(250);
      const added = await evaluate(s, `(() => {
        const item = document.querySelector('#pc-list .pc-item');
        const toast = document.getElementById('bl-calc-toast');
        const r = item && item.getBoundingClientRect();
        const t = toast && toast.getBoundingClientRect();
        return {
          list: (document.getElementById('pc-list') || {}).innerText || '',
          toast: toast ? toast.textContent : '',
          toastOn: !!(toast && toast.classList.contains('on')),
          itemVisible: !!(r && r.width > 0 && r.bottom > 0 && r.top < innerHeight),
          toastVisible: !!(t && t.width > 0 && t.bottom > 0 && t.top < innerHeight && toast.classList.contains('on')),
          hit: ${'null'}
        };
      })()`);
      await shot(s, name + '-added');
      await s('Page.reload', {ignoreCache: true});
      await delay(1600);
      await evaluate(s, `typeof sheet==='function' && sheet('calc')`);
      await delay(400);
      const reloaded = await evaluate(s, `(document.getElementById('pc-list')||{}).innerText || ''`);
      let schedule = {skipped: true};
      const schId = await evaluate(s, `document.getElementById('pc-schbtn') ? 'pc-schbtn' : (document.getElementById('pc-schedbtn') ? 'pc-schedbtn' : '')`);
      if (schId) {
        let sized = await evaluate(s, `(() => { const b=document.getElementById(${JSON.stringify('X')}); return b ? b.getBoundingClientRect().width : 0; })()`.replace('"X"', JSON.stringify(schId)));
        if (sized < 2) {
          await evaluate(s, `(() => { if (typeof KP==='string') localStorage.setItem(KP+'unlocked','1'); })()`);
          await s('Page.reload', {ignoreCache: true});
          await delay(1400);
          await evaluate(s, `typeof sheet==='function' && sheet('calc')`);
          schedule.unlockedForTest = true;
        }
        await evaluate(s, `typeof sheet==='function' && sheet('calc')`);
        await delay(200);
        const schClick = await clickButton(s, schId);
        await delay(250);
        schedule = await evaluate(s, `(() => {
          const pan = document.getElementById('sa-pan');
          const sheet = document.getElementById('s-sched-add');
          const toast = document.getElementById('bl-calc-toast');
          const box = pan && !pan.hidden ? pan : (sheet && sheet.classList.contains('on') ? sheet : null);
          const r = box && box.getBoundingClientRect();
          const t = toast && toast.getBoundingClientRect();
          const day = document.querySelector('#sa-pan input[type=checkbox], #sa-days [data-saday]');
          return {
            opened: !!box, openVisible: !!(r && r.width>0 && r.bottom>0 && r.top<innerHeight),
            toast: toast ? toast.textContent : '',
            toastVisible: !!(t && toast.classList.contains('on') && t.top < innerHeight && t.bottom > 0),
            hasDay: !!day
          };
        })()`);
        if (schedule.hasDay) {
          await evaluate(s, `(() => {
            const box = document.querySelector('#sa-pan input[type=checkbox]');
            if (box && !box.checked) box.click();
            const gk = document.querySelector('#sa-days [data-saday="1"]');
            if (gk) gk.click();
          })()`);
          await delay(120);
          const saveId = await evaluate(s, `document.querySelector('#sa-pan [data-x="save"]') ? 'save-pan' : (document.getElementById('sa-confirm') ? 'sa-confirm' : '')`);
          if (saveId === 'sa-confirm') await clickButton(s, 'sa-confirm');
          else if (saveId === 'save-pan') {
            const pos = await evaluate(s, `(() => { const b=document.querySelector('#sa-pan [data-x="save"]'); b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,disabled:b.disabled,text:b.textContent}; })()`);
            await mouse(s, pos.x, pos.y);
            schedule.save = pos;
          }
          await delay(250);
          schedule.afterSave = await evaluate(s, `(() => {
            const toast = document.getElementById('bl-calc-toast');
            const cloud = document.querySelector('.cs-toast.on');
            return {
              toast: toast ? toast.textContent : '',
              toastOn: !!(toast && toast.classList.contains('on')),
              cloud: cloud ? cloud.textContent : '',
              doses: ((document.getElementById('doses')||{}).innerText||'').slice(0,240),
              gk: ((document.getElementById('gkList')||{}).innerText||'').slice(0,240)
            };
          })()`);
        }
        schedule.schClick = schClick;
        await shot(s, name + '-schedule');
      }
      let compound = {skipped: true};
      const hasEd = await evaluate(s, `!!document.getElementById('ed-addbtn')`);
      if (hasEd && view === 'desktop') {
        await evaluate(s, `typeof closeSheet==='function' && closeSheet(); typeof go==='function' && go('sched');`);
        await delay(300);
        const edClick = await clickButton(s, 'ed-addbtn');
        await delay(200);
        compound = await evaluate(s, `(() => {
          const pan = document.getElementById('ed-addpan');
          const toast = document.getElementById('bl-calc-toast');
          const r = pan && pan.getBoundingClientRect();
          return {hidden: !pan || pan.hidden, visible: !!(r && !pan.hidden && r.bottom>0 && r.top<innerHeight && r.width>0), toast: toast ? toast.textContent : ''};
        })()`);
        compound.edClick = edClick;
        await shot(s, name + '-compound');
      }
      const preserved = await evaluate(s, `(() => {
        const now = {
          inv: typeof INV === 'undefined' ? null : JSON.stringify(INV),
          all: typeof ALL === 'undefined' ? null : JSON.stringify((ALL||[]).map(c => ({n:c.n,d:c.d,u:c.u,rec:c.rec,days:c.days,b:c.b}))),
          due: typeof DUE === 'undefined' ? null : DUE,
          paid: typeof PAID === 'undefined' ? null : PAID,
          probe: localStorage.getItem('bl-weekday-probe')
        };
        return now;
      })()`);
      const row = {
        name, variant, view,
        emptyClick, empty,
        filled, addClick, added,
        reloadedHasTest: String(reloaded).includes('Test Draw'),
        schedule, compound,
        preserved: preserved.inv === out.guard.inv && preserved.all === out.guard.all && preserved.due === out.guard.due && preserved.paid === out.guard.paid && preserved.probe === 'keep-mon',
        errors: logs.filter(l => !/Failed to load resource|ERR_BLOCKED|net::/.test(l)).slice(0, 6)
      };
      const schOk = !schId || (schedule.opened && schedule.openVisible && schedule.afterSave && (
        /added|schedule/i.test((schedule.afterSave.cloud || '') + ' ' + (schedule.afterSave.toast || '')) ||
        /Test Draw/.test((schedule.afterSave.gk || '') + (schedule.afterSave.doses || ''))
      ));
      const compoundOk = !hasEd || view !== 'desktop' || (compound.visible && /day|compound/i.test(compound.toast || ''));
      row.pass = !!(
        empty.toastOn && empty.toastVisible && empty.toast.length > 8 && !/^added /i.test(empty.toast) &&
        added.list.includes('Test Draw') && added.toastOn && added.toastVisible && added.itemVisible &&
        row.reloadedHasTest && row.preserved &&
        addClick.same && schOk && compoundOk
      );
      row.schOk = schOk;
      row.compoundOk = compoundOk;
      results.push(row);
      console.log((row.pass ? 'PASS ' : 'FAIL ') + name + ' toast=' + JSON.stringify(added.toast) + ' empty=' + JSON.stringify(empty.toast));
    }
  }
  writeFileSync('/tmp/calc-add-results.json', JSON.stringify({coverage, blocked: blocked.slice(0, 12), results}, null, 2));
  const failed = results.filter(r => !r.pass);
  console.log('FAILED', failed.length, 'OF', results.length);
  console.log('BLOCKED_HOSTS', [...new Set(blocked.map(u => { try { return new URL(u).host; } catch { return u; } }))]);
  ws.close();
  chrome.kill('SIGKILL');
  if (failed.length) process.exit(1);
}

async function evaluate(s, expression) {
  const r = await s('Runtime.evaluate', {expression, returnByValue: true});
  if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result.value;
}
function toastState() {
  return `(() => {
    const toast = document.getElementById('bl-calc-toast');
    const t = toast && toast.getBoundingClientRect();
    return {
      toast: toast ? toast.textContent : '',
      toastOn: !!(toast && toast.classList.contains('on')),
      toastVisible: !!(t && toast.classList.contains('on') && t.width>0 && t.top < innerHeight && t.bottom > 0)
    };
  })()`;
}
async function clickButton(s, id) {
  const pos = await evaluate(s, `(() => {
    const b = document.getElementById(${JSON.stringify(id)});
    if (!b) return null;
    b.scrollIntoView({block:'center', inline:'nearest'});
    const host = b.closest('.sheet, .scroll');
    let r = b.getBoundingClientRect();
    if (host && r.bottom > innerHeight - 96) {
      host.scrollTop += r.bottom - (innerHeight - 140);
      r = b.getBoundingClientRect();
    }
    const x = Math.min(Math.max(r.left + r.width/2, 2), innerWidth-2);
    const y = Math.min(Math.max(r.top + r.height/2, 2), innerHeight-2);
    const top = document.elementFromPoint(x, y);
    return {x, y, w: r.width, h: r.height, top: r.top, same: !!(top && (top===b || b.contains(top))), hit: top && (top.id || top.className || top.tagName)};
  })()`);
  if (!pos) return {missing: true};
  await mouse(s, pos.x, pos.y);
  return pos;
}
async function mouse(s, x, y) {
  await s('Input.dispatchMouseEvent', {type:'mouseMoved', x, y});
  await s('Input.dispatchMouseEvent', {type:'mousePressed', x, y, button:'left', clickCount:1});
  await s('Input.dispatchMouseEvent', {type:'mouseReleased', x, y, button:'left', clickCount:1});
}
async function shot(s, name) {
  const img = await s('Page.captureScreenshot', {format:'png'});
  writeFileSync(SHOTS + '/' + name + '.png', Buffer.from(img.data, 'base64'));
}

main().catch(err => { console.error(err); process.exit(1); });
