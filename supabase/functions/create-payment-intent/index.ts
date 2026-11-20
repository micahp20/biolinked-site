// create-payment-intent — BioLinked direct Apple Pay button backend.
// Amounts are NEVER taken from the browser: the browser sends only a client slug
// + quote id, and the charge comes from the allowlist below (base amount x 1.03,
// the 3% card fee rule, rounded to the cent). Requires the Supabase secret
// STRIPE_SECRET_KEY (live secret or restricted key with PaymentIntents write).
// Deploy with verify_jwt = false (public pages call it; the allowlist is the guard).

const ALLOWED_ORIGINS = [
  "https://biolinkedsolutions.com",
  "https://www.biolinkedsolutions.com",
];

type Quote = { client: string; label: string; base: number; charge: number };
// key: "<slug>/<quote id>". base/charge in cents. charge = round(base * 1.03).
const QUOTES: Record<string, Quote> = {
  "dbarajas/cycle-1": { client: "dbarajas", label: "Cycle 1", base: 33498, charge: 34503 },
  "dbarajas/cycle-2": { client: "dbarajas", label: "Cycle 2", base: 12998, charge: 13388 },
  "dbarajas/cycle-3": { client: "dbarajas", label: "Cycle 3", base: 17498, charge: 18023 },
  "dbarajas/cycle-4": { client: "dbarajas", label: "Cycle 4", base: 28498, charge: 29353 },
  "dbarajas/cycle-5": { client: "dbarajas", label: "Cycle 5", base: 11498, charge: 11843 },
  "dbarajas/cycle-6": { client: "dbarajas", label: "Cycle 6", base: 42498, charge: 43773 },
  "dbarajas/cycle-7": { client: "dbarajas", label: "Cycle 7", base: 17998, charge: 18538 },
  "rgreen/hgh-sleep-20261119": {
    client: "Ryan Green", label: "HGH + Sleep quote", base: 28999, charge: 29869,
  },
  "vbernal-quintana/hgh-remaining-20261119": {
    client: "Valeria Bernal-Quintana", label: "HGH quote remaining balance", base: 22098, charge: 22761,
  },
};

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);

  let body: { client?: string; quote?: string; cancel?: string } = {};
  try { body = await req.json(); } catch { return json({ error: "bad_json" }, 400, origin); }

  // Cancel an unpaid PaymentIntent that this function created (tests / abandoned sheets).
  if (body.cancel) {
    const id = String(body.cancel);
    if (!/^pi_[A-Za-z0-9]+$/.test(id)) return json({ error: "bad_id" }, 400, origin);
    const key = Deno.env.get("STRIPE_SECRET_KEY");
    if (!key) return json({ error: "not_configured" }, 503, origin);
    const auth = { Authorization: `Bearer ${key}` };
    const g = await fetch(`https://api.stripe.com/v1/payment_intents/${id}`, { headers: auth });
    const pi = await g.json();
    if (!g.ok || pi?.metadata?.source !== "applepay-button") return json({ error: "not_found" }, 404, origin);
    if (!["requires_payment_method", "requires_confirmation", "requires_action"].includes(pi.status)) {
      return json({ error: "not_cancelable", status: pi.status }, 409, origin);
    }
    const c = await fetch(`https://api.stripe.com/v1/payment_intents/${id}/cancel`, {
      method: "POST",
      headers: { ...auth, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ cancellation_reason: "abandoned" }),
    });
    const cp = await c.json();
    return json({ id, status: cp.status || "error" }, c.ok ? 200 : 502, origin);
  }
  const slug = String(body.client || "").trim();
  const quoteId = String(body.quote || "").trim();
  const q = QUOTES[`${slug}/${quoteId}`];
  if (!q) return json({ error: "unknown_quote" }, 404, origin);

  const key = Deno.env.get("STRIPE_SECRET_KEY");
  if (!key) return json({ error: "not_configured" }, 503, origin);

  const feeCents = q.charge - q.base;
  const p = new URLSearchParams();
  p.set("amount", String(q.charge));
  p.set("currency", "usd");
  p.append("payment_method_types[]", "card");
  p.set("description", `BioLinked – ${q.client} – ${q.label} incl. 3% card fee`);
  p.set("metadata[client]", slug);
  p.set("metadata[client_name]", q.client);
  p.set("metadata[quote]", quoteId);
  p.set("metadata[base_amount]", (q.base / 100).toFixed(2));
  p.set("metadata[card_fee]", (feeCents / 100).toFixed(2));
  p.set("metadata[source]", "applepay-button");

  const r = await fetch("https://api.stripe.com/v1/payment_intents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: p,
  });
  const pi = await r.json();
  if (!r.ok || !pi.client_secret) {
    return json({ error: "stripe_error", message: pi?.error?.message || "PaymentIntent failed" }, 502, origin);
  }
  return json({ client_secret: pi.client_secret, amount: q.charge, label: `${q.client} – ${q.label}` }, 200, origin);
});
