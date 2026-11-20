
/* comptes_fixe.js — Onglet Comptes : la page ne bouge plus, seul le tableau des opérations défile.
   À charger APRÈS reglages.js (et tiers.js) : <script src="comptes_fixe.js"></script>
   Pour revenir à l'ancien comportement : supprimer cette ligne <script> (et le fichier). */
(()=>{
const st=document.createElement("style");
st.textContent="html.accfix,html.accfix body{overflow:hidden!important;height:100%}.tw3{overscroll-behavior:contain}";
document.head.appendChild(st);

let busy=0;
function fit(){
 const on=T==="acc"&&matchMedia("(min-width:761px)").matches,r=document.documentElement,w=document.querySelector(".tw3");
 if(!on||!w){r.classList.remove("accfix");if(w)w.style.maxHeight="";return}
 /* on déverrouille d'abord pour mesurer la position réelle du tableau */
 r.classList.remove("accfix");w.style.maxHeight="";scrollTo(0,0);
 const top=w.getBoundingClientRect().top+scrollY,h=innerHeight-top-60;
 /* fenêtre trop basse : on laisse la page défiler normalement pour ne rien rendre inaccessible */
 if(h<200)return;
 w.style.maxHeight=Math.floor(h)+"px";r.classList.add("accfix");
 if(typeof fixCols==="function")fixCols();
}
const later=()=>{if(busy)return;busy=1;requestAnimationFrame(()=>{busy=0;fit()})};

const od=drawOps;drawOps=function(){od.apply(this,arguments);later()};
const odr=draw;window.draw=draw=function(){odr.apply(this,arguments);later()};

addEventListener("resize",later);
document.addEventListener("click",later,true);
document.addEventListener("change",later,true);
fit();
})();
