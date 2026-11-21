// BioLinked portal cart Stripe Checkout. No browser-supplied prices are trusted.
// Hosted Checkout supports cards and Apple Pay on eligible devices.
const SB = Deno.env.get("SUPABASE_URL") || "";
const SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const STRIPE = Deno.env.get("STRIPE_SECRET_KEY") || "";
const ORIGINS = ["https://biolinkedsolutions.com", "https://www.biolinkedsolutions.com"];
const SHIPPING_CENTS = 999;
const CLIENT = "mjohnson";
const cors = (origin: string | null) => ({
  "Access-Control-Allow-Origin": origin && ORIGINS.includes(origin) ? origin : ORIGINS[0],
  "Access-Control-Allow-Headers": "content-type, apikey, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS", "Vary": "Origin",
});
const money = (cents: number) => (cents / 100).toFixed(2);
const reply = (data: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(data), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });
const safe = (s: unknown, max = 200) => String(s ?? "").trim().slice(0, max);
const dbHeaders = { apikey: SR, Authorization: "Bearer " + SR, "Content-Type": "application/json" };
async function stripe(path: string, body?: URLSearchParams) {
  const res = await fetch("https://api.stripe.com/v1/" + path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: "Bearer " + STRIPE, ...(body ? { "Content-Type": "application/x-www-form-urlencoded" } : {}) },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error("Stripe " + res.status + ": " + (json.error?.message || "request failed"));
  return json;
}
const banned = (n: string) => ["cortexin", "dihexa", "ipamorelin", "shipping", "2-day ups"].some(x => n.toLowerCase().includes(x))
  || /(?:epitalon|epithalon).*10\s*mg/i.test(n);
