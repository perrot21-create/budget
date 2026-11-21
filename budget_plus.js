/* budget_plus.js : refonte visuelle et dynamique du « Budget annuel »
   À charger EN DERNIER : <script src="budget_plus.js"></script> (après comptes_fixe.js) */
(()=>{
"use strict";
const g=(a,p)=>`linear-gradient(color-mix(in srgb,${a} ${p}%,transparent),color-mix(in srgb,${a} ${p}%,transparent))`;
const css=`
:root{--q0:#4a86c5;--q1:#4aa06d;--q2:#d19a3a;--q3:#9166c9}
#bt .mc0{--mcol:#4a86c5}#bt .mc1{--mcol:#3fa7b8}#bt .mc2{--mcol:#4aa06d}#bt .mc3{--mcol:#8c9a3d}#bt .mc4{--mcol:#d1b23a}#bt .mc5{--mcol:#d19a3a}#bt .mc6{--mcol:#e0763f}#bt .mc7{--mcol:#d6567a}#bt .mc8{--mcol:#c0504d}#bt .mc9{--mcol:#9166c9}#bt .mc10{--mcol:#6c6fc9}#bt .mc11{--mcol:#5a7fa8}
#bt .q0{--qc:var(--q0)}#bt .q1{--qc:var(--q1)}#bt .q2{--qc:var(--q2)}#bt .q3{--qc:var(--q3)}
/* mois : trimestres, mois en cours, mois passés */
#bt tbody tr:not(.sec) td.mq{background-image:${g("var(--mcol)",9)}!important}
#bt td.qs{box-shadow:inset 3px 0 0 color-mix(in srgb,var(--qc) 65%,transparent)}
#bt thead th[data-mo]{border-radius:10px 10px 0 0;box-shadow:inset 0 -3px 0 var(--mcol),0 1px 0 var(--line);background-image:${g("var(--mcol)",12)}!important}
/* mois en cours : liseré vert continu autour de toute la colonne (haut, gauche, droite, bas) */
#bt .m-cur.mcf{--bl:inset 3px 0 0 var(--accent)}
#bt .m-cur.mcl{--br:inset -3px 0 0 var(--accent)}
#bt .m-cur.mcb{--bb:inset 0 -3px 0 var(--accent)}
#bt td.m-cur{box-shadow:var(--bl,0 0 0 0 transparent),var(--br,0 0 0 0 transparent),var(--bb,0 0 0 0 transparent)!important}
#bt tbody td.m-cur.mcl:not(.pin){position:relative}
#bt tbody td.m-cur.mcl::after{content:"";position:absolute;top:0;bottom:0;right:0;width:3px;background:var(--accent);pointer-events:none}
#bt thead th.m-cur{font-weight:800}
#bt thead tr:first-child th.m-cur{box-shadow:var(--bl,0 0 0 0 transparent),var(--br,0 0 0 0 transparent),inset 0 3px 0 var(--accent),inset 0 -3px 0 var(--mcol),0 1px 0 var(--line)!important}
#bt thead tr:not(:first-child) th.m-cur{box-shadow:var(--bl,0 0 0 0 transparent),var(--br,0 0 0 0 transparent),0 1px 0 var(--line)!important}
#bt thead th.m-past{opacity:.72}
/* mois terminés : toutes les cellules (Budget, Réel, Écart) reçoivent la même opacité, donc la même teinte */
#bt tbody td.m-past{opacity:.6}
.qb{font-style:normal;font-size:.68rem;font-weight:800;letter-spacing:.05em;color:var(--onacc,#fff);background:var(--qc);border-radius:6px;padding:1px 6px;margin-right:6px;vertical-align:middle}
.nw{font-style:normal;font-size:.68rem;font-weight:700;color:var(--onacc,#fff);background:var(--accent);border-radius:999px;padding:1px 8px;margin-left:6px;vertical-align:middle}
/* survol : seulement la cellule pointée et le Budget du cumul annuel de sa ligne */
#bt tbody tr:not(.sec) td:hover:not(.nm),#bt tbody tr:not(.sec) td.hc{background-image:${g("var(--accent)",26)}!important}
/* bandeaux de catégorie */
#bt tr.cb td.nm{box-shadow:inset 5px 0 0 var(--cc),3px 0 0 rgba(128,128,128,.4)!important;padding-left:12px}
#bt tr.hdr.cb td.nm{box-shadow:inset 8px 0 0 var(--cc),3px 0 0 rgba(128,128,128,.4)!important;padding-left:16px;font-weight:800}
#bt tbody tr.a0 td,#bt tbody tr.a1 td{border-top:2px solid color-mix(in srgb,var(--mute) 32%,var(--surface))!important}
#bt tbody tr.sub td{border-top-color:color-mix(in srgb,var(--line) 50%,transparent)!important}
#bt tbody tr.sub td:not(.nm){font-size:.95em}
/* bandeaux Revenus / Dépenses / Synthèse : fonds plus clairs */
#bt tbody tr.sec.sr td{background-color:color-mix(in srgb,var(--pos) 6%,var(--surface))!important}
#bt tbody tr.sec.sd td{background-color:color-mix(in srgb,var(--neg) 6%,var(--surface))!important}
#bt tbody tr.sec.ss td{background-color:color-mix(in srgb,var(--mute) 6%,var(--surface))!important}
/* toute la ligne du bandeau prend le fond de sa cellule-titre */
html #bt#bt tbody tr.sec.sbk>:not(:first-child){background-color:var(--sb)!important;background-image:var(--sbi,none)!important;opacity:1!important}
/* lignes Solde du mois et Solde cumulé : mêmes traits (haut et bas) sur tous les mois, couleur du cadre de la ligne */
#bt tbody tr.tsol td:not(.nm),#bt tbody tr.tcum td:not(.nm){border-top:2px solid var(--sl)!important;border-bottom:2px solid var(--sl)!important}
/* petit trait blanc au-dessus de chaque sous-catégorie (dont la première) */
#bt tbody tr.sub td{border-top:1px solid #fff!important}
#bt tr.tcum td,#bt tr.tsol td{font-size:1.05em}
/* catégorie ouverte : séparation marquée au-dessus d'elle et au-dessus de la ligne qui suit ses sous-catégories */
#bt tbody tr.opt td,#bt tbody tr.opb td{border-top:4px solid color-mix(in srgb,var(--mute) 70%,var(--surface))!important}
/* mois ouvert : même séparation marquée entre sa colonne Écart et le mois suivant */
#bt tbody td.mob,#bt thead th.mob{border-left:4px solid color-mix(in srgb,var(--mute) 70%,var(--surface))!important}
/* deux teintes alternées une catégorie sur deux : vertes pour les revenus, rouges pour les dépenses (tous les mois) */
#bt tbody tr.k-rev.ca0 td{background-color:color-mix(in srgb,var(--pos) 3%,var(--surface))!important}
#bt tbody tr.k-rev.ca1 td{background-color:color-mix(in srgb,var(--pos) 8%,var(--surface))!important}
#bt tbody tr.k-dep.ca0 td{background-color:color-mix(in srgb,var(--neg) 3%,var(--surface))!important}
#bt tbody tr.k-dep.ca1 td{background-color:color-mix(in srgb,var(--neg) 8%,var(--surface))!important}
/* sous-catégories : même couleur que leur catégorie, très légèrement plus foncée */
#bt tbody tr.k-rev.ca0.sub td{background-color:color-mix(in srgb,var(--pos) 6%,var(--surface))!important}
#bt tbody tr.k-rev.ca1.sub td{background-color:color-mix(in srgb,var(--pos) 15%,var(--surface))!important}
#bt tbody tr.k-dep.ca0.sub td{background-color:color-mix(in srgb,var(--neg) 6%,var(--surface))!important}
#bt tbody tr.k-dep.ca1.sub td{background-color:color-mix(in srgb,var(--neg) 15%,var(--surface))!important}
/* catégories au ton clair (si la ligne de référence est de ton clair) */
#bt tbody tr.k-rev.ca0.sl td{background-color:color-mix(in srgb,var(--pos) 2%,var(--surface))!important}
#bt tbody tr.k-rev.ca1.sl td{background-color:color-mix(in srgb,var(--pos) 6%,var(--surface))!important}
#bt tbody tr.k-dep.ca0.sl td{background-color:color-mix(in srgb,var(--neg) 2%,var(--surface))!important}
#bt tbody tr.k-dep.ca1.sl td{background-color:color-mix(in srgb,var(--neg) 6%,var(--surface))!important}
#bt tbody tr.sl:not(.sec) td.mq{background-image:${g("var(--mcol)",6)}!important}
/* heatmap : rouge = dépassement / gros manque, orange = limite proche / petit manque, vert = revenu atteint */
#bt td.hr2{--hg:${g("#d9483b",55)}}#bt td.hr1{--hg:${g("#d9483b",32)}}#bt td.ha{--hg:${g("#e0a030",34)}}#bt td.hg{--hg:${g("#3fa56d",30)}}
#bt tbody tr:not(.sec) td.hh.hh.hh{background-image:var(--hg)!important}
#bt tbody tr:not(.sec) td.hh.hh.hh:hover:not(.nm){background-image:${g("var(--accent)",26)},var(--hg)!important}
.hk{display:inline-block;width:10px;height:10px;border-radius:3px;margin:0 4px 0 10px;vertical-align:baseline}
/* flèches, mini-courbes */
.bpcl{padding:4px 10px;font-size:var(--fs-sm);font-weight:600;white-space:nowrap;max-width:calc(100% - 12px);display:inline-block;margin:0 auto}
#bt thead tr:first-child th.nm{text-align:center;vertical-align:middle}
.ar2{font-size:.95em;font-weight:800;margin-right:3px}
/* écart nul (budget et réel renseignés, réel = budget) : coche à la place d'une case vide */
.ok0{color:var(--pos);font-weight:800;font-size:.95em}
#bt td.z0>*:not(.ok0){display:none}
.spk{width:44px;height:16px;vertical-align:middle;margin-right:6px;overflow:visible}
.spk .sb{fill:none;stroke:var(--mute);stroke-width:1;stroke-dasharray:2 2;opacity:.7}
.spk .sr{fill:none;stroke:var(--accent);stroke-width:1.8;stroke-linejoin:round}
/* colonne du mois en cours épinglée */
#bt td.pin{position:sticky;z-index:1}
/* filtres, vues */
#bt.fdep tr.k-rev,#bt.fov tr.k-rev,#bt.fov tr.nov{display:none}
#bt .vx,#bt col.vx{display:none!important}
/* animations douces */
@keyframes bpin{from{opacity:0}to{opacity:1}}
#bt.anim td,#bt.anim th{animation:bpin .32s ease-out}
/* espace entre les montants et le bord des cellules (ajuster --cp pour plus ou moins d'écart) */
#bt{--cp:14px}
#bt tbody td:not(.nm){padding-left:var(--cp)!important;padding-right:var(--cp)!important}
/* barre d'outils */
.bpc{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.bpc select,.bpc button{height:40px}
.bpc button.on{background:var(--accent);border-color:var(--accent);color:var(--onacc,#fff);font-weight:700}
`;
const st=document.createElement("style");st.textContent=css;document.head.appendChild(st);

const P=()=>S.bp||(S.bp={view:"all",dep:0,over:0,heat:0,pin:0});
let animF=false,topF=false;const NMC={};
/* rôle d'une cellule du corps : r = réel, e = écart, b = budget */
const roleOf=td=>td.classList.contains("ri")?"r":td.classList.contains("v")?"e":td.classList.contains("g")?"b":"";
/* lit le montant affiché dans une cellule (champ de saisie ou texte) ; NaN si aucun nombre */
const num=el=>{if(!el)return NaN;const i=el.querySelector("input");let t=String(i?i.value:el.textContent).replace(/[\s\u00a0\u202f€]/g,"").replace(/\u2212/g,"-");
  if(t.includes(","))t=t.replace(/\./g,"").replace(",",".");t=t.replace(/[^0-9.\-]/g,"");const v=parseFloat(t);return isNaN(v)?NaN:v};

function maps(){
  const R={},B={},add=(o,k,m,v)=>{(o[k]=o[k]||Array(12).fill(0))[m]+=v};
  S.tx.forEach(t=>{if(!t.cat||+t.date.slice(0,4)!==Y)return;const m=+t.date.slice(5,7)-1,v=kindOf(t.cat)==="rev"?t.v:-t.v;add(R,t.cat+":"+(t.sub||""),m,v);add(R,t.cat,m,v)});
  for(const key in S.budget){const[y,k]=key.split("|");if(+y!==Y)continue;const c=k.split(":")[0];(S.budget[key]||[]).forEach((v,m)=>{add(B,k,m,+v||0);add(B,c,m,+v||0)})}
  return{R,B};
}
function spark(r,b,cy,cm){
  const mx=Math.max(1,...r,...b),pt=a=>a.map((v,i)=>`${i*4},${(15-Math.max(0,v)/mx*14).toFixed(1)}`).join(" ");
  const n=Y<cy?12:Y===cy?cm+1:0,rr=r.slice(0,n);
  return `<svg class="spk" viewBox="0 0 44 16" aria-hidden="true"><polyline class="sb" points="${pt(b)}"/>${rr.length>1?`<polyline class="sr" points="${pt(rr)}"/>`:""}</svg>`;
}

function leg(){
  const bp=document.querySelector(".bpc"),lg=document.getElementById("hleg");
  if(!bp)return;
  if(!P().heat){if(lg)lg.remove();return}
  if(!lg){const e=document.createElement("span");e.id="hleg";e.className="sub";
    e.innerHTML='<i class="hk" style="background:#d9483b"></i>Dépassement ou gros manque<i class="hk" style="background:#e0a030"></i>Limite proche ou petit manque<i class="hk" style="background:#3fa56d"></i>Revenu atteint';bp.appendChild(e)}
}
function post(){
  const w=document.getElementById("bt"),tb=w&&w.querySelector("table");if(!tb)return;
  const p=P(),now=new Date(),cy=now.getFullYear(),cm=now.getMonth(),{R,B}=maps();
  const vis=m=>p.view==="all"||(p.view[0]==="q"?(m/3|0)===+p.view[1]:m===(Y===cy?cm:0));
  const st=m=>Y<cy?"m-past":Y>cy?"m-fut":m<cm?"m-past":m===cm?"m-cur":"m-fut";
  hcEl=null;leg();
  /* correspondance colonne → mois */
  const mo=[];let ci=1;
  [...tb.querySelectorAll("thead tr:first-child th")].slice(1).forEach(th=>{const n=th.colSpan||1,m=th.dataset.mo===undefined?-1:+th.dataset.mo;for(let j=0;j<n;j++)mo[ci+j]=m;ci+=n});
  const cols=[...tb.querySelectorAll("col")],cw=cols.map(c=>parseFloat(c.style.width)||0);
  const first={};mo.forEach((m,i)=>{if(m>=0&&first[m]===undefined)first[m]=i});
  const pinOn=p.pin&&Y===cy,left=(i)=>{let x=cw[0];for(let j=first[cm];j<i;j++)x+=cw[j];return x};
  /* étiquettes d'en-tête */
  tb.querySelectorAll("thead tr").forEach((tr,ri)=>{
    let c=ri===1?1:0;
    [...tr.cells].forEach(td=>{
      if(ri===0&&td.classList.contains("nm")&&!td.querySelector(".bpcl"))td.insertAdjacentHTML("afterbegin",'<button type="button" class="bpcl" data-tg="all-close" title="Fermer toutes les catégories">▸ Tout fermer</button>');
      const n=td.colSpan||1,m=mo[c]===undefined?-1:mo[c];td.dataset.col=c;
      if(m>=0){
        td.dataset.mm=m;td.classList.add(st(m),"q"+(m/3|0),"mc"+m);if(!vis(m))td.classList.add("vx");
        if(ri===0){const sp=td.querySelector(".mst");if(sp){if(m%3===0)sp.insertAdjacentHTML("afterbegin",`<em class="qb">T${m/3+1}</em>`);if(st(m)==="m-cur")sp.insertAdjacentHTML("beforeend",`<em class="nw">${CM[m]?"Aujourd’hui":"●"}</em>`)}}
        if(pinOn&&m===cm){td.classList.add("pin");td.style.left=left(c)+"px"}
      }
      c+=n});
  });
  /* corps du tableau */
  let cc="",ca=0;const ix={rev:0,dep:0};
  tb.querySelectorAll("tbody tr").forEach(tr=>{
    const sec=tr.classList.contains("sec"),isK=/\bk-(rev|dep)\b/.test(tr.className)&&!sec,dep=tr.classList.contains("k-dep");
    let info=null;
    if(isK){
      const dot=tr.querySelector("td.nm i.cd");if(dot&&dot.style.background)cc=dot.style.background;
      if(cc){tr.style.setProperty("--cc",cc);tr.classList.add("cb")}
      if(!tr.classList.contains("sub"))ca=ix[dep?"dep":"rev"]++%2;
      tr.classList.add("ca"+ca);
      const tg=tr.querySelector("[data-tg]"),ik=tr.querySelector("input[data-k]"),key=tg?tg.dataset.tg:ik?ik.dataset.k:null;
      if(key)info={b:B[key]||Array(12).fill(0),r:R[key]||Array(12).fill(0)};
      if(!info||!(dep&&info.b.some((x,m)=>info.r[m]>x&&info.r[m]>0)))tr.classList.add("nov");
    }
    const rowCells=[];{let k=0;[...tr.cells].forEach(x=>{rowCells.push([x,mo[k]===undefined?-1:mo[k]]);k+=x.colSpan||1})}
    let c=0;
    [...tr.cells].forEach(td=>{
      const n=td.colSpan||1,m=mo[c]===undefined?-1:mo[c];td.dataset.col=c;
      if(m>=0){
        td.dataset.mm=m;const s=st(m);td.classList.add(s,"q"+(m/3|0),"mq","mc"+m);
        if(first[m]===c&&m%3===0)td.classList.add("qs");
        if(!vis(m))td.classList.add("vx");
        if(pinOn&&m===cm&&!sec){td.classList.add("pin");td.style.left=left(c)+"px"}
        if(isK&&roleOf(td)==="e"){
          const pick=ro=>{const f=rowCells.find(([x,mm])=>mm===m&&roleOf(x)===ro);return f?num(f[0]):NaN};
          let bv=pick("b"),rv=pick("r");
          if(isNaN(bv)&&info)bv=info.b[m];
          if(isNaN(rv)&&info)rv=info.r[m];
          if(Math.abs(bv)>0&&Math.abs(rv)>0&&Math.abs(Math.abs(rv)-Math.abs(bv))<.5){
            [...td.childNodes].forEach(x=>{if(x.nodeType===3)x.remove()});
            td.classList.add("z0");
            td.insertAdjacentHTML("afterbegin",'<span class="ok0" title="Réel égal au budget" aria-label="Réel égal au budget">✓</span>');
          }
        }
        if(info){
          const b=info.b[m],r=info.r[m],role=td.classList.contains("ri")?"r":td.classList.contains("v")?"e":td.classList.contains("g")?"b":"";
          if(role==="e"&&!td.classList.contains("z0")){const t=td.textContent.trim();if(t&&t!=="–")td.insertAdjacentHTML("afterbegin",`<span class="ar2" aria-hidden="true">${t[0]==="+"?"↑":"↓"}</span>`)}
          if(p.heat&&role&&s!=="m-fut"&&(b>0||r>0)){
            let h="";
            if(dep){const q=b>0?r/b:9;h=q>1.2?"hr2":q>1?"hr1":q>=.9?"ha":""}
            else{const q=b>0?r/b:1;if(q>=1)h="hg";else if(s==="m-past")h=q<.7?"hr2":q<.9?"ha":""}
            if(h)td.classList.add("hh",h)}
        }
      }
      c+=n;
    });
    if(info){const l=tr.lastElementChild;if(l&&l.classList.contains("pc"))l.insertAdjacentHTML("afterbegin",spark(info.r,info.b,cy,cm))}
  });
  /* toutes les catégories d'un type prennent la couleur de la ligne « Autres » (revenus) ou « Abonnements » (dépenses) */
  const nrm=t=>t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/^[^a-z0-9]+/i,"").toLowerCase(),src={rev:/^autres/,dep:/^abonnement/};
  ["rev","dep"].forEach(kd=>{
    const rows=[...tb.querySelectorAll(`tbody tr.k-${kd}:not(.sec)`)],s=rows.find(r=>src[kd].test(nrm(r.querySelector("td.nm").textContent)));
    if(s)NMC[kd]={ca:s.classList.contains("ca1")?1:0,sl:s.classList.contains("sub")};
    const o=NMC[kd];if(!o)return;
    rows.filter(r=>!r.classList.contains("sub")&&r!==s).forEach(r=>{r.classList.remove("ca0","ca1");r.classList.add("ca"+o.ca);if(o.sl)r.classList.add("sl")});
  });
  /* sous-catégories : même alternance que leur catégorie (plus foncées grâce au CSS) */
  ["rev","dep"].forEach(kd=>{const o=NMC[kd];if(!o)return;
    tb.querySelectorAll(`tbody tr.k-${kd}.sub:not(.sec)`).forEach(r=>{r.classList.remove("ca0","ca1","sf");r.classList.add("ca"+o.ca)})});
  /* catégorie ouverte (sous-catégories visibles) : repères pour les séparations marquées */
  tb.querySelectorAll(".opt,.opb").forEach(x=>x.classList.remove("opt","opb"));
  {const trs=[...tb.querySelectorAll("tbody tr")];
    trs.forEach((tr,i)=>{
      if(tr.classList.contains("sub"))return;
      const nx=trs[i+1];if(!nx||!nx.classList.contains("sub")||!nx.getClientRects().length)return;
      let j=i+1;while(trs[j+1]&&trs[j+1].classList.contains("sub"))j++;
      tr.classList.add("opt");if(trs[j+1])trs[j+1].classList.add("opb");
    })}
  /* bandeaux de section : type repéré par leur titre (revenus / dépenses / synthèse) */
  tb.querySelectorAll("tbody tr.sec").forEach(r=>{
    const t=nrm(r.textContent);r.classList.remove("sr","sd","ss");
    r.classList.add(/^revenu/.test(t)?"sr":/^depense/.test(t)?"sd":"ss");
    r.classList.remove("sbk");const n=r.cells[0];
    if(n){const cs=getComputedStyle(n),bg=cs.backgroundColor,bi=cs.backgroundImage,clear=!bg||/^rgba\(.*,\s*0\)$|^transparent$/.test(bg);
      if(!clear||bi!=="none"){r.style.setProperty("--sb",clear?"transparent":bg);r.style.setProperty("--sbi",bi);r.classList.add("sbk")}}
  });
  /* soldes : la couleur du cadre (bleu / vert) est celle du titre de la ligne */
  tb.querySelectorAll("tbody tr.tsol,tbody tr.tcum").forEach(r=>{const n=r.querySelector("td.nm");if(n)r.style.setProperty("--sl",getComputedStyle(n).color)});
  /* colonnes masquées (vues trimestre / mois) et largeur du tableau */
  cols.forEach((col,i)=>{if(mo[i]>=0&&!vis(mo[i]))col.classList.add("vx")});
  tb.style.width=cols.reduce((s,c,i)=>s+(c.classList.contains("vx")?0:cw[i]),0)+"px";
  if(p.view!=="all")w.scrollLeft=0;
  w.classList.toggle("fdep",!!p.dep);w.classList.toggle("fov",!!p.over);
  /* cadre du mois en cours : bords gauche / droit / bas */
  const lastC={};mo.forEach((m,i)=>{if(m>=0)lastC[m]=i});
  tb.querySelectorAll(".mcf,.mcl,.mcb").forEach(x=>x.classList.remove("mcf","mcl","mcb"));
  tb.querySelectorAll(".m-cur").forEach(x=>{const c=+x.dataset.col,n=x.colSpan||1;if(c===first[cm])x.classList.add("mcf");if(c+n-1===lastC[cm])x.classList.add("mcl")});
  /* mois ouvert (plusieurs colonnes) : repère la 1re colonne du mois suivant pour la séparation marquée */
  tb.querySelectorAll(".mob").forEach(x=>x.classList.remove("mob"));
  for(let m=0;m<11;m++){
    if(first[m]===undefined||first[m+1]===undefined||lastC[m]<=first[m])continue;
    tb.querySelectorAll(`[data-mm="${m+1}"]`).forEach(x=>{if(+x.dataset.col===first[m+1])x.classList.add("mob")});
  }
  const vr=[...tb.querySelectorAll("tbody tr")].filter(r=>r.getClientRects().length),lr=vr[vr.length-1];
  if(lr)lr.querySelectorAll(".m-cur").forEach(x=>x.classList.add("mcb"));
  /* lignes d'en-tête (mois ; Budget / Réel / Écart) : même hauteur que la ligne Revenus */
  {const hr=[...tb.querySelectorAll("thead tr")];hr.forEach(t=>{t.style.height=""});
    const sr=tb.querySelector("tbody tr.sec"),h=sr?Math.round(sr.getBoundingClientRect().height):0;
    if(h>0)hr.forEach(t=>{t.style.height=h+"px"})}
  reveal();
  /* « Tout fermer » : le tableau remonte au début */
  if(topF){topF=false;const inn=w.querySelector(".in");if(inn)inn.style.paddingBottom="";w.scrollTop=0;requestAnimationFrame(()=>w.scrollTo({top:0,behavior:"smooth"}))}
  if(animF){animF=false;w.classList.add("anim");setTimeout(()=>w.classList.remove("anim"),400)}
}

/* wrappers : se branchent sur le dessin existant */
const oB=window.drawBud;
window.drawBud=function(){const r=oB.apply(this,arguments);post();return r};
const oT=window.drawBudTab;
window.drawBudTab=function(){
  const r=oT.apply(this,arguments),ctl=document.querySelector("#app>.ctl"),p=P();
  if(ctl&&!ctl.querySelector(".bpc")){
    const d=document.createElement("div");d.className="bpc";
    d.innerHTML=`<select id="bpv" aria-label="Vue"><option value="all">Année entière</option><option value="q0">Trimestre T1</option><option value="q1">Trimestre T2</option><option value="q2">Trimestre T3</option><option value="q3">Trimestre T4</option><option value="m">Focus mois</option></select>
    <button data-bp="dep" title="Masquer les revenus">Dépenses seules</button><button data-bp="over" title="Afficher uniquement les lignes en dépassement">Dépassements</button><button data-bp="heat" title="Colorer les cellules selon l’écart au budget">Heatmap</button><button data-bp="pin" title="Épingler le mois en cours à côté des noms">Épingler le mois</button>`;
    ctl.insertBefore(d,ctl.querySelector(".dd"));
    d.querySelector("#bpv").value=p.view;
    d.querySelectorAll("[data-bp]").forEach(b=>b.classList.toggle("on",!!p[b.dataset.bp]));
  }
  leg();return r;
};
document.addEventListener("change",e=>{
  if(e.target.id!=="bpv")return;
  const p=P(),v=e.target.value,n=new Date(),m=Y===n.getFullYear()?n.getMonth():0;
  p.view=v;CM={};
  if(v[0]==="q")for(let i=0;i<3;i++)CM[+v[1]*3+i]=true;else if(v==="m")CM[m]=true;else if(Y===n.getFullYear())CM[n.getMonth()]=true;
  save();drawBud();
});
document.addEventListener("click",e=>{
  const b=e.target.closest("[data-bp]");
  if(b){const p=P(),k=b.dataset.bp;p[k]=p[k]?0:1;b.classList.toggle("on",!!p[k]);save();drawBud()}
},false);
let openId=null;
document.addEventListener("click",e=>{
  if(e.target.closest("[data-tm],[data-tg],[data-ca]"))animF=true;
  if(e.target.closest('[data-tg="all-close"]'))topF=true;
  const b=e.target.closest("[data-tg]");if(b&&!/^all-/.test(b.dataset.tg)&&CL[b.dataset.tg])openId=b.dataset.tg;
},true);
function reveal(){
  if(!openId)return;const id=openId;openId=null;
  const w=document.getElementById("bt"),btn=w&&w.querySelector(`[data-tg="${id}"]`),hdr=btn&&btn.closest("tr");if(!hdr)return;
  let last=hdr;while(last.nextElementSibling&&last.nextElementSibling.classList.contains("sub"))last=last.nextElementSibling;
  requestAnimationFrame(()=>{
    const wr=w.getBoundingClientRect(),hh=w.querySelector("thead").offsetHeight,top=wr.top+hh,H=wr.bottom-top,
      gt=hdr.getBoundingClientRect().top,gb=last.getBoundingClientRect().bottom,gh=gb-gt;
    if(hdr.classList.contains("k-dep")){
      /* dépenses : la catégorie ouverte est centrée dans la zone visible (ou calée en haut si elle est plus grande) */
      const d=gh>=H?gt-top:(gt+gh/2)-(top+H/2),room=w.scrollHeight-w.clientHeight-w.scrollTop;
      if(d>room){const inn=w.querySelector(".in");if(inn)inn.style.paddingBottom=Math.ceil(d-room+16)+"px"}
      w.scrollTo({top:Math.max(0,w.scrollTop+d),behavior:"smooth"});
    }else{
      const over=gb-wr.bottom,room=gt-top;
      if(over>0&&room>0)w.scrollTop+=Math.min(over+8,room);
    }
  });
}
/* survol : repère le Budget du cumul annuel de la ligne pointée */
let hcEl=null;const clr=()=>{if(hcEl){hcEl.classList.remove("hc");hcEl=null}};
document.addEventListener("mouseover",e=>{
  const td=e.target.closest&&e.target.closest("#bt tbody tr:not(.sec) td"),an=td&&!td.classList.contains("nm")?td.parentElement.querySelector("td.ga"):null;
  if(an===hcEl)return;clr();if(an){an.classList.add("hc");hcEl=an}
});
document.addEventListener("mouseout",e=>{const r=e.relatedTarget;if(r&&r.closest&&r.closest("#bt"))return;clr()});
if(typeof T!=="undefined"&&T==="bud")draw();
})();
