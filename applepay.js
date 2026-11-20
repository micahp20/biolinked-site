/* BioLinked direct Apple Pay button.
   Markup: <div class="bl-applepay" data-client="<slug>" data-quote="<quote id>"
             data-amount="<charge incl. 3% fee>" data-label="..."></div>
   Shown only when Stripe reports Apple Pay is available on this device/browser.
   The server (Supabase edge function create-payment-intent) decides the real
   amount from its allowlist; data-amount is only for the Apple Pay sheet display
   and must match. Never marks the page paid — Micah records payments manually. */
(function(){
  // Stripe live publishable key (public by design). Empty = button stays hidden.
  var PK = '';
  var FN = 'https://bfjydzealeethhcpdfxl.supabase.co/functions/v1/create-payment-intent';
  if (!PK) return;
  var stripeP = null;
  function loadStripe(){
    if (stripeP) return stripeP;
    stripeP = new Promise(function(res, rej){
      if (window.Stripe) return res(window.Stripe(PK));
      var s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/'; s.async = true;
      s.onload = function(){ res(window.Stripe(PK)); }; s.onerror = rej;
      document.head.appendChild(s);
    });
    return stripeP;
  }
  function msg(el, cls, text){
    var m = el.querySelector('.apmsg') || document.createElement('div');
    m.className = 'apmsg ' + cls; m.textContent = text; el.appendChild(m);
  }
  function init(el){
    if (el.dataset.apInit) return; el.dataset.apInit = '1';
    var cents = Math.round(parseFloat(el.dataset.amount || '0') * 100);
    if (!(cents > 0)) return;
    loadStripe().then(function(stripe){
      var pr = stripe.paymentRequest({
        country: 'US', currency: 'usd',
        total: { label: 'BioLinked – ' + (el.dataset.label || 'Payment'), amount: cents },
        requestPayerName: true, requestPayerEmail: true
      });
      pr.canMakePayment().then(function(r){
        if (!r || !r.applePay) return;   // Apple Pay only; card link stays as fallback
        el.innerHTML = '<button type="button" class="apbtn" lang="en" aria-label="Pay with Apple Pay"></button>' +
          '<div class="apnote">Apple Pay $' + (cents/100).toFixed(2) + ' · includes 3% card fee</div>';
        el.classList.add('ready');
        el.querySelector('.apbtn').addEventListener('click', function(){ pr.show(); });
        pr.on('paymentmethod', function(ev){
          fetch(FN, { method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ client: el.dataset.client, quote: el.dataset.quote }) })
          .then(function(r){ return r.json(); })
          .then(function(d){
            if (!d.client_secret || d.amount !== cents) throw new Error(d.error || 'amount_mismatch');
            return stripe.confirmCardPayment(d.client_secret, { payment_method: ev.paymentMethod.id }, { handleActions: false })
              .then(function(res){
                if (res.error) { ev.complete('fail'); throw res.error; }
                ev.complete('success');
                if (res.paymentIntent.status === 'requires_action') {
                  return stripe.confirmCardPayment(d.client_secret).then(function(r2){ if (r2.error) throw r2.error; });
                }
              });
          })
          .then(function(){
            el.querySelector('.apbtn').remove();
            msg(el, 'ok', 'Thank you! Your Apple Pay payment went through. Micah will confirm it on your page shortly.');
          })
          .catch(function(){
            try { ev.complete('fail'); } catch(e) {}
            msg(el, 'err', 'Apple Pay didn\u2019t go through. Please try again or use Pay with card.');
          });
        });
      });
    }).catch(function(){});
  }
  function scan(){ document.querySelectorAll('.bl-applepay').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
