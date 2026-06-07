// BioLinked "Ask" chat — Cloudflare Worker
// ---------------------------------------------------------------------------
// Receives chat messages from a client protocol page, fetches that page's
// protocol text, sends it to Claude as cached system context, returns the
// reply. Designed to paste directly into the Cloudflare Workers dashboard
// (no build step / no npm — uses raw fetch against the Claude API).
//
// Required secrets (set in Worker → Settings → Variables):
//   ANTHROPIC_API_KEY   — from console.anthropic.com
//
// Optional env vars:
//   MODEL               — defaults to "claude-opus-4-7"
//                         set to "claude-haiku-4-5" for ~5× cost reduction
//   MAX_TOKENS          — defaults to 1024 (response cap)
//
// Wire format:
//   POST { clientSlug, clientName, messages: [{ role, text }, ...] }
//   →    { reply, usage }

const SYSTEM_PROMPT_CLIENT = (operatorName, protocolText) => `You are a friendly chat assistant on a BioLinked peptide protocol page. You help the user understand their own personalized protocol. The operator behind BioLinked is ${operatorName}, who designed this protocol for them.

The full protocol document is below in <PROTOCOL> tags. Answer questions ONLY from what's in this document.

Style:
- Always address the user as "you" / "your". Never refer to them by name.
- Conversational, plain-English, warm. Short paragraphs. No medical jargon unless the protocol uses it.

Scope:
- Stay scoped to the actual protocol. Don't bring in general peptide knowledge or speculate about compounds, doses, or additions that aren't in the document.
- Dose math, schedule timing, reconstitution, site rotation, side-effect descriptions, hydration / nutrition guidance — those are fair game, answer directly from the document.

Clinical guardrail:
- For anything clinical ("should I", "is this safe for me", "I'm having symptom X", "can I take this with my medication") — do NOT give medical advice. Warmly redirect: "That's a clinical question — please text ${operatorName} directly so he can answer based on your situation."
- If asked about adding a peptide, supplement, or compound that isn't in their protocol — defer: "That's not in the stack ${operatorName} designed for you. Text him directly and he can weigh in on whether it makes sense to add."
- If something truly isn't covered: "I don't see that in your protocol — text ${operatorName} and he can clarify."

Never invent doses, side effects, or stack additions that aren't in the document.

<PROTOCOL>
${protocolText}
</PROTOCOL>`;

const SYSTEM_PROMPT_OPERATOR = (protocolText) => `You are a chat assistant on the BioLinked operator's own personal protocol page. The user IS the operator behind BioLinked — the person who designs these protocols for clients. Treat them as a peer and as the expert.

Their current personal protocol is below in <PROTOCOL> tags.

Style:
- Always address them as "you" / "your". Never refer to them by name.
- Conversational, direct, plain-English. Short paragraphs.
- No medical disclaimers, no "consult a healthcare provider" type language. They ARE the protocol designer; they don't need guardrails.

Scope:
- Answer questions about their current protocol directly from the document.
- They are ALSO welcome to ask about peptides, supplements, or compounds NOT in their current stack (L-Carnitine, KLOW, MOTS-c, 5-Amino-1MQ, semaglutide, oxytocin, selank, anything). Share what you know about each: mechanism, typical dosing, how it would interact with their current stack, whether stacking it with what they're already running makes mechanistic sense, timing considerations. They'll make their own clinical decisions.
- This is a brainstorming / sparring tool, not a guardrail.

When you genuinely don't know something with confidence, say so plainly ("I don't know" / "not sure, you'd want to check that") rather than hedging endlessly.

<PROTOCOL>
${protocolText}
</PROTOCOL>`;

// Per-isolate protocol text cache. Same isolate serving repeated requests
// avoids re-fetching the static HTML; cold isolates re-fetch.
const PROTOCOL_CACHE = new Map();
const PROTOCOL_TTL_MS = 5 * 60 * 1000;

