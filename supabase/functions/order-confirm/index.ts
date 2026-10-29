// BioLinked cart orders: saves the order to public.site_orders and emails the
// owner copy (replaces Formspree) plus a client confirmation when the contact
// is an email. The Resend key lives in Supabase Vault (read via
// public.bl_resend_key(), service role only). Nothing secret is in this file.
const ORIGINS = ["https://biolinkedsolutions.com", "https://www.biolinkedsolutions.com", "http://localhost:8812"];
const OWNER = "biolinkedsolutions@gmail.com";
const FROM = "BioLinked <onboarding@resend.dev>"; // switch to orders@biolinkedsolutions.com once the domain is verified in Resend
const PAY: Record<string, string> = { "Venmo": "@micahp20", "Cash App": "$micahpauldino", "Zelle": "720-938-0698" };
const SHIPPING = 9.99;
const SB = Deno.env.get("SUPABASE_URL")!, SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const cors = (o: string | null) => ({ "Access-Control-Allow-Origin": o && ORIGINS.includes(o) ? o : ORIGINS[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Vary": "Origin" });
const money = (n: number) => "$" + Number(n || 0).toFixed(2);
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const EMAIL = /[^\s@<>(),;:]+@[^\s@<>(),;:]+\.[a-z]{2,}/i;
async function key() { const r = await fetch(`${SB}/rest/v1/rpc/bl_resend_key`, { method: "POST", headers: H, body: "{}" }); return r.ok ? await r.json() : null; }
async function send(k: string, to: string, subject: string, html: string) {
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [to], subject, html }) });
  const j = await r.json().catch(() => ({})); return r.ok ? { ok: true, id: j.id } : { ok: false, error: String(j.message || r.status).slice(0, 200) };
}
Deno.serve(async (req) => {
  const C = cors(req.headers.get("origin"));
  const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...C, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: C });
  if (req.method !== "POST") return out({ error: "method" }, 405);
  const b = await req.json().catch(() => null);
  const name = String(b?.name || "").trim().slice(0, 200), contact = String(b?.contact || "").trim().slice(0, 300);
  const method = String(b?.payment?.method || ""), handle = PAY[method];
  const items = Array.isArray(b?.items) ? b.items.slice(0, 80).map((i: any) => ({ name: String(i?.name || "").slice(0, 200), qty: Math.max(1, Math.min(99, Math.floor(+i?.qty || 1))), price: Math.max(0, Math.round((+i?.price || 0) * 100) / 100) })).filter((i: any) => i.name) : [];
  if (!name || !contact || !handle || !items.length) return out({ error: "missing fields" }, 400);
  const subtotal = Math.round(items.reduce((s: number, i: any) => s + i.qty * i.price, 0) * 100) / 100, total = Math.round((subtotal + SHIPPING) * 100) / 100;
  const email = (contact.match(EMAIL) || [])[0] || null, test = /^\[?test\b/i.test(name);
  const ins = await fetch(`${SB}/rest/v1/site_orders`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify({ name, contact, email, items, subtotal, shipping: SHIPPING, total, payment_method: method, payment_handle: handle, is_test: test }) });
  if (!ins.ok) return out({ error: "save failed" }, 500);
  const row = (await ins.json())[0];
  const T = test ? "[TEST] " : "";
  const rows = items.map((i: any) => `<tr><td style="padding:6px 0;border-bottom:1px solid #eee">${i.qty} × ${esc(i.name)}</td><td align="right" style="padding:6px 0;border-bottom:1px solid #eee">${money(i.qty * i.price)}</td></tr>`).join("");
  const table = `<table width="100%" style="border-collapse:collapse;font-size:14px">${rows}<tr><td style="padding:6px 0">Shipping (2-Day UPS)</td><td align="right">${money(SHIPPING)}</td></tr><tr><td style="padding:8px 0"><b>Total</b></td><td align="right"><b>${money(total)}</b></td></tr></table>`;
  const wrap = (h: string) => `<div style="font-family:Montserrat,Arial,sans-serif;color:#000;max-width:560px">${h}<p style="color:#4a4a44;font-size:12px;margin-top:18px">For research use only. Not medical advice.</p></div>`;
  const k = await key(); const emails: Record<string, unknown> = {};
  if (!k) emails.error = "no key";
  else {
    emails.owner = await send(k, OWNER, `${T}New BioLinked Order — ${money(total)} — ${name}`, wrap(`<h2 style="font-family:Georgia,serif;color:#7A6530">${T}New order</h2><p><b>${esc(name)}</b><br>Contact: ${esc(contact)}<br>Payment: ${esc(method)} ${esc(handle)}<br>Order ID: ${row.id}</p>${table}`));
    if (email) emails.client = await send(k, email, `${T}Your BioLinked order — ${money(total)}`, wrap(`<h2 style="font-family:Georgia,serif;color:#7A6530">${T}We received your order</h2><p>Hi ${esc(name)}, thanks for your order.</p>${table}<p>Payment method: <b>${esc(method)} ${esc(handle)}</b><br>Send <b>${money(total)}</b> to ${esc(handle)} on ${esc(method)}.</p><p style="background:#faf7ef;border-left:3px solid #7A6530;padding:10px 12px"><b>Your order is NOT confirmed until payment is received.</b></p>`));
  }
  await fetch(`${SB}/rest/v1/site_orders?id=eq.${row.id}`, { method: "PATCH", headers: H, body: JSON.stringify({ emails }) });
  return out({ ok: true, id: row.id, total, client_email: email ? ((emails.client as any)?.ok ? "sent" : "failed") : "none" });
});
