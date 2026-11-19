/* pret.js — onglet « Prêts entre proches » (JS + CSS). À charger dans index.html avec : <script src="pret.js"></script> */
(()=>{if(document.getElementById("pq-css"))return;const s=document.createElement("style");s.id="pq-css";s.textContent=`
/* Prêts entre proches (v2) */
.pq-info{margin:0 0 14px;color:var(--mute);font-size:var(--fs-md)}.pq-info p{margin:6px 0 0;border-left:3px solid var(--accent);padding-left:10px}
.pq-k{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:16px}
.pq-kc{display:flex;flex-direction:column;gap:2px;padding:16px 20px;background:var(--surface);box-shadow:var(--sh);border-radius:var(--rc,16px);border-left:5px solid var(--line)}
.pq-kc.p{border-left-color:var(--pos)}.pq-kc.n{border-left-color:var(--neg)}
.pq-kc b{font-size:clamp(1.5rem,4.5vw,2.1rem);font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1.15}
.pq-fh{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px}.pq-fh h2{margin:0}
.pq-fs:not(.open) .pq-fh{margin-bottom:0}
.pq-f{display:flex;flex-direction:column;gap:12px}
.pq-seg{display:flex;gap:0;border:1px solid var(--line);border-radius:var(--rb,8px);overflow:hidden;width:100%;max-width:460px}
.pq-seg button{flex:1;border:0;border-radius:0;min-height:42px;background:var(--surface);color:var(--mute);font-weight:600}
.pq-seg button+button{border-left:1px solid var(--line)}
.pq-seg button[aria-pressed="true"]{background:var(--accent);color:var(--onacc);font-weight:700}
.pq-seg button.out[aria-pressed="true"]{background:var(--neg);color:var(--onneg)}.pq-seg button.in[aria-pressed="true"]{background:var(--pos);color:var(--onneg)}
.pq-k1{margin:-4px 0 0}
.pq-g{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px}
.pq-g label{display:flex;flex-direction:column;gap:4px;font-size:var(--fs-sm);font-weight:600;color:var(--mute);min-width:0}
.pq-g input,.pq-g select{width:100%;height:42px;font-size:var(--fs-lg);color:var(--ink);background:var(--surface)}
.pq-g .pq-n{grid-column:1/-1}.pq-g label[hidden]{display:none}
.pq-chips{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pq-chip{border-radius:999px;padding:4px 12px}
.pq-bt{display:flex;gap:8px;flex-wrap:wrap}
.pq-cs{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:18px;width:100%}
.pq-c{display:flex;flex-direction:column;gap:5px;padding:14px 18px;border:1px solid var(--line);border-left:5px solid var(--line);border-radius:var(--rc2,12px);background:var(--bg);cursor:pointer}
.pq-c.p{border-left-color:var(--pos)}.pq-c.n{border-left-color:var(--neg)}.pq-c.z{opacity:.75}
.pq-c:hover{box-shadow:var(--sh)}.pq-c[aria-current="true"]{outline:2px solid var(--accent);outline-offset:1px}
.pq-ch{display:flex;justify-content:space-between;gap:8px;align-items:center}.pq-ch b{font-size:1.15rem;font-weight:800}
.pq-cv{font-size:clamp(1.6rem,3.2vw,2.1rem);line-height:1.1;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}.pq-c.p .pq-cv{color:var(--pos)}.pq-c.n .pq-cv{color:var(--neg)}
.pq-ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:auto;padding-top:4px}.pq-ac button{padding:4px 10px;font-size:var(--fs-sm)}.pq-c .sub{font-size:var(--fs-md);line-height:1.3}.pq-c .pb2{height:8px;margin:2px 0;border-radius:4px}
.pq-bd{display:inline-block;width:fit-content;padding:1px 9px;border-radius:999px;border:1px solid var(--line);font-size:var(--fs-sm);color:var(--mute);white-space:nowrap}
.pq-bd.late{border-color:var(--neg);color:var(--neg);font-weight:700}.pq-bd.soon{border-color:#e9a23b;color:color-mix(in srgb,#e9a23b 75%,var(--ink));font-weight:700}
.pq-bd.o{color:var(--neg);border-color:var(--neg)}.pq-bd.i{color:var(--pos);border-color:var(--pos)}
.pq-empty{grid-column:1/-1;text-align:center;padding:18px 8px;color:var(--mute)}
.pq-l{list-style:none;margin:8px 0 0;padding:0}
.pq-r{display:grid;grid-template-columns:96px minmax(0,1fr) auto auto;gap:4px 14px;align-items:center;padding:7px 12px;border-left:4px solid var(--line)}
.pq-r.out{border-left-color:var(--neg)}.pq-r.in{border-left-color:var(--pos)}
.pq-r:nth-child(odd){background:color-mix(in srgb,var(--mute) 7%,var(--surface))}.pq-r:hover{background:color-mix(in srgb,var(--accent) 14%,var(--surface))}
.pq-m{min-width:0;display:flex;flex-direction:row;flex-wrap:nowrap;align-items:center;gap:4px 14px;white-space:nowrap}.pq-m>*{flex:0 0 auto}.pq-m .pq-bd{white-space:nowrap}.pq-m b{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}.pq-m small{color:var(--mute);font-size:var(--fs-sm);flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}.pq-m small.pq-nt{flex-shrink:3}
.pq-a{font-weight:700;font-variant-numeric:tabular-nums;text-align:right;white-space:nowrap}
.pq-x{display:flex;gap:4px}.pq-x button{min-width:34px;min-height:34px;padding:0;border-color:transparent;background:transparent;color:var(--mute)}.pq-x button:hover{background:var(--surface);border-color:var(--line);color:var(--ink)}.pq-x [data-pq-del]:hover{color:var(--neg);border-color:var(--neg)}
@media(max-width:600px){.pq-r{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"d a x" "m m m"}.pq-d{grid-area:d}.pq-a{grid-area:a}.pq-x{grid-area:x}.pq-m{grid-area:m}.pq-seg{max-width:none}}
/* Demi-écran : tout rentre dans la largeur, sans défilement horizontal */
.pq-bd{white-space:normal}.pq-g>*,.pq-m,.pq-c,.pq-kc,.pq-f,.fbar>*{min-width:0}
@media(max-width:1100px){
.pq-k{gap:10px}.pq-kc{padding:12px 14px}.pq-kc b{font-size:clamp(1.2rem,3.2vw,1.6rem)}
.pq-cs{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
.pq-c{padding:10px 10px;gap:3px}.pq-ch{flex-wrap:wrap;gap:2px}.pq-ch b{font-size:var(--fs-lg);overflow-wrap:anywhere}.pq-ch .pq-bd{display:none}.pq-cv{font-size:clamp(1.05rem,2.4vw,1.5rem)}.pq-c .sub{font-size:var(--fs-sm)}
.pq-ac{gap:4px}.pq-ac button{padding:3px 6px;font-size:.72rem;flex:1 1 auto}
.pq-r{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"d a x" "m m m";gap:4px 10px;padding:8px 10px}.pq-d{grid-area:d}.pq-a{grid-area:a}.pq-x{grid-area:x}.pq-m{grid-area:m}
.pq-g{grid-template-columns:repeat(auto-fit,minmax(130px,1fr))}
.fbar input[type=search]{flex:1 1 140px}.fbar select{flex:1 1 130px;min-width:0}
}
@media(max-width:560px){.pq-cs{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;document.head.appendChild(s)})();

/* ---------- Prêts entre proches (v2) : données isolées (S.prets), jamais lues par les comptes, budgets ou soldes ---------- */
const PRT={pret:{l:"J’ai prêté",s:1,out:1,w:"prêt de ma part"},recu:{l:"On m’a remboursé",s:-1,out:0,w:"remboursement reçu"},emp:{l:"J’ai emprunté",s:-1,out:0,w:"emprunt auprès de toi"},rendu:{l:"J’ai remboursé",s:1,out:1,w:"remboursement versé"}};
let PQO=false,PQE=null,PQP=null,PQH=true,PQF={q:"",t:"",w:""};
const PR=()=>S.prets&&Array.isArray(S.prets.ops)?S.prets:{ops:[]};
const prAcc=id=>{if(!id)return"—";if(id==="esp")return"Espèces";if(id==="aut")return"Autre";const a=S.acc.find(x=>x.id===id);return a?a.name:"Compte supprimé"};
const prKey=n=>String(n).trim().toLocaleLowerCase("fr");
const pqK=(o,r)=>o?(r?"rendu":"pret"):(r?"recu":"emp"),pqRep=k=>k==="recu"||k==="rendu";
const pqSg=n=>(n>0?"+":n<0?"−":"")+eur2(Math.abs(n));
const pqDue=d=>{if(!d)return"";const n=aboDays(d);return n<0?`<span class="pq-bd late">En retard de ${-n} j</span>`:n===0?`<span class="pq-bd soon">Échéance aujourd’hui</span>`:`<span class="pq-bd${n<=7?" soon":""}">Échéance dans ${n} j</span>`};
function prGroups(){const m=new Map();
  PR().ops.forEach(o=>{const k=prKey(o.who);if(!m.has(k))m.set(k,{key:k,name:o.who,bal:0,n:0,last:"",pret:0,recu:0,emp:0,rendu:0,ops:[]});
    const g=m.get(k);g.bal+=PRT[o.k].s*o.v;g.n++;g[o.k]+=o.v;g.ops.push(o);if(o.date>g.last)g.last=o.date});
  m.forEach(g=>{g.bal=Math.round(g.bal*100)/100;
    const dk=g.bal>0?"pret":"emp",dd=g.ops.filter(o=>o.k===dk&&o.due).map(o=>o.due).sort()[0];g.due=g.bal?dd||"":"";
    const tot=g.bal>0?g.pret:g.emp,back=g.bal>0?g.recu:g.rendu;g.pct=g.bal&&tot>0&&back>0?Math.min(99,Math.round(back/tot*100)):null});
  return[...m.values()]}
function pqRows(){const ops=PR().ops,asc=ops.map((o,i)=>({o,i})).sort((a,b)=>a.o.date.localeCompare(b.o.date)||a.i-b.i),run={},bal={};
  asc.forEach(({o})=>{const k=prKey(o.who);run[k]=(run[k]||0)+PRT[o.k].s*o.v;bal[o.id]=Math.round(run[k]*100)/100});
  const nq=norm(PQF.q).split(/\s+/).filter(Boolean);
  const list=asc.reverse().map(x=>x.o).filter(o=>(!PQF.w||prKey(o.who)===PQF.w)&&(!PQF.t||(PQF.t==="out")===!!PRT[o.k].out)&&nq.every(w=>norm([o.who,o.note,PRT[o.k].l,prAcc(o.ac),dfr(o.date),String(o.v),f(o.v)].join(" ")).includes(w)));
  return{list,bal}}
function pqCards(){
  const G=prGroups(),open=G.filter(g=>g.bal).sort((a,b)=>Math.abs(b.bal)-Math.abs(a.bal)),done=G.filter(g=>!g.bal).sort((a,b)=>a.name.localeCompare(b.name,"fr",{sensitivity:"base"})),shown=PQH?open:[...open,...done];
  const card=g=>{const z=!g.bal,p=g.bal>0,k=esc(g.key);
    return `<article class="pq-c ${z?"z":p?"p":"n"}" data-pq-card="${k}"${PQF.w===g.key?' aria-current="true"':""}><div class="pq-ch"><b>${esc(g.name)}</b><span class="pq-bd">${g.n} op.</span></div>
    <div class="pq-cv">${z?"Soldé":eur2(Math.abs(g.bal))}</div><div class="sub">${z?"Rien à rembourser de part et d’autre":p?esc(g.name)+" me doit cette somme":"Je dois cette somme à "+esc(g.name)}</div>
    ${g.pct!==null?`<div class="pb2" role="img" aria-label="${g.pct} % remboursé"><i style="width:${g.pct}%"></i></div><div class="sub">${g.pct} % déjà remboursé</div>`:""}
    <div class="sub">Dernière opération : ${ago(g.last)}</div>${g.due?pqDue(g.due):""}
    <div class="pq-ac"><button data-pq-add="${k}:pret">+ Prêt</button><button data-pq-add="${k}:rep">+ Remboursement</button>${z?"":`<button data-pq-solde="${k}">Solder</button><button data-pq-recap="${k}">Récap</button>`}<button data-pq-hist="${k}">Historique</button><button data-pq-ren="${k}">Renommer</button></div></article>`};
  const el=$("#pqc");if(!el)return;
  el.innerHTML=shown.length?shown.map(card).join(""):(G.length?`<p class="empty">Tous les comptes sont soldés.</p>`:`<div class="pq-empty"><p>Aucune opération pour l’instant. Notez ici ce que vous prêtez, empruntez ou remboursez à vos proches.</p><button class="primary" data-pq-new>Ajouter mon premier prêt</button></div>`)}
function pqMark(){document.querySelectorAll("[data-pq-card]").forEach(c=>{c.dataset.pqCard===PQF.w?c.setAttribute("aria-current","true"):c.removeAttribute("aria-current")});const s=$("#pqw");if(s)s.value=PQF.w}
function pqHist(){const el=$("#pqhl");if(!el)return;const{list,bal}=pqRows();
  const tot=list.reduce((s,o)=>s+(PRT[o.k].out?-o.v:o.v),0);
  el.innerHTML=list.length?`<p class="sub">${list.length} opération(s) · flux net : <b class="${tot>0?"pos":tot<0?"neg":""}">${pqSg(tot)}</b></p><ul class="pq-l">${list.map(o=>{const t=PRT[o.k],out=!!t.out,g=prGroups().find(z=>z.key===prKey(o.who));
    const open=g&&g.bal&&((g.bal>0&&o.k==="pret")||(g.bal<0&&o.k==="emp"));
    return `<li class="pq-r ${out?"out":"in"}"><span class="pq-d">${dfr(o.date)}</span><div class="pq-m"><b>${esc(o.who)}</b> <span class="pq-bd ${out?"o":"i"}">${out?"▲ Sortie":"▼ Entrée"} · ${t.l}</span>${o.note?`<small class="pq-nt" title="${esc(o.note)}">${esc(o.note)}</small>`:""}<small>Payé via : ${esc(prAcc(o.ac))}${PQF.w?` · Solde après : ${pqSg(bal[o.id])}`:""}</small>${open&&o.due?pqDue(o.due):""}</div><span class="pq-a ${out?"neg":"pos"}">${out?"−":"+"}${eur2(o.v)}</span><span class="pq-x"><button data-pq-e="${o.id}" aria-label="Modifier" title="Modifier">✎</button><button data-pq-del="${o.id}" aria-label="Supprimer" title="Supprimer">✕</button></span></li>`}).join("")}</ul>`:`<p class="empty">${PR().ops.length?"Aucune opération avec ces filtres.":"Rien à afficher pour l’instant."}</p>`}
function drawPre(){
  const P=PR(),ops=P.ops,G=prGroups(),ed=PQE&&ops.find(o=>o.id===PQE);if(PQE&&!ed)PQE=null;
  if(PQF.w&&!G.some(g=>g.key===PQF.w))PQF.w="";
  const dueG=G.filter(g=>g.bal>0),oweG=G.filter(g=>g.bal<0),due=dueG.reduce((a,g)=>a+g.bal,0),owe=oweG.reduce((a,g)=>a-g.bal,0),net=due-owe;
  const e=ed||PQP||{who:"",k:"pret",date:today(),v:"",note:"",ac:"",due:""},out=!!PRT[e.k].out,rep=pqRep(e.k),showF=PQO||ed||PQP;
  const rec=[];[...ops].sort((a,b)=>b.date.localeCompare(a.date)).forEach(o=>{if(rec.length<6&&!rec.some(n=>prKey(n)===prKey(o.who)))rec.push(o.who)});
  const seg=(a,v,l,on,cl)=>`<button type="button" data-pq-${a}="${v}" class="${cl||""}" aria-pressed="${on}">${l}</button>`;
  const form=showF?`<form id="pqf" class="pq-f" autocomplete="off"><input type="hidden" name="k" value="${e.k}">
   <div class="pq-seg" role="group" aria-label="Sens de l’argent">${seg("out",1,"▲ Je donne",out,"out")}${seg("out",0,"▼ Je reçois",!out,"in")}</div>
   <div class="pq-seg" role="group" aria-label="Nature de l’opération">${seg("rep",0,"Prêt / emprunt",!rep)}${seg("rep",1,"Remboursement",rep)}</div>
   <p class="sub pq-k1" id="pqk" role="status">Enregistré : ${PRT[e.k].l}</p>
   <div class="pq-g"><label class="pq-w">Proche<input name="w" list="pqn" maxlength="40" required value="${esc(e.who)}" placeholder="Nom" autocomplete="off"></label><datalist id="pqn">${G.map(g=>`<option value="${esc(g.name)}">`).join("")}</datalist>
   <label>Montant (€)<input name="a" inputmode="decimal" required value="${e.v===""?"":String(e.v).replace(".",",")}" placeholder="0,00"></label>
   <label>Date<input type="date" name="d" required value="${esc(e.date)}"></label>
   <label>Payé via<select name="c"><option value="">— Non précisé —</option>${S.acc.map(a=>`<option value="${esc(a.id)}"${a.id===e.ac?" selected":""}>${esc(a.name)}</option>`).join("")}<option value="esp"${e.ac==="esp"?" selected":""}>Espèces</option><option value="aut"${e.ac==="aut"?" selected":""}>Autre</option></select></label>
   <label class="pq-due"${rep?" hidden":""}>Échéance (facultatif)<input type="date" name="e" value="${esc(e.due||"")}"></label>
   <label class="pq-n">Note (facultatif)<input name="n" maxlength="120" value="${esc(e.note||"")}" placeholder="Motif, mode de paiement…"></label></div>
   ${rec.length?`<div class="pq-chips"><span class="sub">Récents :</span>${rec.map(n=>`<button type="button" class="pq-chip" data-pq-who="${esc(n)}">${esc(n)}</button>`).join("")}</div>`:""}
   <div class="pq-bt"><button class="primary">${ed?"Enregistrer":"Ajouter"}</button><button type="button" data-pq-cancel="1">${ed?"Annuler":"Fermer"}</button></div></form>`:"";
  $("#app").innerHTML=`<h2 class="vh">Prêts entre proches</h2>
  <details class="pq-info"><summary>ℹ Cet onglet est indépendant</summary><p>Ce que vous y saisissez n’apparaît dans aucun compte, budget, solde ou graphique du reste de la page. Il est simplement conservé avec vos autres données (sauvegarde et fichier partagé). « Payé via » est une simple information.</p></details>
  <div class="pq-k"><div class="pq-kc p"><span class="sub">On me doit</span><b class="pos">${eur2(due)}</b><span class="sub">${dueG.length} personne(s)</span></div><div class="pq-kc n"><span class="sub">Je dois</span><b class="neg">${eur2(owe)}</b><span class="sub">${oweG.length} personne(s)</span></div><div class="pq-kc"><span class="sub">Solde net</span><b class="${net>0?"pos":net<0?"neg":""}">${pqSg(net)}</b><span class="sub">${G.length} proche(s)</span></div></div>
  <section class="pq-fs${showF?" open":""}"><div class="pq-fh"><h2>${ed?"Modifier l’opération":"Nouvelle opération"}</h2>${ed?"":`<button class="primary" data-pq-new aria-expanded="${!!showF}">${showF?"Fermer":"+ Nouvelle opération"}</button>`}</div>${form}</section>
  <section><div class="pq-fh"><h2>Par proche</h2>${G.some(g=>!g.bal)?`<label class="chip"><input type="checkbox" id="pqhd"${PQH?" checked":""}>Masquer les soldés</label>`:""}</div><div class="pq-cs" id="pqc"></div></section>
  <section><div class="pq-fh"><h2>Historique</h2><button data-pq-csv>⬇ Export CSV</button></div>
   <div class="fbar"><input id="pqq" type="search" placeholder="Rechercher (nom, note, montant…)" value="${esc(PQF.q)}" aria-label="Rechercher">
   <select id="pqt" aria-label="Sens"><option value="">Entrées et sorties</option><option value="out"${PQF.t==="out"?" selected":""}>Sorties</option><option value="in"${PQF.t==="in"?" selected":""}>Entrées</option></select>
   <select id="pqw" aria-label="Proche"><option value="">Tous les proches</option>${G.map(g=>`<option value="${esc(g.key)}"${g.key===PQF.w?" selected":""}>${esc(g.name)}</option>`).join("")}</select></div>
   <div id="pqhl"></div></section>`;
  pqCards();pqHist();
}
function pqSync(fm){const o=fm.querySelector("[data-pq-out][aria-pressed=true]").dataset.pqOut==="1",r=fm.querySelector("[data-pq-rep][aria-pressed=true]").dataset.pqRep==="1",k=pqK(o,r);
  fm.elements.k.value=k;fm.querySelector("#pqk").textContent="Enregistré : "+PRT[k].l;fm.querySelector(".pq-due").hidden=r}
function pqFilter(key){PQF.w=PQF.w===key?"":key;pqMark();pqHist();if(PQF.w){const h=$("#pqhl");h&&h.scrollIntoView({block:"nearest",behavior:"smooth"})}}
async function pqCopy(txt){try{await navigator.clipboard.writeText(txt);toast("Récapitulatif copié")}catch(_){toast("Copie impossible : autorisez le presse-papiers")}}
function pqCsv(){const{list}=pqRows(),q=s=>'"'+String(s||"").replace(/"/g,'""')+'"';
  const t="\ufeffDate;Proche;Type;Compte;Note;Montant\n"+list.map(o=>[dfr(o.date),q(o.who),q(PRT[o.k].l),q(prAcc(o.ac)),q(o.note),(PRT[o.k].out?"-":"")+String(o.v).replace(".",",")].join(";")).join("\n");
  try{const u=URL.createObjectURL(new Blob([t],{type:"text/csv;charset=utf-8"})),a=document.createElement("a");a.href=u;a.download="prets-entre-proches-"+today()+".csv";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),3000);toast("Export CSV téléchargé")}catch(e){toast("Export impossible ici")}}
document.addEventListener("submit",e=>{const fm=e.target;if(fm.id!=="pqf")return;
  const who0=fm.elements.w.value.trim(),amt=parseFloat(fm.elements.a.value.replace(/\s/g,"").replace(",","."));
  if(!who0||!(amt>0)){toast("Indiquez un proche et un montant supérieur à 0");return}
  const P=PR(),ex=P.ops.find(o=>prKey(o.who)===prKey(who0)),k=fm.elements.k.value,o={who:ex?ex.who:who0,k,ac:fm.elements.c.value,date:fm.elements.d.value||today(),v:Math.round(amt*100)/100,note:fm.elements.n.value.trim(),due:pqRep(k)?"":(fm.elements.e.value||"")};
  const sn=snap();S.prets=P;
  if(PQE&&P.ops.some(x=>x.id===PQE)){Object.assign(P.ops.find(x=>x.id===PQE),o);PQE=null;PQP=null;PQO=false;toast("Opération modifiée",undoTo(sn));save();drawPre()}
  else{P.ops.push({id:uid(),...o});PQP={who:o.who,k:o.k,ac:o.ac,date:o.date,v:"",note:"",due:""};PQO=true;toast("Opération ajoutée",undoTo(sn));save();drawPre();const a=$("#pqf");a&&a.elements.a.focus()}});
document.addEventListener("input",e=>{if(e.target.id==="pqq"){PQF.q=e.target.value;pqHist()}});
document.addEventListener("change",e=>{const t=e.target;
  if(t.id==="pqt"){PQF.t=t.value;pqHist()}else if(t.id==="pqw"){PQF.w=t.value;pqMark();pqHist()}else if(t.id==="pqhd"){PQH=t.checked;pqCards()}});
document.addEventListener("click",async e=>{if(T!=="pre")return;const g=s=>e.target.closest(s),gk=a=>{const v=a.split(":");return v.slice(0,-1).join(":")};let x;
  if(x=g("[data-pq-new]")){const op=!(PQO||PQE||PQP);PQO=op;PQE=null;PQP=null;drawPre();if(op){const w=$("#pqf");w&&w.elements.w.focus()}}
  else if(x=g("[data-pq-out],[data-pq-rep]")){x.parentElement.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b===x));pqSync(x.closest("form"))}
  else if(x=g("[data-pq-who]")){const fm=x.closest("form");fm.elements.w.value=x.dataset.pqWho;fm.elements.a.focus()}
  else if(x=g("[data-pq-cancel]")){PQE=null;PQP=null;PQO=false;drawPre()}
  else if(x=g("[data-pq-add]")){const v=x.dataset.pqAdd,key=gk(v),mode=v.split(":").pop(),gr=prGroups().find(z=>z.key===key);if(!gr)return;
    PQE=null;PQO=true;PQP={who:gr.name,k:mode==="pret"?"pret":(gr.bal<0?"rendu":"recu"),ac:"",date:today(),v:"",note:"",due:""};drawPre();const fm=$("#pqf");fm&&(fm.scrollIntoView({block:"center"}),fm.elements.a.focus())}
  else if(x=g("[data-pq-e]")){PQE=x.dataset.pqE;PQP=null;drawPre();const fm=$("#pqf");fm&&fm.scrollIntoView({block:"center"})}
  else if(x=g("[data-pq-del]")){const sn=snap(),P=PR();S.prets=P;P.ops=P.ops.filter(o=>o.id!==x.dataset.pqDel);if(PQE===x.dataset.pqDel)PQE=null;save();drawPre();toast("Opération supprimée",undoTo(sn))}
  else if(x=g("[data-pq-hist]")){pqFilter(x.dataset.pqHist)}
  else if(x=g("[data-pq-csv]")){pqCsv()}
  else if(x=g("[data-pq-recap]")){const gr=prGroups().find(z=>z.key===x.dataset.pqRecap);if(!gr)return;
    const L=gr.ops.slice().sort((a,b)=>a.date.localeCompare(b.date)).map(o=>`- ${dfr(o.date)} : ${PRT[o.k].w} de ${eur2(o.v)}${o.note?" ("+o.note+")":""}`).join("\n");
    pqCopy((gr.bal>0?`Bonjour ${gr.name}, au ${dfr(today())}, il me reste ${eur2(gr.bal)} à recevoir de ta part.`:gr.bal<0?`Bonjour ${gr.name}, au ${dfr(today())}, je te dois encore ${eur2(-gr.bal)}.`:`Bonjour ${gr.name}, au ${dfr(today())}, nos comptes sont soldés.`)+"\n\nDétail :\n"+L)}
  else if(x=g("[data-pq-solde]")){const gr=prGroups().find(z=>z.key===x.dataset.pqSolde);if(!gr||!gr.bal)return;
    if(await ask(`Enregistrer un remboursement de ${eur2(Math.abs(gr.bal))} ${gr.bal>0?"reçu de":"versé à"} ${gr.name} pour solder le compte ?`,"Enregistrer")){const sn=snap(),P=PR();S.prets=P;P.ops.push({id:uid(),who:gr.name,k:gr.bal>0?"recu":"rendu",date:today(),v:Math.abs(gr.bal),note:"Solde",ac:"",due:""});save();drawPre();toast("Compte soldé",undoTo(sn))}}
  else if(x=g("[data-pq-ren]")){const gr=prGroups().find(z=>z.key===x.dataset.pqRen);if(!gr)return;const n=await askText("Nouveau nom :",gr.name,"Renommer");
    if(n){const sn=snap(),P=PR();S.prets=P;P.ops.forEach(o=>{if(prKey(o.who)===gr.key)o.who=n});PQF.w="";save();drawPre();toast("Proche renommé",undoTo(sn))}}
  else if((x=g("[data-pq-card]"))&&!g("button,a,input,select,label")){pqFilter(x.dataset.pqCard)}
});
