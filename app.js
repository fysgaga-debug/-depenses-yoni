const APP_KEY='dd_v2_state';
const SESSION_KEY='dd_v2_session';
const DEFAULT_PIN='1612';
const CATS={Courses:'🛒',Repas:'🍽️',Transport:'🚇',Études:'📚',Loisirs:'🎬',Divers:'🧾'};

const fmt=n=>new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(Number(n||0));
const ym=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
const today=()=>new Date().toISOString().slice(0,10);
const monthName=k=>{const [y,m]=k.split('-').map(Number);return new Intl.DateTimeFormat('fr-FR',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));};
const safePhone=s=>(s||'').replace(/\D/g,'');

function load(){try{return JSON.parse(localStorage.getItem(APP_KEY))||{profiles:{},expenses:[],messages:{}}}catch{return {profiles:{},expenses:[],messages:{}}}}
function save(){localStorage.setItem(APP_KEY,JSON.stringify(state))}
let state=load();
let session=JSON.parse(localStorage.getItem(SESSION_KEY)||'null');
let view='home';

function currentProfile(){return session?state.profiles[session.phone]:null}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}

function app(){
  if(!session || !currentProfile()) return renderLogin();
  const p=currentProfile();
  if(p.mustChangePin) return renderChangePin(true);
  renderShell();
}

function renderLogin(){
  document.getElementById('app').innerHTML=`<div class="auth"><div class="auth-card">
    <img class="auth-logo" src="dauphine-logo.jpeg" onerror="this.style.display='none'" alt="Dauphine">
    <h1>Dépenses Dauphine</h1><p>Connexion familiale simple</p>
    <form id="login" class="form">
      <div class="field"><label>Numéro de téléphone</label><input id="phone" inputmode="tel" autocomplete="tel" placeholder="06 00 00 00 00" required></div>
      <div class="field"><label>Code à 4 chiffres</label><input id="pin" class="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required></div>
      <button class="btn btn-primary btn-block">Se connecter</button>
    </form>
    <p class="subtle">Premier accès : code initial <b>1612</b>. Vous choisirez ensuite votre code personnel.</p>
  </div></div>`;
  document.getElementById('login').onsubmit=e=>{
    e.preventDefault(); const phone=safePhone(phoneEl().value), pin=document.getElementById('pin').value;
    if(phone.length<10) return toast('Numéro de téléphone invalide');
    let p=state.profiles[phone];
    if(!p){
      if(pin!==DEFAULT_PIN) return toast('Pour un premier accès, utilisez 1612');
      const role=confirm('Ce profil est-il celui de l’étudiant ?\nOK = Étudiant / Annuler = Parent')?'student':'parent';
      p={phone,pin:DEFAULT_PIN,role,name:role==='student'?'Yoni':'Parent',mustChangePin:true,createdAt:new Date().toISOString()}; state.profiles[phone]=p; save();
    } else if(p.pin!==pin){ return toast('Code incorrect'); }
    session={phone}; localStorage.setItem(SESSION_KEY,JSON.stringify(session)); app();
  };
}
function phoneEl(){return document.getElementById('phone')}

function renderChangePin(first=false){
  const p=currentProfile();
  document.getElementById('app').innerHTML=`<div class="auth"><div class="auth-card"><h1>${first?'Choisissez votre code':'Modifier le code'}</h1><p>4 chiffres. Le code 1612 ne sera plus accepté pour ce profil.</p>
  <form id="chg" class="form"><div class="field"><label>Nouveau code</label><input id="p1" class="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required></div><div class="field"><label>Confirmer</label><input id="p2" class="pin" inputmode="numeric" maxlength="4" pattern="[0-9]{4}" required></div><button class="btn btn-primary btn-block">Enregistrer</button></form></div></div>`;
  document.getElementById('chg').onsubmit=e=>{e.preventDefault();let a=p1.value,b=p2.value;if(!/^\d{4}$/.test(a)||a!==b)return toast('Les deux codes doivent être identiques');if(a===DEFAULT_PIN)return toast('Choisissez un code différent de 1612');p.pin=a;p.mustChangePin=false;save();toast('Code enregistré');setTimeout(app,300)};
}

function renderShell(){
 const p=currentProfile();
 document.getElementById('app').innerHTML=`<div class="shell">
 <header class="header"><div class="watermark">D</div><div class="header-row"><div class="brand"><img class="logo" src="dauphine-logo.jpeg" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" alt="Dauphine"><div class="logo-fallback">D</div><div><div class="eyebrow">DÉPENSES DAUPHINE</div><div class="title">${p.role==='student'?'Profil étudiant':'Profil parents'}</div></div></div><button class="role-pill" id="roleBtn">${p.role==='student'?'Voir Parents':'Voir Étudiant'}</button></div></header>
 <main id="main" class="container"></main>
 <nav class="tabs"><button class="tab ${view==='home'?'active':''}" data-v="home"><b>⌂</b>Accueil</button><button class="tab ${view==='expenses'?'active':''}" data-v="expenses"><b>€</b>Dépenses</button><button class="tab ${view==='history'?'active':''}" data-v="history"><b>▥</b>Historique</button><button class="tab ${view==='profile'?'active':''}" data-v="profile"><b>◉</b>Profil</button></nav></div>`;
 document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{view=b.dataset.v;renderShell()});
 document.getElementById('roleBtn').onclick=()=>toast('L’autre profil se connecte avec son propre numéro');
 ({home:homeView,expenses:expensesView,history:historyView,profile:profileView}[view]||homeView)();
}

