/* BioLinked direct Apple Pay button.
   Markup: <div class="bl-applepay" data-client="<slug>" data-quote="<quote id>"
             data-amount="<charge incl. 3% fee>" data-label="..."></div>
   Shown only when Stripe reports Apple Pay is available on this device/browser.
   The server (Supabase edge function create-payment-intent) decides the real
   amount from its allowlist; data-amount is only for the Apple Pay sheet display
   and must match. Never marks the page paid — Micah records payments manually. */
(function(){
  // Stripe live publishable key (public by design). Empty = button stays hidden.
  var PK = 'pk_live_51TMDWSHwQK95IJPpixddZyDAy6a2vVaNSdr8u8ydgEeTZlp92IfUGHkIoNNe87M8zcYASjbe3ZBtxa0AGZMGBSFH00BTgJwLtC';
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
        el.innerHTML = '<button type="button" class="apbtn" lang="en" aria-label="Pay with Apple Pay"></button>';
        // No price on the button and no separate note: the page's single
        // "Apple Pay and card include a 3% fee" line sits under the card button.
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
  function prepareCard(wallet){
    if(!['lprice','eprice','dbarajas'].includes(wallet.dataset.client)) return;
    var button=wallet.parentElement.querySelector('[data-cart-card],button[title="Card checkout pending"]');
    if(!button || button.dataset.bound) return;
    button.dataset.bound='1'; button.disabled=false; button.removeAttribute('title');
    button.onclick=async function(){
      button.disabled=true;
      var form=document.createElement('form'), field=document.createElement('div'), submit=document.createElement('button'), status=document.createElement('small');
      field.style.cssText='background:white;padding:14px;border-radius:8px';
      submit.className='paybtn'; submit.type='submit'; submit.textContent='Confirm card payment';
      status.setAttribute('role','status');
      form.onsubmit=function(event){event.preventDefault()}; form.append(field,submit,status); button.after(form);
      var secret;
      try{
        var stripe=await loadStripe(), card=stripe.elements().create('card');
        card.mount(field);
        form.onsubmit=async function(event){
          event.preventDefault(); if(submit.disabled) return;
          submit.disabled=true;
          try{
            if(!secret){
              var response=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({client:wallet.dataset.client,quote:wallet.dataset.quote})});
              var data=await response.json();
              if(!response.ok || data.amount!==Math.round(Number(wallet.dataset.amount)*100)) throw Error('Unable to verify the cart total.');
              secret=data.client_secret;
            }
            var result=await stripe.confirmCardPayment(secret,{payment_method:{card:card}});
            if(result.error) throw result.error;
            status.textContent=result.paymentIntent.status==='succeeded'?'Payment received.':'Payment submitted for processing.';
            submit.hidden=true; card.unmount();
          }catch(error){status.textContent=error.message || 'Please check the payment status before retrying.';submit.disabled=false;}
        };
      }catch(error){form.remove();button.disabled=false;button.title='Card form failed to load. Tap to retry.';}
    };
  }
  function scan(){ document.querySelectorAll('.bl-applepay').forEach(prepareCard); document.querySelectorAll('.bl-applepay').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan); else scan();
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
