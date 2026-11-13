
// ---- Pricing config: edit prices here. Monthly amounts per plan. ----
var PRICING={
  INR:{symbol:'₹',locale:'en-IN',starter:1799,growth:1999},
  USD:{symbol:'$',locale:'en-US',starter:20,growth:25}
};
(function(){
  // Currency is chosen automatically: India -> INR, everywhere else -> USD.
  // Country comes from the visitor's IP (Cloudflare trace); the browser time zone is the fallback.
  function fromTimeZone(){
    try{
      var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
      if(tz==='Asia/Kolkata'||tz==='Asia/Calcutta')return 'INR';
    }catch(e){}
    return 'USD';
  }
  var done=false;
  function show(cur){
    if(done)return;done=true;
    var c=PRICING[cur];
    document.querySelectorAll('[data-price]').forEach(function(el){
      el.textContent=c.symbol+c[el.getAttribute('data-price')].toLocaleString(c.locale);
    });
    document.documentElement.classList.add('priced');
  }
  try{localStorage.removeItem('gd-currency')}catch(e){}
  if(!window.fetch){show(fromTimeZone());return}
  var ctl=window.AbortController?new AbortController():null;
  var timer=setTimeout(function(){if(ctl)ctl.abort();show(fromTimeZone())},2500);
  fetch('https://www.cloudflare.com/cdn-cgi/trace',{signal:ctl?ctl.signal:undefined})
    .then(function(r){return r.text()})
    .then(function(txt){
      clearTimeout(timer);
      var m=/^loc=([A-Z]{2})$/m.exec(txt);
      show(m?(m[1]==='IN'?'INR':'USD'):fromTimeZone());
    })
    .catch(function(){clearTimeout(timer);show(fromTimeZone())});
})();
(function(){
  var desks=[
    {id:'sales',label:'Sales',bg:'var(--sales-bg)',fg:'var(--sales-fg)',dot:'#FFC93C',who:'For sales teams and distributors',head:'Never lose an order inside a dealer group.',body:'Dealer and customer groups land in one Sales view. Assign each chat to a salesperson, see who replied last, and pick up the conversation even when the original rep is on leave.',points:['Assign chats and groups to a salesperson in one click','Quick replies for rate lists, catalogues and payment details','See every open enquiry across all reps on one screen','Hand over a customer with the full chat history']},
    {id:'support',label:'Support',bg:'var(--support-bg)',fg:'var(--support-fg)',dot:'#3B93F5',who:'For service and after-sales teams',head:'Every complaint has an owner and a status.',body:'Service requests come in on WhatsApp. Your support team claims them, discusses them internally without the customer seeing, and closes them when done.',points:['Open, pending and closed status on every chat','Internal notes and @mentions the customer never sees','Alerts so two people don’t reply at once','Follow-up reminders for chats waiting on the customer']},
    {id:'dispatch',label:'Dispatch & ops',bg:'var(--dispatch-bg)',fg:'var(--dispatch-fg)',dot:'#8B74E8',who:'For warehouse, logistics and field teams',head:'The godown sees what sales promised.',body:'Dispatch and field staff sign in from their own phone and see the exact order messages, so nothing is lost between the office and the warehouse.',points:['Field staff work from the mobile app on the same number','Tag chats by order, route or vehicle','Share photos and documents from the shared inbox','Owners follow the whole flow without asking for updates']},
    {id:'accounts',label:'Accounts',bg:'var(--accounts-bg)',fg:'var(--accounts-fg)',dot:'#F08A55',who:'For accounts and payment follow-up',head:'Payment reminders without chasing the sales team.',body:'Accounts gets its own desk on the same number. Follow up on pending payments in the customer’s existing chat, with sales able to see what was said.',points:['A separate desk for payment follow-ups','Internal notes link a chat to invoice or ledger details','Saved replies for reminders, UPI and bank details','A clear record of every promise to pay']},
    {id:'owners',label:'Owners',bg:'var(--azure-tint)',fg:'var(--azure)',dot:'#1468C8',who:'For business owners and team leads',head:'See every desk without holding every phone.',body:'Owners get a real-time view of all chats, desks and teammates from anywhere, and step in only when needed.',points:['Real-time view of unanswered chats by desk','Response time per desk and per teammate','Add or remove staff without changing the number','Chats stay with the business, not with a person']},
    {id:'groups',label:'Communities',bg:'var(--sunny-tint)',fg:'var(--sunny-ink)',dot:'#E0A800',who:'For businesses managing many WhatsApp groups',head:'Run hundreds of groups like one inbox.',body:'Dealer networks, franchise groups and project groups: GroupDesks surfaces the messages that need a reply and lets the whole team moderate together.',points:['All groups in one searchable list','Filter to messages that ask a question or mention your team','Assign groups to the team that owns them','Send updates to selected groups']}
  ];
  var tabs=document.getElementById('tabs');
  var check='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
  function show(i,focus){
    var d=desks[i];
    Array.prototype.forEach.call(tabs.children,function(b,j){b.setAttribute('aria-selected',j===i?'true':'false');b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus()});
    var who=document.getElementById('p-who');
    who.textContent=d.who;who.style.background=d.bg;who.style.color=d.fg;
    document.getElementById('p-head').textContent=d.head;
    document.getElementById('p-body').textContent=d.body;
    document.getElementById('p-points').innerHTML=d.points.map(function(p){return '<li>'+check+'<span>'+esc(p)+'</span></li>'}).join('');
  }
  desks.forEach(function(d,i){
    var b=document.createElement('button');
    b.type='button';b.className='tab';b.id='tab-'+d.id;b.setAttribute('role','tab');b.setAttribute('aria-controls','panel');
    b.innerHTML='<span class="dot" style="background:'+d.dot+'"></span>'+esc(d.label);
    b.addEventListener('click',function(){show(i)});
    b.addEventListener('keydown',function(e){
      if(e.key==='ArrowRight'){e.preventDefault();show((i+1)%desks.length,true)}
      if(e.key==='ArrowLeft'){e.preventDefault();show((i-1+desks.length)%desks.length,true)}
    });
    tabs.appendChild(b);
  });
  show(0);

  var copyBtn=document.getElementById('copy-num');
  copyBtn.addEventListener('click',function(){
    var text=document.getElementById('wa-num').textContent;
    function done(){copyBtn.textContent='Copied';setTimeout(function(){copyBtn.textContent='Copy number'},1600)}
    function fallback(){var r=document.createRange();r.selectNodeContents(document.getElementById('wa-num'));var s=window.getSelection();s.removeAllRanges();s.addRange(r)}
    try{navigator.clipboard.writeText(text).then(done,fallback)}catch(e){fallback()}
  });

  var form=document.getElementById('early-form');
  var err=document.getElementById('f-err');
  var ERR_DEFAULT=err.textContent;
  var submitBtn=form.querySelector('button[type="submit"]');
  var again=document.getElementById('again');
  if(again)again.addEventListener('click',function(){document.getElementById('thanks').hidden=true;form.hidden=false;document.getElementById('f-name').focus()});
  function fail(msg){err.textContent=msg;err.hidden=false}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var v=function(id){return document.getElementById(id).value.trim()};
    var digits=v('f-phone').replace(/\D/g,'');
    if(!v('f-name')||digits.length<10||!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('f-email'))){fail(ERR_DEFAULT);return}
    err.hidden=true;
    submitBtn.disabled=true;submitBtn.textContent='Sending…';
    fetch('/api/early-access',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:v('f-name'),email:v('f-email'),phone:v('f-phone'),company:v('f-company'),size:document.getElementById('f-size').value,website:v('f-hp')})
    }).then(function(r){return r.json().catch(function(){return{}}).then(function(d){return{ok:r.ok&&d.ok,status:r.status}})})
    .then(function(res){
      if(res.ok){form.reset();err.hidden=true;form.hidden=true;document.getElementById('thanks').hidden=false;return}
      fail(res.status===429?'Too many requests. Please try again in a while or message us on WhatsApp.':res.status===400?ERR_DEFAULT:'Something went wrong. Please try again or message us on WhatsApp.');
    })
    .catch(function(){fail('Could not send. Check your connection or message us on WhatsApp.')})
    .then(function(){submitBtn.disabled=false;submitBtn.textContent='Get started'});
  });
})();
