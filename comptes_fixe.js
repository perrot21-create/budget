
/* comptes_fixe.js v2 — La page ne bouge plus dans les onglets Comptes, Tableau de bord et Tiers et catégories.
   - Comptes : seul le tableau des opérations défile.
   - Tableau de bord et Tiers et catégories : la page est figée dès que son contenu tient à l'écran
     (si le contenu est plus long que l'écran, elle défile normalement pour que rien ne soit caché).
   À charger APRÈS reglages.js (et tiers.js) : <script src="comptes_fixe.js"></script>
   Pour revenir à l'ancien comportement : supprimer cette ligne <script> (et le fichier). */
(()=>{
const st=document.createElement("style");
st.textContent="html.accfix,html.accfix body{overflow:hidden!important;height:100%}.tw3{overscroll-behavior:contain}";
document.head.appendChild(st);

let busy=0;
function fit(){
 const r=document.documentElement,w=document.querySelector(".tw3");
 /* point de départ : tout déverrouillé, page en haut, pour mesurer la vraie taille du contenu */
 r.classList.remove("accfix");if(w)w.style.maxHeight="";scrollTo(0,0);

 if(T==="acc"){
  if(!matchMedia("(min-width:761px)").matches||!w)return;
  const top=w.getBoundingClientRect().top+scrollY,h=innerHeight-top-60;
  /* fenêtre trop basse : on laisse la page défiler normalement */
  if(h<200)return;
  w.style.maxHeight=Math.floor(h)+"px";r.classList.add("accfix");
  if(typeof fixCols==="function")fixCols();
 }else if(T==="dash"||T==="lst"){
  /* bas réel du contenu (sans la marge vide en bas de page) */
  const kids=[...document.querySelectorAll("#app > *")].filter(k=>k.offsetHeight>0&&!k.classList.contains("vh"));
  const bottom=Math.max(0,...kids.map(k=>k.getBoundingClientRect().bottom));
  if(bottom+8<=innerHeight)r.classList.add("accfix");
 }
}
const later=()=>{if(busy)return;busy=1;requestAnimationFrame(()=>{busy=0;fit()})};

const od=drawOps;drawOps=function(){od.apply(this,arguments);later()};
const odr=draw;window.draw=draw=function(){odr.apply(this,arguments);later()};

addEventListener("resize",later);
document.addEventListener("click",later,true);
document.addEventListener("change",later,true);
document.addEventListener("toggle",later,true);
if(window.ResizeObserver){const a=document.getElementById("app");if(a)new ResizeObserver(()=>{if(T==="dash"||T==="lst")later()}).observe(a)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(later);
fit();
})();
