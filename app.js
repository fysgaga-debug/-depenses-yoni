const EUR = new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'});
const $ = s => document.querySelector(s);
const CATS = {Courses:'🛒',Repas:'🍽️',Transport:'🚌','Études':'📚',Logement:'🏠',Santé:'🩺',Loisirs:'🎟️','Vêtements':'👕',Divers:'•'};
const seed = [
 {id:1,date:'2026-09-14',merchant:'Monoprix',amount:11.60,category:'Repas',note:'Déjeuner',source:'demo'},
 {id:2,date:'2026-09-14',merchant:'RATP',amount:31.20,category:'Transport',note:'Transport',source:'demo'},
 {id:3,date:'2026-09-15',merchant:'CROUS',amount:3.30,category:'Repas',note:'Cantine',source:'demo'},
 {id:4,date:'2026-09-15',merchant:'Librairie',amount:15.30,category:'Études',note:'Livre',source:'demo'},
 {id:5,date:'2026-09-16',merchant:'Carrefour',amount:24.50,category:'Courses',note:'Courses',source:'demo'}
];
let expenses = JSON.parse(localStorage.getItem('dd_expenses')||'null') || seed;
let pendingImage = null;
function save(){localStorage.setItem('dd_expenses',JSON.stringify(expenses));render();}
function parseDate(d){return new Date(d+'T12:00:00');}
function isoWeekStart(date){const d=new Date(date);const day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);d.setHours(0,0,0,0);return d;}
function keyWeek(date){return isoWeekStart(parseDate(date)).toISOString().slice(0,10)}
function fmtDate(s){return parseDate(s).toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short'})}
function monthKey(s){return s.slice(0,7)}
function monthLabel(k){return new Date(k+'-01T12:00:00').toLocaleDateString('fr-FR',{month:'long',year:'numeric'})}
function todayISO(){return new Date().toISOString().slice(0,10)}
function total(list){return list.reduce((a,b)=>a+Number(b.amount||0),0)}
function render(){
 const today=todayISO(); const curMonth=today.slice(0,7); const wk=keyWeek(today);
 $('#todayTotal').textContent=EUR.format(total(expenses.filter(x=>x.date===today)));
 $('#weekTotal').textContent=EUR.format(total(expenses.filter(x=>keyWeek(x.date)===wk)));
 const currentMonthExpenses=expenses.filter(x=>monthKey(x.date)===curMonth);
 $('#monthTotal').textContent=EUR.format(total(currentMonthExpenses));
 $('#parentMonthTotal').textContent=EUR.format(total(currentMonthExpenses));
 $('#budgetRemaining').textContent=EUR.format(Math.max(0,900-total(currentMonthExpenses)));

 const weeks=[...new Set(expenses.map(x=>keyWeek(x.date)))].sort().reverse();
 $('#studentWeekSelect').innerHTML=weeks.map(w=>`<option value="${w}" ${w===wk?'selected':''}>Semaine du ${new Date(w+'T12:00:00').toLocaleDateString('fr-FR',{day:'numeric',month:'short'})}</option>`).join('');
 renderStudentWeek($('#studentWeekSelect').value || weeks[0]);
 const months=[...new Set(expenses.map(x=>monthKey(x.date)))].sort().reverse();
 $('#monthBubbles').innerHTML=months.map(m=>`<div class="bubble"><span>${monthLabel(m)}</span><strong>${EUR.format(total(expenses.filter(x=>monthKey(x.date)===m)))}</strong></div>`).join('');
 $('#parentMonthSelect').innerHTML=months.map(m=>`<option value="${m}" ${m===curMonth?'selected':''}>${monthLabel(m)}</option>`).join('');
 renderParentMonth($('#parentMonthSelect').value || months[0]);
}
function expenseHTML(x){return `<div class="expense"><div class="ico">${CATS[x.category]||'•'}</div><div class="meta"><strong>${escapeHtml(x.merchant)}</strong><span>${escapeHtml(x.category)} · ${escapeHtml(x.note||'')}</span></div><div class="amt">${EUR.format(x.amount)}</div></div>`}
function renderStudentWeek(w){
 const list=expenses.filter(x=>keyWeek(x.date)===w).sort((a,b)=>a.date.localeCompare(b.date));
 let html=''; let last=''; list.forEach(x=>{if(x.date!==last){html+=`<div class="day-label">${fmtDate(x.date)} · ${EUR.format(total(list.filter(e=>e.date===x.date)))}</div>`;last=x.date}html+=expenseHTML(x)});
 $('#studentExpenseList').innerHTML=html||'<p>Aucune dépense pour cette semaine.</p>';
}
function renderParentMonth(m){
 const list=expenses.filter(x=>monthKey(x.date)===m).sort((a,b)=>b.date.localeCompare(a.date)); const grand=total(list);
 const sums={};list.forEach(x=>sums[x.category]=(sums[x.category]||0)+Number(x.amount));
 $('#categoryBars').innerHTML=Object.entries(sums).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<div class="bar-row"><span>${CATS[k]||'•'} ${k}</span><div class="track"><div class="fill" style="width:${grand?Math.round(v/grand*100):0}%"></div></div><strong>${EUR.format(v)}</strong></div>`).join('')||'<p>Aucune dépense.</p>';
 $('#parentExpenseList').innerHTML=list.map(x=>expenseHTML(x)).join('')||'<p>Aucune dépense.</p>';
}
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
$('#roleSwitch').addEventListener('click',()=>{const student=$('#studentView').classList.contains('active');$('#studentView').classList.toggle('active',!student);$('#parentView').classList.toggle('active',student);$('#roleLabel').textContent=student?'Profils parents':'Profil étudiant';$('#roleSwitch').textContent=student?'Voir Yoni':'Voir Parents';});
$('#studentWeekSelect').addEventListener('change',e=>renderStudentWeek(e.target.value));
$('#parentMonthSelect').addEventListener('change',e=>renderParentMonth(e.target.value));
$('#scanBtn').addEventListener('click',()=>$('#ticketInput').click());
$('#ticketInput').addEventListener('change',async e=>{const file=e.target.files?.[0]; if(!file)return; pendingImage=file; const url=URL.createObjectURL(file);$('#ticketPreview').src=url;$('#expenseDate').value=todayISO();$('#merchant').value='';$('#amount').value='';$('#category').value='Courses';$('#note').value='';$('#reviewDialog').showModal();await runOCR(file);});
async function runOCR(file){
 $('#ocrStatus').textContent='Analyse du ticket en cours…';
 try{const {data:{text}}=await Tesseract.recognize(file,'fra'); const lines=text.split(/\n/).map(x=>x.trim()).filter(Boolean); const joined=lines.join(' ');
 const dateMatch=joined.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](20\d{2})\b/); if(dateMatch){$('#expenseDate').value=`${dateMatch[3]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[1].padStart(2,'0')}`}
 const moneyMatches=[...joined.matchAll(/(\d+[,.]\d{2})\s*€?/g)].map(m=>Number(m[1].replace(',','.'))).filter(n=>n>0&&n<5000); if(moneyMatches.length) $('#amount').value=Math.max(...moneyMatches).toFixed(2);
 const merchant=lines.find(l=>l.length>2 && !/ticket|merci|total|tva|date|heure|carte|cb/i.test(l)); if(merchant) $('#merchant').value=merchant.slice(0,50);
 const low=joined.toLowerCase(); let cat='Divers'; if(/ratp|sncf|navigo|bus|metro|métro|uber/.test(low))cat='Transport'; else if(/crous|restaurant|sandwich|pizza|burger|cafe|café/.test(low))cat='Repas'; else if(/carrefour|monoprix|auchan|leclerc|super u|intermarch/.test(low))cat='Courses'; else if(/librairie|livre|fnac|papeterie/.test(low))cat='Études'; $('#category').value=cat;
 $('#ocrStatus').textContent='Analyse terminée — vérifie chaque information avant validation.';
 }catch(err){$('#ocrStatus').textContent='Lecture automatique incomplète. Vérifie et saisis les informations manuellement.';}
}
$('#saveExpense').addEventListener('click',e=>{e.preventDefault(); const amount=Number($('#amount').value); if(!$('#expenseDate').value||!$('#merchant').value||!amount){alert('Merci de vérifier la date, le commerce et le montant.');return;} expenses.push({id:Date.now(),date:$('#expenseDate').value,merchant:$('#merchant').value.trim(),amount,category:$('#category').value,note:$('#note').value.trim(),source:'ticket'});$('#reviewDialog').close();$('#ticketInput').value='';save();});
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js');
render();
