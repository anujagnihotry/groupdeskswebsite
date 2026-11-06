
// ---- Pricing config: edit prices here. Monthly amounts per plan. ----
var PRICING={
  INR:{symbol:'₹',locale:'en-IN',starter:1799,growth:1999},
  USD:{symbol:'$',locale:'en-US',starter:20,growth:25}
};
(function(){
  // India is detected from the browser time zone (no IP lookup, no tracking).
  function detect(){
    try{
      var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';
      if(tz==='Asia/Kolkata'||tz==='Asia/Calcutta')return 'INR';
    }catch(e){}
    return 'USD';
  }
  var saved=null;
  try{saved=localStorage.getItem('gd-currency')}catch(e){}
  function apply(cur){
    var c=PRICING[cur];
    document.querySelectorAll('[data-price]').forEach(function(el){
      el.textContent=c.symbol+c[el.getAttribute('data-price')].toLocaleString(c.locale);
    });
    document.querySelectorAll('.cur button').forEach(function(b){
      b.setAttribute('aria-pressed',b.getAttribute('data-cur')===cur?'true':'false');
    });
  }
  document.querySelectorAll('.cur button').forEach(function(b){
    b.addEventListener('click',function(){
      var cur=b.getAttribute('data-cur');
      try{localStorage.setItem('gd-currency',cur)}catch(e){}
      apply(cur);
    });
  });
  apply(PRICING[saved]?saved:detect());
})();
(function(){
  var desks=[
    {id:'sales',label:'Sales',bg:'var(--sales-bg)',fg:'var(--sales-fg)',dot:'#FFC93C',who:'For sales teams and distributors',head:'Never lose an order inside a dealer group.',body:'Dealer and customer groups land in one Sales view. Assign each chat to a salesperson, see who replied last, and pick up the conversation even when the original rep is on leave.',points:['Assign chats and groups to a salesperson in one click','Quick replies for rate lists, catalogues and payment details','See every open enquiry across all reps on one screen','Hand over a customer with the full chat history']},
    {id:'support',label:'Support',bg:'var(--support-bg)',fg:'var(--support-fg)',dot:'#3B93F5',who:'For service and after-sales teams',head:'Every complaint has an owner and a status.',body:'Service requests come in on WhatsApp. Your support team claims them, discusses them internally without the customer seeing, and closes them when done.',points:['Open, pending and closed status on every chat','Internal notes and @mentions the customer never sees','Alerts so two people don’t reply at once','Follow-up reminders for chats waiting on the customer']},
    {id:'dispatch',label:'Dispatch & ops',bg:'var(--dispatch-bg)',fg:'var(--dispatch-fg)',dot:'#8B74E8',who:'For warehouse, logistics and field teams',head:'The godown sees what sales promised.',body:'Dispatch and field staff sign in from their own phone and see the exact order messages, so nothing is lost between the office and the warehouse.',points:['Field staff work from the mobile app on the same number','Tag chats by order, route or vehicle','Share photos and documents from the shared inbox','Owners follow the whole flow without asking for updates']},
    {id:'accounts',label:'Accounts',bg:'var(--accounts-bg)',fg:'var(--accounts-fg)',dot:'#F08A55',who:'For accounts and payment follow-up',head:'Payment reminders without chasing the sales team.',body:'Accounts gets its own desk on the same number. Follow up on pending payments in the customer’s existing chat, with sales able to see what was said.',points:['A separate desk for payment follow-ups','Internal notes link a chat to invoice or ledger details','Saved replies for reminders, UPI and bank details','A clear record of every promise to pay']},
    {id:'owners',label:'Owners',bg:'var(--azure-tint)',fg:'var(--azure)',dot:'#1468C8',who:'For business owners and team leads',head:'See every desk without holding every phone.',body:'Owners get a live view of all chats, desks and teammates from anywhere, and step in only when needed.',points:['Live view of unanswered chats by desk','Response time per desk and per teammate','Add or remove staff without changing the number','Chats stay with the business, not with a person']},
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
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var name=document.getElementById('f-name').value.trim();
    var digits=document.getElementById('f-phone').value.replace(/\D/g,'');
    var err=document.getElementById('f-err');
    if(!name||digits.length<10){err.hidden=false;return}
    err.hidden=true;
    // TODO on groupdesks.com: send the form data to your backend or form service here.
    form.hidden=true;
    document.getElementById('thanks').hidden=false;
  });
})();