const ALLOWED_ORIGINS = new Set([
  'https://biolinkedsolutions.com',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

const SLUG_RE = /^[a-z0-9-]+$/i;
const MAX_MESSAGES = 30;
const MAX_USER_CHARS = 12000;

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request) });
    }
    if (request.method === 'GET' && new URL(request.url).pathname === '/health') {
      return json({ ok: true, model: env.MODEL || 'claude-opus-4-7' }, 200, request);
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405, request);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400, request);
    }

    const { clientSlug, mode, operatorName, messages } = body || {};

    if (!clientSlug || !SLUG_RE.test(clientSlug)) {
      return json({ error: 'invalid_client_slug' }, 400, request);
    }
    const useMode = mode === 'operator' ? 'operator' : 'client';
    const safeOperatorName = (operatorName || 'Micah').toString().slice(0, 64);
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'no_messages' }, 400, request);
    }
    if (messages.length > MAX_MESSAGES) {
      return json({ error: 'too_many_messages', max: MAX_MESSAGES }, 400, request);
    }
    for (const m of messages) {
      if (typeof m?.text !== 'string' || !m.text.trim()) {
        return json({ error: 'invalid_message' }, 400, request);
      }
      if (m.text.length > MAX_USER_CHARS) {
        return json({ error: 'message_too_long', max: MAX_USER_CHARS }, 400, request);
      }
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return json({ error: 'missing_api_key' }, 500, request);
    }

    let protocolText;
    try {
      protocolText = await getProtocolText(clientSlug);
    } catch (err) {
      return json({ error: 'protocol_fetch_failed', detail: String(err?.message || err) }, 502, request);
    }

    const apiMessages = messages.map((m) => ({
      role: m.role === 'bot' || m.role === 'assistant' ? 'assistant' : 'user',
      content: m.text,
    }));

    const systemText = useMode === 'operator'
      ? SYSTEM_PROMPT_OPERATOR(protocolText)
      : SYSTEM_PROMPT_CLIENT(safeOperatorName, protocolText);

    const claudeBody = {
      model: env.MODEL || 'claude-opus-4-7',
      max_tokens: Number(env.MAX_TOKENS) || 1024,
      system: [
        {
          type: 'text',
          text: systemText,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: apiMessages,
    };

    let claudeResp;
    try {
      claudeResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(claudeBody),
      });
    } catch (err) {
      return json({ error: 'upstream_unreachable', detail: String(err?.message || err) }, 502, request);
    }

    if (!claudeResp.ok) {
      const errText = await claudeResp.text().catch(() => '');
      return json(
        { error: 'upstream_error', status: claudeResp.status, detail: errText.slice(0, 500) },
        502,
        request,
      );
    }

    const data = await claudeResp.json();
    const reply = data?.content?.find?.((b) => b.type === 'text')?.text || '';
    if (!reply) {
      return json({ error: 'empty_reply', stop_reason: data?.stop_reason }, 502, request);
    }

    return json(
      {
        reply,
        usage: data.usage,
        stop_reason: data.stop_reason,
        model: data.model,
      },
      200,
      request,
    );
  },
};

async function getProtocolText(slug) {
  const now = Date.now();
  const cached = PROTOCOL_CACHE.get(slug);
  if (cached && cached.expiresAt > now) return cached.text;

  const url = `https://biolinkedsolutions.com/${slug}/`;
  const resp = await fetch(url, {
    headers: { 'User-Agent': 'BioLinked-Ask-Worker/1.0' },
  });
  if (!resp.ok) {
    throw new Error(`page fetch returned ${resp.status} for ${url}`);
  }
  const html = await resp.text();
  const text = extractProtocolText(html);
  if (text.length < 200) {
    throw new Error(`protocol text too short (${text.length} chars) — page may not be a client protocol`);
  }
  PROTOCOL_CACHE.set(slug, { text, expiresAt: now + PROTOCOL_TTL_MS });
  return text;
}

// Prefer an explicit plain-text block if the page provides one. Pattern:
//   <script type="application/json" id="bls-protocol-context">{"protocol": "..."}</script>
// Falls back to stripping the whole HTML.
function extractProtocolText(html) {
  const explicitMatch = html.match(
    /<script[^>]*id=["']bls-protocol-context["'][^>]*>([\s\S]*?)<\/script>/i,
  );
  if (explicitMatch) {
    try {
      const parsed = JSON.parse(explicitMatch[1].trim());
      if (typeof parsed?.protocol === 'string') {
        return parsed.protocol.slice(0, 60000);
      }
    } catch {
      // fall through to HTML strip
    }
  }
  return stripHtmlToText(html).slice(0, 60000);
}

function stripHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&middot;/g, '·')
    .replace(/&hellip;/g, '…')
    .replace(/&rarr;/g, '→')
    .replace(/&times;/g, '×')
    .replace(/&divide;/g, '÷')
    .replace(/&deg;/g, '°')
    .replace(/&Prime;/g, '″')
    .replace(/&minus;/g, '−')
    .replace(/&#(\d+);/g, (_, n) => {
      try { return String.fromCodePoint(parseInt(n, 10)); } catch { return ' '; }
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      try { return String.fromCodePoint(parseInt(h, 16)); } catch { return ' '; }
    })
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function corsHeaders(request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : 'https://biolinkedsolutions.com';
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(body, status, request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(request),
    },
  });
}
