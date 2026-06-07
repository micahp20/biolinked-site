// BioLinked "Ask About Your Protocol" chat — shared client module.
// Pages opt in by providing a config object and a mount point:
//   <script>window.BLS_ASK = { clientSlug: 'XXX', mode: 'client'|'operator', operatorName: 'Micah', workerUrl: 'https://...' };</script>
//   <div id="ask-mount"></div>
//   <script src="/ask-chat.js" defer></script>
// The Cloudflare Worker reads the client's protocol page and replies via Claude.

(function () {
  function init() {
    var cfg = window.BLS_ASK || {};
    if (!cfg.workerUrl || !cfg.clientSlug) {
      console.warn('[bls-ask] missing workerUrl or clientSlug; chat will not mount');
      return;
    }
    var mount = document.getElementById('ask-mount');
    if (!mount) {
      console.warn('[bls-ask] no #ask-mount element on page');
      return;
    }

    var operatorName = cfg.operatorName || 'Micah';
    var isOperator = cfg.mode === 'operator';

    var bannerCopy = isOperator
      ? '<strong>Open mode:</strong> brainstorming and speculative questions are fair game. Treat this as a sparring partner, not a guardrail.'
      : '<strong>How this works:</strong> answers come from your protocol via Claude. For anything clinical, text ' + operatorName + ' directly.';

    var welcomeCopy = isOperator
      ? 'Ask about anything — your current stack, peptides you might add, mechanisms, timing, dose math.'
      : 'Ask about your doses, schedule, side effects, what to do if you miss a shot, or anything else about your protocol.';

    var suggested = isOperator
      ? [
          'What does Reta do for me?',
          'How would L-Carnitine stack on top of this?',
          'Should I take MOTS-c with this stack?',
          'Run me through my weekly schedule.'
        ]
      : [
          "What's my schedule?",
          'How many units per shot?',
          'What if I miss a dose?',
          'Should I take it fasted?'
        ];

    var chipsHtml = suggested.map(function (q) {
      return '<button class="ask-chip" data-q="' + escapeAttr(q) + '">' + escapeHtml(q) + '</button>';
    }).join('');

    mount.innerHTML =
      '<div class="ask-wrap">' +
        '<div class="ask-section-head">' +
          '<div class="ask-section-eyebrow">Ask</div>' +
          '<div class="ask-section-title">Ask About Your Protocol</div>' +
          '<div class="ask-section-sub">Quick answers about doses, schedule, side effects.</div>' +
        '</div>' +
        '<div class="ask-banner">' + bannerCopy + '</div>' +
        '<div class="ask-thread" id="ask-thread">' +
          '<div class="ask-welcome">' +
            '<h3>Hi — what would you like to know?</h3>' +
            '<p>' + welcomeCopy + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="ask-suggest" id="ask-suggest">' + chipsHtml + '</div>' +
        '<div class="ask-input-row">' +
          '<input type="text" id="ask-input" placeholder="Type a question…" autocomplete="off" maxlength="3000">' +
          '<button class="ask-send" id="ask-send">Send</button>' +
        '</div>' +
        '<div class="ask-foot">Educational only — not medical advice. For anything clinical, contact ' + escapeHtml(operatorName) + ' directly.</div>' +
      '</div>';

    var input = document.getElementById('ask-input');
    var sendBtn = document.getElementById('ask-send');
    var thread = document.getElementById('ask-thread');
    var suggestEl = document.getElementById('ask-suggest');

    var messages = [];
    var thinking = false;

    sendBtn.addEventListener('click', function () { doSend(); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    });
    Array.prototype.forEach.call(suggestEl.querySelectorAll('.ask-chip'), function (btn) {
      btn.addEventListener('click', function () { doSend(btn.getAttribute('data-q')); });
    });

    function doSend(override) {
      var text = (override != null ? override : input.value).trim();
      if (!text || thinking) return;
      messages.push({ role: 'user', text: text });
      input.value = '';
      setThinking(true);
      render();
      callWorker(messages).then(function (reply) {
        messages.push({ role: 'bot', text: reply });
      }).catch(function (err) {
        var msg = (err && err.message) || String(err);
        messages.push({
          role: 'bot',
          text: "Sorry — I couldn't reach the assistant. (" + msg + ") Try again in a moment, or text " + operatorName + " directly."
        });
      }).then(function () {
        setThinking(false);
        render();
      });
    }

    function callWorker(history) {
      return fetch(cfg.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientSlug: cfg.clientSlug,
          mode: cfg.mode || 'client',
          operatorName: operatorName,
          messages: history.map(function (m) { return { role: m.role, text: m.text }; })
        })
      }).then(function (resp) {
        if (!resp.ok) {
          return resp.text().catch(function () { return ''; }).then(function (detail) {
            throw new Error('HTTP ' + resp.status + (detail ? ' — ' + detail.slice(0, 200) : ''));
          });
        }
        return resp.json();
      }).then(function (data) {
        if (!data || !data.reply) throw new Error('empty reply');
        return data.reply;
      });
    }

    function setThinking(b) {
      thinking = b;
      sendBtn.disabled = b;
      input.disabled = b;
    }

    function render() {
      var html = '';
      if (messages.length === 0 && !thinking) {
        html = '<div class="ask-welcome"><h3>Hi — what would you like to know?</h3><p>' + escapeHtml(welcomeCopy) + '</p></div>';
      } else {
        for (var i = 0; i < messages.length; i++) {
          var m = messages[i];
          html += '<div class="ask-msg ' + (m.role === 'bot' ? 'bot' : 'user') + '">' + escapeHtml(m.text) + '</div>';
        }
        if (thinking) {
          html += '<div class="ask-msg bot typing">thinking…</div>';
        }
      }
      thread.innerHTML = html;
      suggestEl.style.display = messages.length > 0 ? 'none' : '';
      thread.scrollTop = thread.scrollHeight;
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
    function escapeAttr(s) {
      return escapeHtml(s);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
