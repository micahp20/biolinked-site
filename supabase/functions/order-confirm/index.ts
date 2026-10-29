// BioLinked order confirmation email (NOT DEPLOYED). Sends the client a copy of
// their product-line order. Needs two function secrets set in Supabase, never in
// this repo: RESEND_API_KEY and ORDER_FROM (a verified sender, e.g.
// "BioLinked <orders@biolinkedsolutions.com>"). Once deployed, put its URL in
// ORDER_CONFIRM_URL in /product-line/index.html.
const CORS = {
  "Access-Control-Allow-Origin": "https://biolinkedsolutions.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};
const money = (n: number) => "$" + Number(n || 0).toFixed(2);
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("method", { status: 405, headers: CORS });
  const b = await req.json().catch(() => null);
  const to = String(b?.to || "");
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(to) || !Array.isArray(b?.items) || b.items.length > 60)
    return new Response("bad", { status: 400, headers: CORS });
  const rows = b.items.map((i: any) => `<tr><td>${esc(i.qty)} × ${esc(i.name)}</td><td align="right">${money(i.line)}</td></tr>`).join("");
  const html = `<div style="font-family:Montserrat,Arial,sans-serif;color:#000">
<h2 style="font-family:Georgia,serif;color:#7A6530">${b.test ? "[TEST] " : ""}Your BioLinked order was received</h2>
<p>Hi ${esc(b.name)}, thanks for your order.</p>
<table width="100%" cellpadding="4" style="border-collapse:collapse">${rows}
<tr><td>Shipping (2-Day UPS)</td><td align="right">${money(b.shipping)}</td></tr>
<tr><td><b>Total</b></td><td align="right"><b>${money(b.total)}</b></td></tr></table>
<p>Payment method: <b>${esc(b.payment?.method)} ${esc(b.payment?.handle)}</b></p>
<p><b>Your order is NOT confirmed until payment is received.</b></p>
<p style="color:#4a4a44;font-size:12px">For research use only. Not medical advice.</p></div>`;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: Deno.env.get("ORDER_FROM"), to: [to], subject: (b.test ? "[TEST] " : "") + "BioLinked order received — " + money(b.total), html }),
  });
  return new Response(r.ok ? "ok" : "send failed", { status: r.ok ? 200 : 502, headers: CORS });
});
