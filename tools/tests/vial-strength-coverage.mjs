/**
 * Report protocol and invoice labels that do not show a vial strength.
 * Does not change files. A strength is a number with mg, mcg, IU, or mL
 * on the compound or line label. The per-dose field is not counted.
 * Run: node tools/tests/vial-strength-coverage.mjs
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../', import.meta.url).pathname;
const UNIT = /\d+(?:\.\d+)?\s*(?:mg|mcg|µg|ug|IU|iu|mL|ml|ML|U\/mL)(?![a-z])/;
const SKIP_LINE = /shipping|ups\b|2-day|flat rate|discount|payment received|not included|friends\s*&\s*family|complimentary/i;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules') continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.html?$/i.test(name)) out.push(p);
  }
  return out;
}
function grab(html, name) {
  const token = 'var ' + name + '=';
  const i = html.indexOf(token);
  if (i < 0) return null;
  const nl = html.indexOf('\n', i);
  const expr = html.slice(i + token.length, nl).replace(/;$/, '');
  try { return eval('(' + expr + ')'); } catch (e) { return null; }
}

const missing = [];
let protocol = 0, protocolMissing = 0, invoice = 0, invoiceMissing = 0, files = 0;
for (const file of walk(ROOT)) {
  const html = readFileSync(file, 'utf8');
  if (!html.includes('portal-plan-controls.js') && !html.includes('var INV=') && !html.includes('var ALL=')) continue;
  files += 1;
  const rel = file.slice(ROOT.length);
  for (const row of grab(html, 'ALL') || []) {
    protocol += 1;
    const label = String(row.n || '');
    if (!UNIT.test(label)) {
      protocolMissing += 1;
      missing.push({ file: rel, where: 'protocol', label });
    }
  }
  for (const order of grab(html, 'INV') || []) {
    for (const item of order.items || []) {
      const label = String(item.n || '');
      if (SKIP_LINE.test(label)) continue;
      invoice += 1;
      if (!UNIT.test(label)) {
        invoiceMissing += 1;
        missing.push({ file: rel, where: 'invoice', order: order.label, label });
      }
    }
  }
}
const report = { files, protocol, protocolMissing, invoice, invoiceMissing, missing };
const out = '/opt/cursor/artifacts/vial-strength-coverage.json';
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ files, protocol, protocolMissing, invoice, invoiceMissing, sample: missing.slice(0, 40) }, null, 2));
if (protocolMissing || invoiceMissing) process.exitCode = 2;
