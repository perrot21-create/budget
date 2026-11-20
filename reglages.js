/* reglages.js v3 — Réglages par onglet. À charger APRÈS pret.js : <script src="reglages.js"></script> */
(()=>{
const NM={dash:"Tableau de bord",acc:"Comptes",bud:"Budget annuel",lst:"Tiers et catégories",act:"Actions",pre:"Prêts entre proches",sav:"Sauvegarde"};
const BEH={
 dash:{c:[["s_alr","Alertes de dépassement",true],["s_cpt","Mes comptes",true],["s_rng","Anneaux de dépenses",true],["s_lst","Dernières opérations",true],["s_cum","Solde cumulé budgétaire",true],["s_abo","Suivi des abonnements",true]],n:[["n","Nombre de dernières opérations (3 à 8)",3,8,8,""]]},
 acc:{c:[["fp","Afficher les opérations pointées par défaut",false],["fn","Afficher les non pointées par défaut",true]]},
 bud:{c:[["ca","Ouvrir Réel et Écart du cumul annuel par défaut",false],["fold","Graphiques repliés par défaut",false]]},
 act:{n:[["max","Nombre maximal d’opérations conservées",10,100,30,""],["h1","Hausse proposée n°1",1,100,5," %"],["h2","Hausse proposée n°2 (par défaut)",1,100,10," %"],["h3","Hausse proposée n°3",1,100,20," %"]]},
 pre:{n:[["due","Alerte « échéance proche » (jours)",1,60,7," j"]],c:[["hd","Masquer les comptes soldés par défaut",true]]}};
const PC=["#3b82f6","#a855f7","#f59e0b","#14b8a6"];
let RS="gen",PT=null,CG0;
window.registerSettings=(t,d)=>{NM[t]=d.label||t;BEH[t]=d};
const TS=()=>S.tabset||(S.tabset={});
const tset=(t,k,d)=>{const v=(S.tabset||{})[t];return v&&v[k]!==undefined?v[k]:d};
window.tset=tset;
const st=document.createElement("style");
st.textContent='#syg,#cgb,#cgp,#ax_setb,#ax_set,.ctl .dd:has([data-tm="all-open"]){display:none!important}.setr h3{margin:18px 0 8px;font-size:var(--fs-md);font-weight:600;color:var(--mute)}.setr .modes{margin:4px 0 8px}.setr details{margin:12px 0}';
document.head.appendChild(st);

/* Apparence par onglet + couleurs des cartes Prêts */
const preCss=()=>{let e=document.getElementById("rspre");if(!e){e=document.createElement("style");e.id="rspre";document.head.appendChild(e)}
 e.textContent=PC.map((d,i)=>`.pq-cs .pq-c:not(.pq-c0):nth-child(${i===3?"4n":"4n+"+(i+1)}){background:color-mix(in srgb,${hx(tset("pre","c"+i,""))||d} 16%,var(--surface))}`).join("")};
const oa=applyUI;
applyUI=function(){oa();preCss();const r=document.documentElement.style,o=TS()[T]||{},e=uiEff(),s=(n,v)=>{if(v!==undefined&&v!=="")r.setProperty(n,v)};
 if(o.k)s("--k",o.k/100);
 if(o.rc!==undefined){s("--rc",o.rc+"px");s("--rc2",Math.round(o.rc*.75)+"px")}
 if(o.rb!==undefined)s("--rb",o.rb+"px");
 const ac=hx(o["ac"+e]);if(ac){s("--accent",ac);s("--onacc",uon(ac))}
 const d=o.dn&&UDEN[o.dn];if(d){s("--sp",d.sp);s("--sm",d.sm);s("--tp",d.tp);s("--tp2",d.tp2)}};

/* Rappel de sauvegarde */
const days=()=>+tset("sav","days",30),old=()=>{const d=days();return d>0&&(!S.lastBackup||Date.now()-new Date(S.lastBackup)>d*864e5)};
stale=function(){const b=document.querySelector('[data-tab="sav"]');if(b)b.innerHTML="Sauvegarde"+(old()?' <span class="warn" title="Pensez à sauvegarder">●</span>':"")};
bkBanner=function(){const el=document.getElementById("bk");if(!el)return;let sn=0;try{sn=+localStorage.getItem(KEY+":bksnooze")||0}catch(e){}
 if(!(T==="dash"||T==="acc")||!old()||!S.tx.length||FH||Date.now()<sn){el.innerHTML="";return}
 el.innerHTML=`<div class="bkb" role="region" aria-label="Rappel de sauvegarde"><span>${S.lastBackup?"Dernière sauvegarde : <b>"+ago(S.lastBackup)+"</b>. Pensez à exporter vos données.":"Vous n’avez encore jamais sauvegardé vos données : elles ne sont stockées que dans ce navigateur."}</span><button class="primary" data-bk="go">Sauvegarder maintenant</button><button data-bk="later">Plus tard</button></div>`};

/* Actions : frais et TTF */
const AC=()=>{const a=S.actions&&Array.isArray(S.actions.hist)?S.actions:(S.actions={hist:[],last:null,cfg:null});
 if(!a.cfg||!Array.isArray(a.cfg.tiers))a.cfg={tiers:[[500,1000,1.9],[1000,2000,2.9],[2000,4000,3.8]].map(([min,max,fee])=>({min,max,fee})),ttf:.004};return a.cfg};
const fr=v=>String(v).replace(".",",");

/* Curseur du « Tableau du budget » (réutilise les réglages généraux data-us gérés par index.html) */
const slu=(k,l,a,b,s,v,u)=>`<div class="frow"><span id="ul-${k}">${l}</span><input type="range" data-us="${k}" min="${a}" max="${b}" step="${s}" value="${v}" aria-labelledby="ul-${k}"><span class="sv" id="sv-${k}">${v}${u}</span></div>`;

/* Composants */
const gu=()=>uiClean(S.ui),
chk=(t,k,l,d)=>`<label class="chip"><input type="checkbox" data-rt="${t}:${k}"${tset(t,k,d)?" checked":""}>${l}</label>`,
num=(t,k,l,a,b,d,u)=>`<div class="frow"><span>${l}</span><input type="number" min="${a}" max="${b}" step="1" data-rt="${t}:${k}" value="${tset(t,k,d)}"><span class="sv">${u||""}</span></div>`,
sld=(t,k,l,a,b,d,u)=>{const v=tset(t,k,undefined),sh=v===undefined?d:v;return `<div class="frow"><span>${l}${v===undefined?"":" •"}</span><input type="range" min="${a}" max="${b}" value="${sh}" data-rt="${t}:${k}" aria-label="${l}"><span class="sv">${sh}${u}</span></div>`},
appr=t=>{const o=TS()[t]||{},e=uiEff(),k="ac"+e,a=hx(o[k]),u=gu();
 return `<h3>Apparence de cet onglet (• = différent du général)</h3><div class="crow"><label><input type="color" data-rt="${t}:${k}" value="${a||u.c[e].accent||UDEF[e].accent}"><span>Couleur principale (mode ${e==="dark"?"sombre":"clair"})</span></label><button data-rtr="${t}:${k}"${a?"":" disabled"} aria-label="Revenir à la couleur générale">↺</button></div>`
 +sld(t,"k","Taille du texte",85,140,u.k||100," %")+sld(t,"rc","Arrondi des cartes",0,28,u.rc===undefined?16:u.rc," px")+sld(t,"rb","Arrondi des boutons",0,20,u.rb===undefined?8:u.rb," px")
 +`<div class="frow"><span>Densité</span><select data-rt="${t}:dn" aria-label="Densité">${[["","Comme le général"],["c","Compacte"],["a","Aérée"]].map(([v,l])=>`<option value="${v}"${(o.dn||"")===v?" selected":""}>${l}</option>`).join("")}</select></div>`},
accB=()=>`<h3>Comptes bancaires (5 maximum)</h3><ul class="ed">${S.acc.map((a,i)=>`<li><input data-rac="${i}" value="${esc(a.name)}" maxlength="30" aria-label="Nom du compte ${i+1}"><button data-racm="${i}:-1" aria-label="Monter"${i?"":" disabled"}>↑</button><button data-racm="${i}:1" aria-label="Descendre"${i<S.acc.length-1?"":" disabled"}>↓</button><button data-racd="${i}" aria-label="Supprimer"${S.acc.length>1?"":" disabled"}>✕</button></li>`).join("")}</ul><div class="pvbar"><button data-raca${S.acc.length>=5?" disabled":""}>Ajouter un compte</button></div>`,
actB=()=>{const c=AC();return `<h3>Frais par tranche (total de l’opération)</h3><div class="tw2"><table class="lt"><thead><tr><th>De (€)</th><th>À (€)</th><th>Frais (€)</th><th></th></tr></thead><tbody>${c.tiers.map((t,i)=>`<tr>${["min","max","fee"].map(k=>`<td><input data-rti="${i}:${k}" value="${fr(t[k])}" inputmode="decimal" aria-label="Tranche ${i+1} : ${k}"></td>`).join("")}<td><button data-rtd="${i}" aria-label="Supprimer la tranche ${i+1}">✕</button></td></tr>`).join("")}</tbody></table></div><p class="warn" id="rterr" role="alert"></p><div class="pvbar"><button data-rta>Ajouter une tranche</button><button data-rtz>Valeurs d’origine</button></div><div class="frow"><span>TTF sur l’achat (sauf revente le jour même)</span><input data-rttf value="${fr(Math.round(c.ttf*1e6)/1e4)}" inputmode="decimal" aria-label="TTF en pourcentage"><span class="sv">%</span></div>`};
function tabPage(t){const B=BEH[t]||{};
 let h=`<section><h2>${NM[t]}</h2><h3>Comportement</h3>`+(B.n||[]).map(([k,l,a,b,d,u])=>num(t,k,l,a,b,d,u)).join("")+((B.c||[]).length?`<div class="modes">${B.c.map(([k,l,d])=>chk(t,k,l,d)).join("")}</div>`:"");
 if(t==="acc")h+=accB()+`<h3>Espacement des colonnes des opérations (px)</h3><div class="cgrid">${cgGet().map((v,i)=>`<label class="crow"><span>${CGL[i]}</span><input type="number" min="0" max="200" data-rcg="${i}" value="${v}" style="width:80px"></label>`).join("")}</div><div class="pvbar"><button data-rcgr>Valeurs par défaut</button></div>`;
 else if(t==="bud"){const u=gu();h+=`<h3>Tableau du budget</h3>`
  +slu("vw","Largeur du trait Décembre / Cumul annuel",2,40,2,u.vw||18," px")
  +slu("rh","Hauteur des lignes",28,52,2,u.rh||36," px")
  +slu("ib","Intensité des contours des cases de saisie",0,80,5,u.ib===undefined?30:u.ib," %")
  +`<p class="sub">La couleur du trait Décembre / Cumul annuel, celles des lignes et la couleur de saisie se règlent dans Général > Couleurs.</p><div class="pvbar"><button data-rtw>Largeurs de colonnes par défaut</button></div>`}
 else if(t==="act")h+=actB();
 else if(t==="pre")h+=`<h3>Couleurs des cartes « Par proche »</h3><div class="cgrid">${PC.map((d,i)=>{const v=hx(tset("pre","c"+i,""));return `<div class="crow"><label><input type="color" data-rt="pre:c${i}" value="${v||d}" aria-label="Couleur de la carte ${i+1}"><span>Carte ${i+1}</span></label><button data-rtr="pre:c${i}"${v?"":" disabled"} aria-label="Couleur d’origine">↺</button></div>`}).join("")}</div>`;
 else if(t==="sav")h+=`<div class="frow"><span>Rappel de sauvegarde</span><select data-rt="sav:days" aria-label="Rappel de sauvegarde">${[[7,"Après 7 jours"],[30,"Après 30 jours"],[90,"Après 90 jours"],[0,"Jamais"]].map(([v,l])=>`<option value="${v}"${days()===v?" selected":""}>${l}</option>`).join("")}</select></div><div class="modes"><label class="chip"><input type="checkbox" data-rt="sav:auto"${syGet().mode==="manual"?"":" checked"}>Reconnexion automatique du fichier partagé à l’ouverture</label></div>`;
 else if(t==="lst")h+=`<p class="sub">Les couleurs de police des catégories du budget se règlent plus bas.</p>`;
 return h+appr(t)+`<div class="pvbar"><button class="danger" data-rtx="${t}">Réinitialiser cet onglet</button></div></section>`}

/* Aperçu en direct, propre à l'onglet choisi */
const card=(i,n,v)=>`<div class="dcard t${i}"><span class="sub">${esc(n)}</span><span class="dv ${v<0?"neg":"pos"}">${eur2(v)}</span><span class="sub">Fin de mois : <b>${eur2(v*.9)}</b></span></div>`;
const PV={
 dash:()=>`<div class="dgrid">${card(0,S.acc[0].name,1234.56)}${card(1,(S.acc[1]||S.acc[0]).name,-120)}</div><section style="margin-top:12px"><h2>Dépenses du mois</h2><div class="pb2"><i style="width:60%"></i></div><p class="sub">600 € sur 1 000 € budgétés</p></section>`,
 acc:()=>`<div class="tw"><table class="lt"><thead><tr><th>Date</th><th>Tiers</th><th class="r">Montant</th></tr></thead><tbody><tr><td>12 nov.</td><td>Supermarché</td><td class="r neg">−54,30 €</td></tr><tr><td>10 nov.</td><td>Salaire</td><td class="r pos">+2 400,00 €</td></tr></tbody></table></div><div class="pvbar"><button class="primary">Ajouter</button><button>Filtres</button></div>`,
 bud:()=>`<div class="tw"><table class="pvt"><tbody><tr class="sec k-rev"><td class="nm">Revenus</td><td class="g"></td></tr><tr class="k-rev a0"><td class="nm">Salaire</td><td class="g pos">2 400 €</td></tr><tr class="sec k-dep"><td class="nm">Dépenses</td><td class="g"></td></tr><tr class="k-dep a1"><td class="nm">Loyer</td><td class="g neg">950 €</td></tr></tbody></table></div>`,
 lst:()=>`<ul class="ed"><li><input value="Courses" readonly aria-label="Exemple"><input type="color" class="ccol" value="#2a9d8f" disabled aria-label="Couleur"></li><li><input value="Loisirs" readonly aria-label="Exemple"><input type="color" class="ccol" value="#e76f51" disabled aria-label="Couleur"></li></ul>`,
 act:()=>`<div class="dgrid"><div class="dcard"><span class="sub">Gain net</span><span class="dv pos">+84,20 €</span></div><div class="dcard"><span class="sub">Rentabilité</span><span class="dv pos">+8,40 %</span></div></div><div class="pvbar"><button class="primary">Enregistrer</button><button>Oui</button><button>Non</button></div>`,
 pre:()=>`<div class="pq-cs" style="grid-template-columns:1fr 1fr;grid-auto-rows:auto">${["Camille","Hugo","Léa","Noé"].map((n,i)=>`<div class="pq-c ${i%2?"n":"p"}"><div class="pq-ch"><b>${n}</b></div><div class="pq-cv">${eur2(40+i*30)}</div><div class="sub">solde</div></div>`).join("")}</div>`,
 sav:()=>`<div class="bkb"><span>Dernière sauvegarde : <b>il y a 12 jours</b>.</span><button class="primary">Sauvegarder maintenant</button></div>`};
const pvH=t=>{const o=TS()[t]||{},e=uiEff(),a=hx(o["ac"+e]),s=[];
 if(a)s.push("--accent:"+a,"--onacc:"+uon(a));if(o.rc!==undefined)s.push("--rc:"+o.rc+"px","--rc2:"+Math.round(o.rc*.75)+"px");if(o.rb!==undefined)s.push("--rb:"+o.rb+"px");
 const d=o.dn&&UDEN[o.dn];if(d)s.push("--sp:"+d.sp,"--sm:"+d.sm,"--tp:"+d.tp,"--tp2:"+d.tp2);if(o.k)s.push("zoom:"+o.k/100);
 return `<aside class="setp" id="rspv" style="${s.join(";")}" aria-label="Aperçu en direct"><h2>Aperçu en direct</h2>${(PV[t]||(()=>""))()}</aside>`};

/* Rangement de la page Général */
const takePol=()=>{const s=[...$("#app").querySelectorAll("section")].find(z=>/Police de chaque/.test((z.querySelector("h2")||{}).textContent||""));if(s)s.remove();return s};
function tidy(){const A=$("#app"),mk=(h)=>{const d=document.createElement("details");d.innerHTML="<summary>"+h+"</summary>";return d};
 const pr=A.querySelector(".pres");if(pr&&pr.children.length>3){const d=mk("Plus de thèmes prêts à l’emploi"),w=document.createElement("div");w.className="pres";d.appendChild(w);[...pr.children].slice(3).forEach(b=>w.appendChild(b));pr.after(d)}
 const vw=A.querySelector('[data-us="vw"]'),ib=A.querySelector('[data-us="ib"]');if(vw&&ib){const d=mk("Avancé : trait Décembre et contours des cases");d.appendChild(vw.closest(".frow"));d.appendChild(ib.closest(".frow"));vw.closest("section")?d.appendChild(document.createTextNode("")):0;(A.querySelector('section[data-sp="tableau"]')).appendChild(d)}
 const ps=[...A.querySelectorAll('section[data-sp="themes"]')].pop();if(ps&&ps.querySelector("#uitxt")){const d=mk("Avancé : partage du thème");[...ps.children].slice(1).forEach(c=>{if(!c.matches("[data-uall]"))d.appendChild(c)});ps.appendChild(d)}
 const w=A.querySelector('[data-us="w"]');if(w)[...w.options].forEach(o=>o.textContent=o.textContent.replace(/ \(colonnes[^)]*\)/,""))}

const od0=drawSet;
drawSet=function(){
 const tabs=Object.entries(NM).filter(([k])=>document.querySelector('#tabs [data-tab="'+k+'"]'));
 const nav=`<div class="snav" role="group" aria-label="Onglet à régler">`+[["gen","Général"],...tabs].map(([k,l])=>`<button data-rs="${k}"${RS===k?' class="on" aria-pressed="true"':' aria-pressed="false"'}>${l}</button>`).join("")+`</div>`;
 if(RS==="gen"||!tabs.some(([k])=>k===RS)){
  /* « Tableau du budget » n'est plus dans Général : il est dans Budget annuel */
  if(ST==="tableau")ST="themes";
  od0();takePol();tidy();
  $("#app").querySelectorAll('section[data-sp="tableau"]').forEach(z=>z.remove());
  const bt=$("#app").querySelector('[data-st="tableau"]');if(bt)bt.remove();
  $("#app").insertAdjacentHTML("afterbegin",nav);return}
 let pol=null;if(RS==="lst"){od0();pol=takePol()}
 $("#app").innerHTML=nav+`<div class="setw"><div class="setr">${tabPage(RS)}</div>${pvH(RS)}</div>`;
 if(pol)$("#app").querySelector(".setr").appendChild(pol)};

/* Application à l'affichage */
const odr=draw;
window.draw=draw=function(){if(T!==PT&&T==="bud")CA=!!tset("bud","ca",false);const ent=T!==PT;PT=T;odr();
 if(T==="dash"){const m={alr:".dalert",cpt:"section:has(.dgrid)",rng:".dgrid2",lst:"section:has(.dlast)",cum:"section:has(.cbt)",abo:"#abo"};
  Object.keys(m).forEach(k=>{if(tset("dash","s_"+k,true)===false)document.querySelectorAll("#app "+m[k]).forEach(e=>e.style.display="none")});
  const n=tset("dash","n",8);document.querySelectorAll(".dlast tbody tr").forEach((r,i)=>{if(i>=n)r.style.display="none"})}
 if(T==="bud"&&ent){const d=document.querySelector("#bch details");if(d)d.open=!tset("bud","fold",false)}
 if(T==="act"){const g=document.querySelector('#acw [aria-labelledby="ax_lp"]');if(g){g.innerHTML=[1,2,3].map(i=>tset("act","h"+i,[5,10,20][i-1])).map((v,i)=>`<button type="button" data-ax-pct="${v}" aria-pressed="${i===1}">+${v} %</button>`).join("");const q=document.getElementById("ax_q");if(q)q.dispatchEvent(new Event("input",{bubbles:true}))}}};
const fx=(t,k,v)=>{if(t==="acc"&&k==="fp")F.p=v;if(t==="acc"&&k==="fn")F.n=v;if(t==="pre"&&k==="hd")PQH=v;if(t==="bud"&&k==="ca")CA=v;if(t==="sav"&&k==="auto")sySet({mode:v?"auto":"manual"})};

/* Largeur de page : ne modifie plus l'espacement des colonnes des comptes */
document.addEventListener("input",e=>{if(e.target.dataset&&e.target.dataset.us==="w")CG0=S.cg?S.cg.slice():undefined},true);
document.addEventListener("input",e=>{const x=e.target,D=x.dataset||{};
 if(D.us==="w"){if(CG0)S.cg=CG0;else delete S.cg;save();applyCG();return}
 if(D.rcg!==undefined){if(x.value==="")return;S.cg=cgGet();S.cg[+D.rcg]=Math.max(0,Math.min(200,Math.round(+x.value)));applyCG();save();return}
 if(!D.rt||x.type==="number"&&x.value==="")return;
 const[t,k]=D.rt.split(":"),v=x.type==="checkbox"?x.checked:(x.type==="number"||x.type==="range")?+x.value:x.value;
 (TS()[t]=TS()[t]||{})[k]=v;fx(t,k,v);save();applyInk();
 const s=x.type==="range"&&x.closest(".frow").querySelector(".sv");if(s)s.textContent=v+(k==="k"?" %":" px");
 if(T==="set"&&RS!=="gen"){const p=document.getElementById("rspv");if(p)p.outerHTML=pvH(RS)}});
document.addEventListener("change",e=>{const x=e.target,D=x.dataset||{},p=s=>parseFloat(String(s).replace(/\s/g,"").replace(",","."));
 if(D.rti!==undefined){const[i,k]=D.rti.split(":"),c=AC(),v=p(x.value),m=document.getElementById("rterr"),t=c.tiers[i];
  if(!t||!isFinite(v)||v<0){x.classList.add("alr");m.textContent="Saisissez un nombre positif.";return}
  const n={...t,[k]:v};
  if(n.min>=n.max){x.classList.add("alr");m.textContent="Tranche "+(+i+1)+" non enregistrée : « De » doit être inférieur à « À ».";return}
  c.tiers[i]=n;save();x.classList.remove("alr");const s=c.tiers.slice().sort((a,b)=>a.min-b.min);let ov=false;for(let j=1;j<s.length;j++)if(s[j].min<s[j-1].max)ov=true;
  m.textContent=ov?"Attention : des tranches se chevauchent ; la plus basse s’applique.":""}
 else if(D.rttf!==undefined){const v=p(x.value);if(isFinite(v)&&v>=0&&v<=100){AC().ttf=v/100;save()}else drawSet()}
 else if(D.rac!==undefined){const v=x.value.trim();if(v&&S.acc[+D.rac]){S.acc[+D.rac].name=v;save()}else drawSet()}});
document.addEventListener("click",async e=>{const q=s=>e.target.closest(s);let x;
 if(x=q("[data-rs]")){RS=x.dataset.rs;drawSet()}
 else if(q("#rsg")){RS=NM[T]?T:"gen";T="set";draw()}
 else if(x=q("[data-rtr]")){const[t,k]=x.dataset.rtr.split(":");if(TS()[t])delete TS()[t][k];save();applyInk();drawSet()}
 else if(x=q("[data-rtx]")){const t=x.dataset.rtx;if(await ask("Réinitialiser les réglages de l’onglet « "+NM[t]+" » (apparence et comportement) ? Vos données ne sont pas touchées.","Remplacer")){delete TS()[t];
  if(t==="acc"){F.p=false;F.n=true}if(t==="pre")PQH=true;if(t==="bud")CA=false;if(t==="sav")sySet({mode:"auto"});save();applyInk();drawSet()}}
 else if(q("[data-rcgr]")){S.cg=CGD.slice();save();applyCG();drawSet()}
 else if(q("[data-rtw]")){S.colw={};save();toast("Largeurs de colonnes rétablies")}
 else if(x=q("[data-rtd]")){AC().tiers.splice(+x.dataset.rtd,1);save();drawSet()}
 else if(q("[data-rta]")){const c=AC(),hi=c.tiers.length?Math.max(...c.tiers.map(t=>t.max)):0;c.tiers.push({min:hi,max:hi+1000,fee:0});save();drawSet()}
 else if(q("[data-rtz]")){if(await ask("Rétablir les tranches de frais et la TTF d’origine ?","Remplacer")){AC();S.actions.cfg=null;AC();save();drawSet()}}
 else if(x=q("[data-racm]")){const[i,d]=x.dataset.racm.split(":").map(Number),j=i+d;if(S.acc[j]){[S.acc[i],S.acc[j]]=[S.acc[j],S.acc[i]];save();drawSet()}}
 else if(q("[data-raca]")){if(S.acc.length<5){S.acc.push({id:uid(),name:"Compte "+(S.acc.length+1)});save();drawSet()}}
 else if(x=q("[data-racd]")){const a=S.acc[+x.dataset.racd];if(!a||S.acc.length<2)return;const n=S.tx.filter(t=>t.acc===a.id).length;
  if(await ask("Supprimer le compte « "+a.name+" »"+(n?" et ses "+n+" opération(s)":"")+" ? Vous pourrez annuler quelques secondes.","Supprimer")){const sn=snap();S.acc=S.acc.filter(z=>z!==a);S.tx=S.tx.filter(t=>t.acc!==a.id);save();drawSet();toast("Compte supprimé",undoTo(sn))}}});

/* Bouton ⚙ unique dans l'en-tête : il remplace l'onglet « Réglages », qui est retiré de la navigation */
const sg=document.getElementById("syg");
if(sg&&!document.getElementById("rsg"))sg.insertAdjacentHTML("beforebegin",'<button id="rsg" class="ib" title="Réglages de cet onglet" aria-label="Réglages de cet onglet">⚙&#xFE0E;</button>');
const tabSet=document.querySelector('#tabs [data-tab="set"]');if(tabSet)tabSet.remove();
F.p=tset("acc","fp",false);F.n=tset("acc","fn",true);PQH=tset("pre","hd",true);
draw();
})();
