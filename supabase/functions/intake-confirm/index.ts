// BioLinked intake: saves the form to public.intake_submissions with any
// bloodwork paths (files are uploaded by the browser to the private
// 'bloodwork' bucket under intake/), then emails the owner a notification
// with 7-day signed links. Resend key comes from Supabase Vault.
const ORIGINS = ["https://biolinkedsolutions.com", "https://www.biolinkedsolutions.com", "http://localhost:8812"];
const OWNER = "biolinkedsolutions@gmail.com";
const FROM = "BioLinked <onboarding@resend.dev>";
const SB = Deno.env.get("SUPABASE_URL")!, SR = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const H = { apikey: SR, Authorization: `Bearer ${SR}`, "Content-Type": "application/json" };
const cors = (o: string | null) => ({ "Access-Control-Allow-Origin": o && ORIGINS.includes(o) ? o : ORIGINS[0], "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Vary": "Origin" });
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
Deno.serve(async (req) => {
  const C = cors(req.headers.get("origin"));
  const out = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...C, "Content-Type": "application/json" } });
  if (req.method === "OPTIONS") return new Response(null, { headers: C });
  if (req.method !== "POST") return out({ error: "method" }, 405);
  const b = await req.json().catch(() => null);
  const a = b?.answers && typeof b.answers === "object" ? b.answers : null;
  if (!a) return out({ error: "missing answers" }, 400);
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries(a).slice(0, 80)) answers[String(k).slice(0, 80)] = String(v ?? "").slice(0, 5000);
  if (answers["_gotcha"]) return out({ ok: true });
  delete answers["_gotcha"];
  const paths = (Array.isArray(b?.paths) ? b.paths : []).map(String).filter((p: string) => /^intake\/[A-Za-z0-9-]+\/[^/]{1,180}$/.test(p)).slice(0, 10);
  const first = answers["First Name"] || "", last = answers["Last Name"] || "";
  const test = /^\[?test\b/i.test(first) || /^\[?test\b/i.test(answers["Electronic Signature"] || "");
  const ins = await fetch(`${SB}/rest/v1/intake_submissions`, { method: "POST", headers: { ...H, Prefer: "return=representation" }, body: JSON.stringify({ first_name: first, last_name: last, email: answers["Email"] || null, phone: answers["Phone"] || null, answers, bloodwork_paths: paths, is_test: test }) });
  if (!ins.ok) return out({ error: "save failed" }, 500);
  const row = (await ins.json())[0];
  const links: string[] = [];
  for (const p of paths) {
    const r = await fetch(`${SB}/storage/v1/object/sign/bloodwork/${p.split("/").map(encodeURIComponent).join("/")}`, { method: "POST", headers: H, body: JSON.stringify({ expiresIn: 604800 }) });
    const j = await r.json().catch(() => ({}));
    links.push(j.signedURL ? `<a href="${SB}/storage/v1${j.signedURL}">${esc(p.split("/").pop())}</a> <span style="color:#777">(${esc(p)})</span>` : esc(p) + " (link failed)");
  }
  const T = test ? "[TEST] " : "";
  const tbl = Object.entries(answers).filter(([, v]) => v).map(([k, v]) => `<tr><td style="padding:4px 8px 4px 0;color:#7A6530;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:4px 0">${esc(v)}</td></tr>`).join("");
  const html = `<div style="font-family:Montserrat,Arial,sans-serif;color:#000;max-width:640px"><h2 style="font-family:Georgia,serif;color:#7A6530">${T}New intake — ${esc(first)} ${esc(last)}</h2><p>Intake ID: ${row.id}</p><h3>Bloodwork</h3><p>${links.length ? links.join("<br>") : "None uploaded"}</p>${links.length ? '<p style="color:#777;font-size:12px">Links expire in 7 days; files stay in the private bloodwork bucket.</p>' : ""}<table style="border-collapse:collapse;font-size:13px">${tbl}</table><p style="color:#4a4a44;font-size:12px;margin-top:18px">For research use only. Not medical advice.</p></div>`;
  const kr = await fetch(`${SB}/rest/v1/rpc/bl_resend_key`, { method: "POST", headers: H, body: "{}" });
  const k = kr.ok ? await kr.json() : null; let emails: Record<string, unknown> = { error: "no key" };
  if (k) {
    const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${k}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to: [OWNER], subject: `${T}New BioLinked intake — ${first} ${last}`.trim(), html }) });
    const j = await r.json().catch(() => ({})); emails = { owner: r.ok ? { ok: true, id: j.id } : { ok: false, error: String(j.message || r.status).slice(0, 200) } };
  }
  await fetch(`${SB}/rest/v1/intake_submissions?id=eq.${row.id}`, { method: "PATCH", headers: H, body: JSON.stringify({ emails }) });
  return out({ ok: true, id: row.id, owner_email: (emails as any).owner?.ok ? "sent" : "failed" });
});