function myExpenses(){return state.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt))}
function sums(){const d=new Date(), t=today(), mk=ym(d);const start=new Date(d);start.setDate(d.getDate()-((d.getDay()+6)%7));start.setHours(0,0,0,0);let day=0,week=0,month=0;for(const x of state.expenses){const xd=new Date(x.date+'T12:00:00');if(x.date===t)day+=+x.amount;if(xd>=start)week+=+x.amount;if(x.date.startsWith(mk))month+=+x.amount}return{day,week,month}}

function homeView(){const s=sums(),p=currentProfile(),msg=state.messages[today()]||{};document.getElementById('main').innerHTML=`
 <div class="grid3"><div class="metric"><small>Aujourd’hui</small><strong>${fmt(s.day)}</strong></div><div class="metric"><small>Cette semaine</small><strong>${fmt(s.week)}</strong></div><div class="metric"><small>Ce mois-ci</small><strong>${fmt(s.month)}</strong></div></div>
 <section class="card"><div class="card-title"><h2>Messages du jour</h2><span class="subtle">${new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long'}).format(new Date())}</span></div><div class="message-grid">
 <div class="message-box"><h3>🎓 Message étudiant</h3><div class="message-text">${escapeHtml(msg.student||'Aucun message aujourd’hui.')}</div><div class="message-meta">Visible par les parents</div><button class="btn btn-soft btn-block" data-msg="student" style="margin-top:9px">${p.role==='student'?'Écrire / modifier':'Lire'}</button></div>
 <div class="message-box"><h3>👪 Message parents</h3><div class="message-text">${escapeHtml(msg.parent||'Aucun message aujourd’hui.')}</div><div class="message-meta">Visible par l’étudiant</div><button class="btn btn-soft btn-block" data-msg="parent" style="margin-top:9px">${p.role==='parent'?'Écrire / modifier':'Lire'}</button></div></div></section>
 <section class="card"><div class="card-title"><h2>Dépenses récentes</h2><button id="add" class="btn btn-blue">+ Ajouter</button></div><div class="expense-list">${expenseRows(myExpenses().slice(0,5))||'<div class="empty">Aucune dépense enregistrée.</div>'}</div></section>
 <section class="card"><div class="card-title"><h2>Historique mensuel</h2><button id="goHist" class="btn btn-soft">Voir tout</button></div>${monthRows()}</section>`;
 document.getElementById('add').onclick=expenseModal;document.getElementById('goHist').onclick=()=>{view='history';renderShell()};document.querySelectorAll('[data-msg]').forEach(b=>b.onclick=()=>{const kind=b.dataset.msg;if((p.role==='student'&&kind==='student')||(p.role==='parent'&&kind==='parent'))messageModal(kind)});wireMonths();
}

function expensesView(){document.getElementById('main').innerHTML=`<section class="card"><div class="card-title"><h2>Toutes les dépenses</h2><button id="add" class="btn btn-blue">+ Ajouter</button></div><div class="expense-list">${expenseRows(myExpenses())||'<div class="empty">Aucune dépense enregistrée.</div>'}</div></section>`;document.getElementById('add').onclick=expenseModal;}
function historyView(){document.getElementById('main').innerHTML=`<section class="card"><div class="card-title"><h2>Historique mensuel</h2><span class="subtle">Touchez un mois pour voir le détail</span></div>${monthRows(true)}<div id="monthDetail"></div></section>`;wireMonths(true)}
function profileView(){const p=currentProfile();document.getElementById('main').innerHTML=`<section class="card"><div class="card-title"><h2>Mon profil</h2></div><div class="profile-line"><span>Numéro</span><strong>${prettyPhone(p.phone)}</strong></div><div class="profile-line"><span>Profil</span><strong>${p.role==='student'?'Étudiant':'Parent'}</strong></div><div class="profile-line"><span>Session</span><strong>Reste connectée</strong></div><button id="pinChange" class="btn btn-soft btn-block" style="margin-top:14px">Modifier mon code PIN</button><button id="logout" class="btn btn-danger btn-block" style="margin-top:8px">Se déconnecter</button></section><div class="danger-note">Cette V2 fonctionne en stockage local sur l’appareil. Pour partager automatiquement les mêmes dépenses et messages entre plusieurs téléphones, il faudra connecter l’application à une base sécurisée.</div>`;document.getElementById('pinChange').onclick=()=>renderChangePin(false);document.getElementById('logout').onclick=()=>{localStorage.removeItem(SESSION_KEY);session=null;app()}}

