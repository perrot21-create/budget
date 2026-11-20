/* reglages.js — Réglages par onglet (général + surcharge de chaque onglet).
   À charger APRÈS pret.js : <script src="reglages.js"></script>
   Données : S.tabset = { dash:{…}, acc:{…}, … } (incluses dans la sauvegarde et le fichier partagé). */
(()=>{
const NM={dash:"Tableau de bord",acc:"Comptes",bud:"Budget annuel",lst:"Tiers et catégories",act:"Actions",pre:"Prêts entre proches",sav:"Sauvegarde"};
/* Comportement : c = cases [clé, libellé, défaut], n = nombres [clé, libellé, min, max, défaut, unité] */
const BEH={
 dash:{c:[["s_alr","Alertes de dépassement",true],["s_cpt","Mes comptes",true],["s_rng","Anneaux de dépenses",true],["s_lst","Dernières opérations",true],["s_cum","Solde cumulé budgétaire",true],["s_abo","Suivi des abonnements",true]],n:[["n","Nombre de dernières opérations (3 à 8)",3,8,8,""]]},
 acc:{c:[["fp","Afficher les opérations pointées par défaut",false],["fn","Afficher les non pointées par défaut",true]]},
 bud:{c:[["ca","Ouvrir Réel et Écart du cumul annuel par défaut",false],["fold","Graphiques repliés par défaut",false]]},
 pre:{c:[["hd","Masquer les comptes soldés par défaut",true]]}};
let RS="gen",PT=null;
window.registerSettings=(t,d)=>{NM[t]=d.label||t;BEH[t]=d};
const TS=()=>S.tabset||(S.tabset={});
const tset=(t,k,d)=>{const v=(S.tabset||{})[t];return v&&v[k]!==undefined?v[k]:d};
const st=document.createElement("style");
st.textContent='#syg,#cgb,#cgp,#ax_setb,#ax_set,.ctl .dd:has([data-tm="all-open"]){display:none!important}.setr h3{margin:18px 0 8px;font-size:var(--fs-md);font-weight:600;color:var(--mute)}.setr .modes{margin:4px 0 8px}';
document.head.appendChild(st);

/* ---- Apparence : surcharge par onglet appliquée par-dessus le réglage général ---- */
const oa=applyUI;
applyUI=function(){oa();const r=document.documentElement.style,o=TS()[T]||{},e=uiEff(),s=(n,v)=>{if(v!==undefined&&v!=="")r.setProperty(n,v)};
 if(o.k)s("--k",o.k/100);
 if(o.rc!==undefined){s("--rc",o.rc+"px");s("--rc2",Math.round(o.rc*.75)+"px")}
 if(o.rb!==undefined)s("--rb",o.rb+"px");
 const ac=hx(o["ac"+e]);if(ac){s("--accent",ac);s("--onacc",uon(ac))}
 const d=o.dn&&UDEN[o.dn];if(d){s("--sp",d.sp);s("--sm",d.sm);s("--tp",d.tp);s("--tp2",d.tp2)}};

/* ---- Rappel de sauvegarde : délai réglable ---- */
const days=()=>+tset("sav","days",30),old=()=>{const d=days();return d>0&&(!S.lastBackup||Date.now()-new Date(S.lastBackup)>d*864e5)};
stale=function(){const b=document.querySelector('[data-tab="sav"]');if(b)b.innerHTML="Sauvegarde"+(old()?' <span class="warn" title="Pensez à sauvegarder">●</span>':"")};
bkBanner=function(){const el=document.getElementById("bk");if(!el)return;let sn=0;try{sn=+localStorage.getItem(KEY+":bksnooze")||0}catch(e){}
 if(!(T==="dash"||T==="acc")||!old()||!S.tx.length||FH||Date.now()<sn){el.innerHTML="";return}
 el.innerHTML=`<div class="bkb" role="region" aria-label="Rappel de sauvegarde"><span>${S.lastBackup?"Dernière sauvegarde : <b>"+ago(S.lastBackup)+"</b>. Pensez à exporter vos données.":"Vous n’avez encore jamais sauvegardé vos données : elles ne sont stockées que dans ce navigateur."}</span><button class="primary" data-bk="go">Sauvegarder maintenant</button><button data-bk="later">Plus tard</button></div>`};

/* ---- Actions : frais et TTF (mêmes données que l'ancien panneau) ---- */
const AC=()=>{const a=S.actions&&Array.isArray(S.actions.hist)?S.actions:(S.actions={hist:[],last:null,cfg:null});
 if(!a.cfg||!Array.isArray(a.cfg.tiers))a.cfg={tiers:[[500,1000,1.9],[1000,2000,2.9],[2000,4000,3.8]].map(([min,max,fee])=>({min,max,fee})),ttf:.004};return a.cfg};
const fr=v=>String(v).replace(".",",");

/* ---- Composants de la page ---- */
const gu=()=>uiClean(S.ui),
chk=(t,k,l,d)=>`<label class="chip"><input type="checkbox" data-rt="${t}:${k}"${tset(t,k,d)?" checked":""}>${l}</label>`,
num=(t,k,l,a,b,d,u)=>`<div class="frow"><span>${l}</span><input type="number" min="${a}" max="${b}" step="1" data-rt="${t}:${k}" value="${tset(t,k,d)}"><span class="sv">${u||""}</span></div>`,
sld=(t,k,l,a,b,d,u)=>{const v=tset(t,k,undefined),sh=v===undefined?d:v;return `<div class="frow"><span>${l}${v===undefined?"":" •"}</span><input type="range" min="${a}" max="${b}" value="${sh}" data-rt="${t}:${k}" aria-label="${l}"><span class="sv">${sh}${u}</span></div>`},
appr=t=>{const o=TS()[t]||{},e=uiEff(),k="ac"+e,a=hx(o[k]),u=gu();
 return `<h3>Apparence de cet onglet (• = différent du général)</h3><div class="crow"><label><input type="color" data-rt="${t}:${k}" value="${a||u.c[e].accent||UDEF[e].accent}"><span>Couleur principale (mode ${e==="dark"?"sombre":"clair"})</span></label><button data-rtr="${t}:${k}"${a?"":" disabled"} aria-label="Revenir à la couleur générale">↺</button></div>`
 +sld(t,"k","Taille du texte",85,140,u.k||100," %")+sld(t,"rc","Arrondi des cartes",0,28,u.rc===undefined?16:u.rc," px")+sld(t,"rb","Arrondi des boutons",0,20,u.rb===undefined?8:u.rb," px")
 +`<div class="frow"><span>Densité</span><select data-rt="${t}:dn" aria-label="Densité">${[["","Comme le général"],["c","Compacte"],["a","Aérée"]].map(([v,l])=>`<option value="${v}"${(o.dn||"")===v?" selected":""}>${l}</option>`).join("")}</select></div>`},
actB=()=>{const c=AC();return `<h3>Frais par tranche (total de l’opération)</h3><div class="tw2"><table class="lt"><thead><tr><th>De (€)</th><th>À (€)</th><th>Frais (€)</th><th></th></tr></thead><tbody>${c.tiers.map((t,i)=>`<tr>${["min","max","fee"].map(k=>`<td><input data-rti="${i}:${k}" value="${fr(t[k])}" inputmode="decimal" aria-label="Tranche ${i+1} : ${k}"></td>`).join("")}<td><button data-rtd="${i}" aria-label="Supprimer la tranche ${i+1}">✕</button></td></tr>`).join("")}</tbody></table></div><div class="pvbar"><button data-rta>Ajouter une tranche</button><button data-rtz>Valeurs d’origine</button></div><div class="frow"><span>TTF sur l’achat (sauf revente le jour même)</span><input data-rttf value="${fr(Math.round(c.ttf*1e6)/1e4)}" inputmode="decimal" aria-label="TTF en pourcentage"><span class="sv">%</span></div>`};
function tabPage(t){const B=BEH[t]||{};
 let h=`<section><h2>${NM[t]}</h2><h3>Comportement</h3>`+(B.n||[]).map(([k,l,a,b,d,u])=>num(t,k,l,a,b,d,u)).join("")+((B.c||[]).length?`<div class="modes">${B.c.map(([k,l,d])=>chk(t,k,l,d)).join("")}</div>`:"");
 if(t==="acc")h+=`<h3>Espacement des colonnes des opérations (px)</h3><div class="cgrid">${cgGet().map((v,i)=>`<label class="crow"><span>${CGL[i]}</span><input type="number" min="0" max="200" data-rcg="${i}" value="${v}" style="width:80px"></label>`).join("")}</div><div class="pvbar"><button data-rcgr>Valeurs par défaut</button></div>`;
 else if(t==="bud")h+=`<div class="crow"><label><input type="color" data-rink value="${hx(S.ink)||"#1d4ed8"}" aria-label="Couleur de saisie"><span>Couleur de saisie des montants</span></label><button data-rinkr aria-label="Couleur par défaut">↺</button></div><div class="pvbar"><button data-rtw>Largeurs de colonnes par défaut</button></div>`;
 else if(t==="act")h+=actB();
 else if(t==="sav")h+=`<div class="frow"><span>Rappel de sauvegarde</span><select data-rt="sav:days" aria-label="Rappel de sauvegarde">${[[7,"Après 7 jours"],[30,"Après 30 jours"],[90,"Après 90 jours"],[0,"Jamais"]].map(([v,l])=>`<option value="${v}"${days()===v?" selected":""}>${l}</option>`).join("")}</select></div><div class="modes"><label class="chip"><input type="checkbox" data-rt="sav:auto"${syGet().mode==="manual"?"":" checked"}>Reconnexion automatique du fichier partagé à l’ouverture</label></div>`;
 else if(t==="lst")h+=`<p class="sub">Cet onglet n’a pas de réglage de comportement : seule son apparence se règle.</p>`;
 return h+appr(t)+`<div class="pvbar"><button class="danger" data-rtx="${t}">Réinitialiser cet onglet</button></div></section>`}

const od0=drawSet;
drawSet=function(){
 const tabs=Object.entries(NM).filter(([k])=>document.querySelector('#tabs [data-tab="'+k+'"]'));
 const nav=`<div class="snav" role="group" aria-label="Onglet à régler">`+[["gen","Général"],...tabs].map(([k,l])=>`<button data-rs="${k}"${RS===k?' class="on" aria-pressed="true"':' aria-pressed="false"'}>${l}</button>`).join("")+`</div>`;
 if(RS==="gen"||!tabs.some(([k])=>k===RS)){od0();$("#app").insertAdjacentHTML("afterbegin",nav);return}
 $("#app").innerHTML=nav+`<div class="setr">${tabPage(RS)}</div>`};

/* ---- Application des réglages de comportement à l'affichage ---- */
const odr=draw;
window.draw=draw=function(){if(T!==PT&&T==="bud")CA=!!tset("bud","ca",false);const ent=T!==PT;PT=T;odr();
 if(T==="dash"){const m={alr:".dalert",cpt:"section:has(.dgrid)",rng:".dgrid2",lst:"section:has(.dlast)",cum:"section:has(.cbt)",abo:"#abo"};
  Object.keys(m).forEach(k=>{if(tset("dash","s_"+k,true)===false)document.querySelectorAll("#app "+m[k]).forEach(e=>e.style.display="none")});
  const n=tset("dash","n",8);document.querySelectorAll(".dlast tbody tr").forEach((r,i)=>{if(i>=n)r.style.display="none"})}
 if(T==="bud"&&ent){const d=document.querySelector("#bch details");if(d)d.open=!tset("bud","fold",false)}};
const fx=(t,k,v)=>{if(t==="acc"&&k==="fp")F.p=v;if(t==="acc"&&k==="fn")F.n=v;if(t==="pre"&&k==="hd")PQH=v;if(t==="bud"&&k==="ca")CA=v;if(t==="sav"&&k==="auto")sySet({mode:v?"auto":"manual"})};

document.addEventListener("input",e=>{const x=e.target,D=x.dataset||{};
 if(D.rink!==undefined){S.ink=x.value;save();applyInk();return}
 if(D.rcg!==undefined){if(x.value==="")return;S.cg=cgGet();S.cg[+D.rcg]=Math.max(0,Math.min(200,Math.round(+x.value)));applyCG();save();return}
 if(!D.rt||x.type==="number"&&x.value==="")return;
 const[t,k]=D.rt.split(":"),v=x.type==="checkbox"?x.checked:(x.type==="number"||x.type==="range")?+x.value:x.value;
 (TS()[t]=TS()[t]||{})[k]=v;fx(t,k,v);save();applyInk();
 const s=x.type==="range"&&x.closest(".frow").querySelector(".sv");if(s)s.textContent=v+(k==="k"?" %":" px")});
document.addEventListener("change",e=>{const x=e.target,D=x.dataset||{},p=s=>parseFloat(String(s).replace(/\s/g,"").replace(",","."));
 if(D.rti!==undefined){const[i,k]=D.rti.split(":"),c=AC(),v=p(x.value);if(isFinite(v)&&v>=0&&c.tiers[i]){c.tiers[i][k]=v;save()}else drawSet()}
 else if(D.rttf!==undefined){const v=p(x.value);if(isFinite(v)&&v>=0&&v<=100){AC().ttf=v/100;save()}else drawSet()}});
document.addEventListener("click",async e=>{const q=s=>e.target.closest(s);let x;
 if(x=q("[data-rs]")){RS=x.dataset.rs;drawSet()}
 else if(q("#rsg")){RS=NM[T]?T:"gen";T="set";draw()}
 else if(x=q("[data-rtr]")){const[t,k]=x.dataset.rtr.split(":");if(TS()[t])delete TS()[t][k];save();applyInk();drawSet()}
 else if(x=q("[data-rtx]")){const t=x.dataset.rtx;if(await ask("Réinitialiser les réglages de l’onglet « "+NM[t]+" » (apparence et comportement) ? Vos données ne sont pas touchées.","Remplacer")){delete TS()[t];
  if(t==="acc"){F.p=false;F.n=true}if(t==="pre")PQH=true;if(t==="bud")CA=false;if(t==="sav")sySet({mode:"auto"});save();applyInk();drawSet()}}
 else if(q("[data-rcgr]")){S.cg=CGD.slice();save();applyCG();drawSet()}
 else if(q("[data-rinkr]")){S.ink="";save();applyInk();drawSet()}
 else if(q("[data-rtw]")){S.colw={};save();toast("Largeurs de colonnes rétablies")}
 else if(x=q("[data-rtd]")){AC().tiers.splice(+x.dataset.rtd,1);save();drawSet()}
 else if(q("[data-rta]")){const c=AC(),hi=c.tiers.length?Math.max(...c.tiers.map(t=>t.max)):0;c.tiers.push({min:hi,max:hi+1000,fee:0});save();drawSet()}
 else if(q("[data-rtz]")){if(await ask("Rétablir les tranches de frais et la TTF d’origine ?","Remplacer")){AC();S.actions.cfg=null;AC();save();drawSet()}}});

/* ---- Bouton ⚙ unique dans l'en-tête : ouvre les réglages de l'onglet courant ---- */
const sg=document.getElementById("syg");
if(sg&&!document.getElementById("rsg"))sg.insertAdjacentHTML("beforebegin",'<button id="rsg" class="ib" title="Réglages de cet onglet" aria-label="Réglages de cet onglet">⚙&#xFE0E;</button>');
F.p=tset("acc","fp",false);F.n=tset("acc","fn",true);PQH=tset("pre","hd",true);
draw();
})();
