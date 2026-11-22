/* comptes_fixe.js v5 — La page ne bouge plus dans les onglets Comptes, Budget annuel, Tableau de bord,
   Tiers et catégories, Actions et Sauvegarde.
   - Comptes et Budget annuel : seul le tableau défile (Budget annuel : graphiques repliés).
   - Tableau de bord (écran large) : page figée, blocs répartis sur 2 colonnes ; les anneaux de dépenses sont affichés en entier,
     seuls Dernières opérations et Suivi des abonnements défilent en interne.
   - Tiers et catégories, Actions, Sauvegarde : page figée dès que son contenu tient à l'écran
     (sinon elle défile normalement pour que rien ne soit caché).
   À charger APRÈS reglages.js (et tiers.js) : <script src="comptes_fixe.js"></script>
   Pour revenir à l'ancien comportement : supprimer cette ligne <script> (et le fichier). */
(()=>{
const PAGES=["dash","lst","sav","act"];
const st=document.createElement("style");
st.textContent=`
html.accfix,html.accfix body{overflow:hidden!important;height:100%}
.tw3,#bt{overscroll-behavior:contain}
#app.dfit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-rows:minmax(0,1fr);gap:16px}
.dfit .dcol{display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0}
.dfit .dcol>*{margin:0!important;flex:0 0 auto}
.dfit .dcol>.dflex{flex:1 1 0;min-height:0;overflow:auto;overscroll-behavior:contain}
.dfit .dcol>.dgrid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(460px,1fr));gap:12px!important}
.dfit .dgrid2>section{overflow:visible}
.dfit #abo{min-height:110px}
.dfit .hero{gap:12px!important}
.dfit .hbig{font-size:1.9rem}
.dfit section{padding:14px}
.dfit .dalert{max-height:110px;overflow:auto}
`;
document.head.appendChild(st);

/* ---- Tableau de bord : répartition en 2 colonnes ---- */
function dashUnwrap(a){
 if(!a)return;
 const cols=a.querySelectorAll(":scope > .dcol");
 /* on ne remet les anciens blocs en place que si les colonnes existent encore ;
    sinon la page a été redessinée et ces blocs sont périmés */
 if(a._ord&&cols.length)a._ord.forEach(n=>a.appendChild(n));
 a._ord=null;
 cols.forEach(c=>c.remove());
 a.classList.remove("dfit");a.style.height="";
}
}
function dashWrap(a){
 const kids=[...a.children].filter(k=>!k.classList.contains("vh")),
  has=(k,s)=>k.matches(s)||!!k.querySelector(s),
  hero=kids.find(k=>k.classList.contains("hero")),
  alr=kids.find(k=>k.classList.contains("dalert")),
  rings=kids.find(k=>k.classList.contains("dgrid2")),
  sec=kids.filter(k=>k.tagName==="SECTION"&&!k.classList.contains("dalert")),
  comptes=sec.find(k=>k.querySelector(".dgrid")),
  ops=sec.find(k=>k.querySelector(".lhead")),
  cumul=sec.find(k=>k.querySelector(".cbt")),
  abo=kids.find(k=>k.id==="abo");
 const left=[hero,alr,comptes,cumul,ops].filter(Boolean),right=[rings,abo].filter(Boolean);
 kids.forEach(k=>{if(!left.includes(k)&&!right.includes(k))right.push(k)});
 [ops,abo].forEach(k=>k&&k.classList.add("dflex"));
 const L=document.createElement("div"),R=document.createElement("div");L.className=R.className="dcol";
 a._ord=kids.slice();
 left.forEach(n=>L.appendChild(n));right.forEach(n=>R.appendChild(n));
 a.appendChild(L);a.appendChild(R);a.classList.add("dfit");
}

let busy=0;
function fit(){
 const r=document.documentElement,a=document.getElementById("app"),w=document.querySelector(".tw3"),bt=document.getElementById("bt");
 /* nettoyage du mode 2 colonnes s'il ne correspond plus à la page affichée */
 if(a&&a.classList.contains("dfit")&&(T!=="dash"||!a.querySelector(":scope > .dcol")))dashUnwrap(a);
 /* point de départ : tout déverrouillé, page en haut, pour mesurer la vraie taille du contenu */
 r.classList.remove("accfix");if(w)w.style.maxHeight="";if(bt)bt.style.maxHeight="";scrollTo(0,0);

 if(T==="dash"&&matchMedia("(min-width:1000px)").matches&&innerHeight>=620){
  if(!a.classList.contains("dfit"))dashWrap(a);
  a.style.height="";
  const top=a.getBoundingClientRect().top+scrollY;
  a.style.height=Math.floor(innerHeight-top-16)+"px";r.classList.add("accfix");
  /* si une colonne ne peut vraiment pas tenir, on revient à la page normale */
  if([...a.querySelectorAll(":scope > .dcol")].some(c=>c.scrollHeight>c.clientHeight+2)){dashUnwrap(a);r.classList.remove("accfix")}
 }else if(T==="acc"){
  if(!matchMedia("(min-width:761px)").matches||!w)return;
  const top=w.getBoundingClientRect().top+scrollY,h=innerHeight-top-60;
  /* fenêtre trop basse : on laisse la page défiler normalement */
  if(h<200)return;
  w.style.maxHeight=Math.floor(h)+"px";r.classList.add("accfix");
  if(typeof fixCols==="function")fixCols();
 }else if(T==="bud"){
  /* Budget annuel : le tableau occupe la hauteur disponible ; les graphiques doivent être repliés pour que la page tienne à l'écran */
  const ch=document.getElementById("bch"),gd=ch&&ch.querySelector("details");
  if(!bt||!matchMedia("(min-width:761px)").matches||(gd&&gd.open))return;
  const top=bt.getBoundingClientRect().top+scrollY,h=innerHeight-top-(ch?ch.offsetHeight:0)-24;
  if(h<200)return;
  bt.style.maxHeight=Math.floor(h)+"px";r.classList.add("accfix");
 }else if(PAGES.includes(T)){
  /* bas réel du contenu (sans la marge vide en bas de page) */
  const kids=[...document.querySelectorAll("#app > *")].filter(k=>k.offsetHeight>0&&!k.classList.contains("vh"));
  const bottom=Math.max(0,...kids.map(k=>k.getBoundingClientRect().bottom));
  if(bottom+8<=innerHeight)r.classList.add("accfix");
 }
}
const later=()=>{if(busy)return;busy=1;requestAnimationFrame(()=>{busy=0;fit()})};

const od=drawOps;drawOps=function(){od.apply(this,arguments);later()};
const odb=drawBud;drawBud=function(){const d=document.querySelector("#bch details"),was=!!d&&!d.open;odb.apply(this,arguments);if(was){const n=document.querySelector("#bch details");if(n)n.open=false}later()};
const odr=draw;window.draw=draw=function(){odr.apply(this,arguments);fit();later()};

addEventListener("resize",later);
document.addEventListener("click",later,true);
document.addEventListener("change",later,true);
document.addEventListener("toggle",later,true);
if(window.ResizeObserver){const a=document.getElementById("app");if(a)new ResizeObserver(()=>{if(PAGES.includes(T)&&T!=="dash")later()}).observe(a)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
fit();
})();