function expenseRows(arr){return arr.map(x=>`<div class="expense"><div class="ico">${CATS[x.category]||'🧾'}</div><div><div class="name">${escapeHtml(x.shop||x.category)}</div><div class="meta">${dateFr(x.date)} · ${escapeHtml(x.category)}${x.note?' · '+escapeHtml(x.note):''}</div></div><div class="amount">${fmt(x.amount)}</div></div>`).join('')}
function groupedMonths(){const g={};for(const x of state.expenses){const k=x.date.slice(0,7);(g[k]??=[]).push(x)}return Object.entries(g).sort((a,b)=>b[0].localeCompare(a[0]))}
function monthRows(includeEmpty=false){const g=groupedMonths();if(!g.length)return '<div class="empty">Les mois apparaîtront ici dès qu’une dépense sera enregistrée.</div>';return `<div class="month-list">${g.map(([k,a])=>`<div class="month" data-month="${k}"><div><strong style="text-transform:capitalize">${monthName(k)}</strong><div class="subtle">${a.length} dépense${a.length>1?'s':''}</div></div><div style="display:flex;align-items:center;gap:10px"><strong>${fmt(a.reduce((s,x)=>s+(+x.amount),0))}</strong><span class="chev">›</span></div></div>`).join('')}</div>`}
function wireMonths(detailOnly=false){document.querySelectorAll('[data-month]').forEach(el=>el.onclick=()=>showMonth(el.dataset.month))}
function showMonth(k){const arr=myExpenses().filter(x=>x.date.startsWith(k));const html=`<div class="modal-backdrop" id="back"><div class="modal"><div class="card-title"><div><h2 style="text-transform:capitalize">${monthName(k)}</h2><div class="subtle">Total ${fmt(arr.reduce((s,x)=>s+(+x.amount),0))}</div></div><button id="close" class="btn btn-soft">Fermer</button></div><div class="expense-list">${expenseRows(arr)}</div></div></div>`;document.body.insertAdjacentHTML('beforeend',html);document.getElementById('close').onclick=closeModal;document.getElementById('back').onclick=e=>{if(e.target.id==='back')closeModal()}}
function closeModal(){document.querySelector('.modal-backdrop')?.remove()}

function expenseModal(){document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="back"><div class="modal"><div class="card-title"><h2>Nouvelle dépense</h2><button id="close" class="btn btn-soft">Fermer</button></div><form id="expForm" class="form"><div class="row2"><div class="field"><label>Date</label><input id="edate" type="date" value="${today()}" required></div><div class="field"><label>Montant</label><input id="eamount" inputmode="decimal" placeholder="0,00" required></div></div><div class="field"><label>Commerce</label><input id="eshop" placeholder="Ex. Carrefour"></div><div class="field"><label>Catégorie</label><select id="ecat">${Object.keys(CATS).map(c=>`<option>${c}</option>`).join('')}</select></div><div class="field"><label>Commentaire</label><input id="enote" placeholder="Optionnel"></div><button class="btn btn-primary btn-block">Enregistrer la dépense</button></form></div></div>`);document.getElementById('close').onclick=closeModal;document.getElementById('back').onclick=e=>{if(e.target.id==='back')closeModal()};document.getElementById('expForm').onsubmit=e=>{e.preventDefault();const n=parseFloat(eamount.value.replace(',','.'));if(!n||n<0)return toast('Montant invalide');state.expenses.push({id:crypto.randomUUID?crypto.randomUUID():Date.now().toString(),date:edate.value,amount:n,shop:eshop.value.trim(),category:ecat.value,note:enote.value.trim(),createdAt:new Date().toISOString()});save();closeModal();toast('Dépense enregistrée');renderShell()}}
function messageModal(kind){const m=state.messages[today()]||{};document.body.insertAdjacentHTML('beforeend',`<div class="modal-backdrop" id="back"><div class="modal"><div class="card-title"><h2>${kind==='student'?'Message étudiant':'Message parents'}</h2><button id="close" class="btn btn-soft">Fermer</button></div><form id="msgForm" class="form"><div class="field"><label>Message du jour</label><textarea id="msg">${escapeHtml(m[kind]||'')}</textarea></div><button class="btn btn-primary btn-block">Enregistrer</button></form></div></div>`);document.getElementById('close').onclick=closeModal;document.getElementById('msgForm').onsubmit=e=>{e.preventDefault();state.messages[today()]={...(state.messages[today()]||{}),[kind]:msg.value.trim(),updatedAt:new Date().toISOString()};save();closeModal();toast('Message enregistré');renderShell()}}
function dateFr(s){return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(s+'T12:00:00'))}
function prettyPhone(s){return s.replace(/(\d{2})(?=\d)/g,'$1 ').trim()}
function escapeHtml(s=''){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
app();
