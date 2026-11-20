/* tiers.js — Onglet « Tiers et catégories » compact (menus déroulants).
   À charger APRÈS reglages.js : <script src="tiers.js"></script>
   Pour revenir à l'ancien affichage : supprimer cette ligne <script> (et le fichier). */
(()=>{
let LSEL="";const OPEN=new Set();

const st=document.createElement("style");
st.textContent=`
.lstg{display:grid;grid-template-columns:minmax(260px,1fr) minmax(0,3fr);gap:16px;align-items:start}
.lstg section{margin-bottom:0}
.cc2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px 28px}
.cx{border-top:1px solid var(--line);margin:0}
.cx>summary{display:flex;align-items:center;gap:10px;padding:9px 4px;cursor:pointer;list-style:none;color:var(--ink)}
.cx>summary::-webkit-details-marker{display:none}
.cx>summary::before{content:"▸";color:var(--mute);width:1em;flex:none}
.cx[open]>summary::before{content:"▾"}
.cx .cxn{flex:1;min-width:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cx .cd{margin-right:0}
.cxb{padding:4px 0 12px 22px}
.cxb .ed{margin:0 0 8px}
.lsel{display:flex;flex-direction:column;gap:3px;margin:6px 0 8px}
.lsel select{width:100%}
@media(max-width:900px){.lstg{grid-template-columns:1fr}.cc2{grid-template-columns:1fr}}
`;
document.head.appendChild(st);

const cmp=(a,b)=>a.name.localeCompare(b.name,"fr",{sensitivity:"base"});

function catHtml(c){
 const n=c.subs.length;
 return `<details class="cx" data-cx="${c.id}"${OPEN.has(c.id)?" open":""}>
 <summary><i class="cd" style="background:${cco(c.id)}"></i><span class="cxn">${esc(c.name)}</span><span class="sub">${n?n+" sous-cat.":"aucune sous-cat."}</span></summary>
 <div class="cxb">
 <ul class="ed"><li><input data-ren="cat:${c.id}" value="${esc(c.name)}" aria-label="Renommer la catégorie"><input type="color" class="ccol" data-ccol="${c.id}" value="${cco(c.id)}" title="Couleur de la catégorie" aria-label="Couleur"><button data-del="cat:${c.id}" aria-label="Supprimer la catégorie" title="Supprimer la catégorie">✕</button></li></ul>
 <ul class="ed">${c.subs.map(s=>`<li><span class="ar">→</span><input data-ren="sub:${c.id}:${s.id}" value="${esc(s.name)}" aria-label="Renommer la sous-catégorie"><button data-del="sub:${c.id}:${s.id}" aria-label="Supprimer la sous-catégorie" title="Supprimer">✕</button></li>`).join("")}</ul>
 <form class="inl" style="margin:0" data-add="sub:${c.id}"><input name="n" placeholder="Nouvelle sous-catégorie" aria-label="Nouvelle sous-catégorie de ${esc(c.name)}" required><button aria-label="Ajouter la sous-catégorie" title="Ajouter la sous-catégorie">+</button></form>
 </div></details>`}

function tiersHtml(){
 const L=[...S.tiers].sort(cmp);
 if(!L.some(t=>t.id===LSEL))LSEL="";
 const t=L.find(x=>x.id===LSEL);
 return `<section><h2>Tiers <span class="sub">(${L.length})</span></h2>
 <form class="inl" data-add="tier"><input name="n" placeholder="Nouveau tiers" aria-label="Nouveau tiers" required><button class="primary">Ajouter</button></form>
 ${L.length?`<label class="lsel"><span class="sub">Modifier ou supprimer un tiers</span><select id="lsel" aria-label="Choisir un tiers">
 <option value="">Choisir un tiers…</option>${L.map(x=>`<option value="${x.id}"${x.id===LSEL?" selected":""}>${esc(x.name)}</option>`).join("")}</select></label>
 ${t?`<ul class="ed"><li><input data-ren="tier:${t.id}" value="${esc(t.name)}" aria-label="Renommer le tiers"><button data-del="tier:${t.id}" aria-label="Supprimer le tiers" title="Supprimer le tiers">✕</button></li></ul>`:`<p class="sub">Choisissez un tiers dans la liste pour le renommer ou le supprimer.</p>`}`
 :`<p class="empty">Aucun tiers pour l’instant. Les tiers (commerces, employeur…) sont facultatifs : ajoutez-en ci-dessus pour retrouver vos opérations plus facilement.</p>`}
 </section>`}

drawLst=function(){
 const col=(k,l)=>{const L=S.cats.filter(c=>c.kind===k);
  return `<div><h3 class="gh" style="margin-top:0">${l} <span class="sub">(${L.length})</span></h3>${L.map(catHtml).join("")||`<p class="empty">Aucune catégorie.</p>`}</div>`};
 $("#app").innerHTML=`<div class="lstg">${tiersHtml()}
 <section><h2>Catégories et sous-catégories</h2>
 <form class="inl" data-add="cat"><input name="n" placeholder="Nouvelle catégorie" aria-label="Nouvelle catégorie" required><select name="k" aria-label="Type"><option value="dep">Dépense</option><option value="rev">Revenu</option></select><button class="primary">Ajouter</button></form>
 <div class="cc2">${col("rev","Revenus")}${col("dep","Dépenses")}</div></section></div>`};

/* Une seule catégorie ouverte à la fois : la page reste courte */
document.addEventListener("toggle",e=>{const d=e.target,id=d&&d.dataset&&d.dataset.cx;if(!id)return;
 if(d.open){OPEN.add(id);document.querySelectorAll("details.cx[open]").forEach(o=>{if(o!==d)o.open=false})}
 else OPEN.delete(id)},true);

document.addEventListener("change",e=>{const t=e.target;if(T!=="lst")return;
 if(t.id==="lsel"){LSEL=t.value;drawLst()}
 else if(t.dataset&&t.dataset.ren&&t.dataset.ren.startsWith("tier:")){sortAll();save();drawLst()}});

/* La pastille de couleur du titre suit le sélecteur en direct */
document.addEventListener("input",e=>{const x=e.target;if(x.dataset&&x.dataset.ccol){const d=document.querySelector(`details[data-cx="${x.dataset.ccol}"] .cd`);if(d)d.style.background=x.value}});

if(T==="lst")drawLst();
})();