function emailFrom(contact: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) ? contact : null;
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { headers: cors(origin) });
  if (req.method !== "POST") return reply({ error: "method" }, 405, origin);
  if (!origin || !ORIGINS.includes(origin)) return reply({ error: "origin" }, 403, origin);
  if (!SB || !SR || !STRIPE) return reply({ error: "payment_not_configured" }, 503, origin);
  const body = await req.json().catch(() => null);
  if (body?.client !== CLIENT) return reply({ error: "unsupported_portal" }, 400, origin);
  try {
    if (body.action === "verify") {
      const id = safe(body.session_id, 150);
      if (!/^cs_(?:live|test)_[a-zA-Z0-9]+$/.test(id)) return reply({ error: "invalid_session" }, 400, origin);
      const session = await stripe("checkout/sessions/" + encodeURIComponent(id));
      if (session.metadata?.client !== CLIENT || session.payment_status !== "paid") return reply({ paid: false }, 200, origin);
      const rows = await fetch(SB + "/rest/v1/site_orders?select=id,status,total&payment_handle=eq." + encodeURIComponent(id) + "&limit=1", { headers: dbHeaders });
      if (!rows.ok) throw new Error("order_lookup_failed");
      const list = await rows.json();
      if (list.length !== 1 || Math.round(Number(list[0].total) * 103) !== session.amount_total) return reply({ error: "order_mismatch" }, 409, origin);
      if (list[0].status === "new") {
        const patched = await fetch(SB + "/rest/v1/site_orders?id=eq." + list[0].id + "&status=eq.new", {
          method: "PATCH", headers: { ...dbHeaders, Prefer: "return=representation" },
          body: JSON.stringify({ status: "paid" }),
        });
        if (!patched.ok) throw new Error("order_update_failed");
      }
      return reply({ paid: true }, 200, origin);
    }
    if (body.action !== "create") return reply({ error: "action" }, 400, origin);
    const name = safe(body.name), contact = safe(body.contact, 300);
    const incoming = body.items;
    if (!name || !contact || !Array.isArray(incoming) || incoming.length < 1 || incoming.length > 50)
      return reply({ error: "invalid_order" }, 400, origin);
    const ids = new Set<number>();
    const quantities = new Map<number, number>();
    for (const row of incoming) {
      const id = Number(row.id), qty = Number(row.qty);
      if (!Number.isSafeInteger(id) || id < 1 || !Number.isSafeInteger(qty) || qty < 1 || qty > 99 || ids.has(id))
        return reply({ error: "invalid_items" }, 400, origin);
      ids.add(id); quantities.set(id, qty);
    }
    const productQuery = "pl_products?select=id,name,sale,inventory_id,inventory(vials,status)&id=in.(" + [...ids].join(",") + ")";
    const res = await fetch(SB + "/rest/v1/" + productQuery, { headers: dbHeaders });
    if (!res.ok) throw new Error("product_lookup_failed");
    const products = await res.json();
    if (products.length !== ids.size) return reply({ error: "product_missing" }, 409, origin);
    const items: { name: string; qty: number; price: number }[] = [];
    let subtotalCents = 0;
    for (const p of products) {
      const cents = Math.round(Number(p.sale) * 100);
      const qty = quantities.get(Number(p.id)) || 0;
      const inventory = p.inventory;
      if (!Number.isInteger(cents) || cents < 500 || banned(p.name) || !inventory || inventory.status === "out" || Number(inventory.vials) < qty)
        return reply({ error: "item_unavailable", item: p.name }, 409, origin);
      items.push({ name: p.name, qty, price: cents / 100 });
      subtotalCents += cents * qty;
    }
    const baseCents = subtotalCents + SHIPPING_CENTS;
    const feeCents = Math.round(baseCents * 0.03);
    if (baseCents < SHIPPING_CENTS || baseCents + feeCents > 2500000) return reply({ error: "total_out_of_range" }, 400, origin);
    const orderId = crypto.randomUUID();
    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", "https://biolinkedsolutions.com/mjohnson/?bl_checkout=success&session_id={CHECKOUT_SESSION_ID}");
    params.set("cancel_url", "https://biolinkedsolutions.com/mjohnson/?bl_checkout=cancel");
    params.set("client_reference_id", orderId);
    params.set("metadata[client]", CLIENT);
    params.set("metadata[order_id]", orderId);
    params.set("metadata[base_cents]", String(baseCents));
    params.set("metadata[fee_cents]", String(feeCents));
    const email = emailFrom(contact);
    if (email) params.set("customer_email", email);
    let index = 0;
    for (const p of items) {
      const k = index++;
      params.set("line_items[" + k + "][quantity]", String(p.qty));
      params.set("line_items[" + k + "][price_data][currency]", "usd");
      params.set("line_items[" + k + "][price_data][unit_amount]", String(Math.round(p.price * 100)));
      params.set("line_items[" + k + "][price_data][product_data][name]", p.name);
    }
    for (const [label, amount] of [["Shipping · UPS 2-Day", SHIPPING_CENTS], ["Card / Apple Pay fee (3%)", feeCents]] as const) {
      if (!amount) continue;
      const k = index++;
      params.set("line_items[" + k + "][quantity]", "1");
      params.set("line_items[" + k + "][price_data][currency]", "usd");
      params.set("line_items[" + k + "][price_data][unit_amount]", String(amount));
      params.set("line_items[" + k + "][price_data][product_data][name]", label);
    }
    const session = await stripe("checkout/sessions", params);
    const order = await fetch(SB + "/rest/v1/site_orders", {
      method: "POST", headers: { ...dbHeaders, Prefer: "return=representation" },
      body: JSON.stringify({
        id: orderId, name, contact, email, items, subtotal: money(subtotalCents),
        shipping: money(SHIPPING_CENTS), total: money(baseCents),
        payment_method: "Stripe Checkout", payment_handle: session.id,
        status: "new", is_test: false,
        emails: { stripe_session: session.id, fee: money(feeCents), checkout_status: "pending" },
      }),
    });
    if (!order.ok) {
      await stripe("checkout/sessions/" + session.id + "/expire", new URLSearchParams()).catch(() => null);
      throw new Error("order_save_failed");
    }
    return reply({ url: session.url, total: money(baseCents + feeCents) }, 200, origin);
  } catch (error) {
    console.error("Portal checkout error", String(error));
    return reply({ error: "checkout_unavailable" }, 502, origin);
  }
});
