/* Onglet « Actions » : calculatrice d’achat et de revente d’actions.
   À charger APRÈS le script principal : <script src="actions.js"></script> juste avant </body>.
   Les opérations sont rangées dans S.actions : elles sont donc incluses dans la sauvegarde,
   le fichier partagé et l’annulation de la page. Aucun autre onglet n’est modifié. */
(function(){
"use strict";
var TTF=0.004,J=false,MAN=false;
var $=function(i){return document.getElementById(i)};
function A(){if(!S.actions||!Array.isArray(S.actions.hist))S.actions={hist:[],last:null};return S.actions}
function pn(id){var v=parseFloat(String($(id).value).replace(/\s/g,"").replace(",","."));return isFinite(v)&&v>=0?v:0}
function ns(v){return String(Math.round(v*10000)/10000).replace(".",",")}
function fee(m){return m>=500&&m<=1000?1.9:m>1000&&m<=2000?2.9:m>2000&&m<=4000?3.8:null}
function res(o){
  var tot=o.q*o.pa,fa=fee(tot)||0,ca=tot+fa,vb=o.q*o.pv,fv=fee(vb)||0,t=o.j?0:vb*TTF,net=vb-fv-t,g=net-ca;
  var k=1-(o.j?0:TTF),be=null;
  if(o.q>0&&tot>0){[0,1.9,2.9,3.8].forEach(function(f){var p=(ca+f)/(o.q*k),m=p*o.q,ok=f===0?(m<500||m>4000):fee(m)===f;if(ok&&(be===null||p<be))be=p})}
  return{tot:tot,fa:fa,ca:ca,vb:vb,fv:fv,t:t,net:net,g:g,taux:ca?g/ca*100:0,be:be}
}
function cur(){return{q:pn("ax_q"),pa:pn("ax_pa"),pv:pn("ax_pv"),j:J,man:MAN}}
function pct(t){return(t>0?"+":"")+t.toFixed(2).replace(".",",")+" %"}
function cl(n){return n>0?"pos":n<0?"neg":""}
function msg(m){if(m<=0)return"";return fee(m)===null?"Aucun barème de frais défini pour "+eur2(m)+" (tranches de 500 à 4 000 €) : frais comptés à 0 €.":""}
function note(id,t){var e=$(id);e.hidden=!t;e.textContent=t||""}

var CSS='#acw{--ain:#fff3b8;--ainb:#c9a40f;--alk:color-mix(in srgb,var(--mute) 14%,var(--surface))}'
+':root[data-theme="dark"] #acw{--ain:#3d3512;--ainb:#b39a2e}'
+'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #acw{--ain:#3d3512;--ainb:#b39a2e}}'
+'#acw .axg{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px}'
+'#acw .axf{display:flex;flex-direction:column;gap:4px;font-size:var(--fs-sm);font-weight:600;color:var(--mute)}'
+'#acw .axin{width:100%;height:42px;font-size:var(--fs-lg);font-weight:700;text-align:right;background:var(--ain);border:2px solid var(--ainb);color:var(--ink)}'
+'#acw .axin.lk{background:var(--alk);border:1px solid var(--line);cursor:not-allowed;user-select:none;-webkit-user-select:none}'
+'#acw .axd{margin:14px 0 0;display:grid;gap:6px}'
+'#acw .axr{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:3px 0}'
+'#acw .axr dt{color:var(--mute)}#acw .axr.tt dt{color:var(--ink);font-weight:600}'
+'#acw .axr dd{margin:0;min-width:140px;text-align:right;font-variant-numeric:tabular-nums;background:var(--alk);padding:3px 10px;border-radius:6px;cursor:not-allowed;user-select:none;-webkit-user-select:none}'
+'#acw .axr.tt dd{font-weight:700}'
+'#acw .axk{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-top:14px}'
+'#acw .axb{background:var(--alk);border-radius:12px;padding:12px 14px;cursor:not-allowed;user-select:none;-webkit-user-select:none}'
+'#acw .axb small{display:block;color:var(--mute);font-size:var(--fs-md)}'
+'#acw .axb strong{font-size:1.6rem;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums}'
+'#acw .axs{display:inline-flex;border:1px solid var(--line);border-radius:var(--rb,8px);overflow:hidden}'
+'#acw .axs button{border:0;border-radius:0;height:42px;padding:0 22px}'
+'#acw .axs button[aria-pressed=true]{background:var(--accent);color:var(--onacc);font-weight:700}'
+'#acw .axn{color:var(--neg);margin:10px 0 0;font-size:var(--fs-md)}'
+'#acw .axh{list-style:none;margin:14px 0 0;padding:0;display:grid;gap:8px}'
+'#acw .axh li{border:1px solid var(--line);border-radius:12px;padding:10px 14px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px}'
+'#acw .axh .d{font-size:var(--fs-sm);color:var(--mute)}'
+'#acw .axh .ac{display:flex;gap:6px}#acw .axh .ac button{padding:3px 10px;font-size:var(--fs-sm)}'
+'#acw .axbar{display:flex;flex-wrap:wrap;gap:8px}';

function html(){
  return '<div id="acw"><h2 class="vh">Calculatrice d’actions</h2>'
  +'<section><h2>Achat</h2><div class="axg">'
  +'<label class="axf"><span>Nombre d’actions</span><input class="axin" id="ax_q" inputmode="numeric" autocomplete="off" placeholder="0"></label>'
  +'<label class="axf"><span>Prix d’achat brut par action (€)</span><input class="axin" id="ax_pa" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<label class="axf"><span>Total de l’opération (€)</span><input class="axin lk" id="ax_tot" readonly tabindex="-1" aria-readonly="true"></label></div>'
  +'<dl class="axd"><div class="axr"><dt>Frais d’achat</dt><dd id="ax_fa">–</dd></div><div class="axr tt"><dt>Coût total de l’achat</dt><dd id="ax_ca">–</dd></div></dl>'
  +'<p class="axn" id="ax_na" hidden></p></section>'
  +'<section><h2>Revente</h2><div class="axg">'
  +'<label class="axf"><span>Prix de vente simulé par action (€), par défaut achat + 10 %</span><input class="axin" id="ax_pv" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<div class="axf"><span id="ax_lj">Sortie le même jour</span><div class="axs" role="group" aria-labelledby="ax_lj"><button type="button" id="ax_oui" aria-pressed="false">Oui</button><button type="button" id="ax_non" aria-pressed="true">Non</button></div></div></div>'
  +'<dl class="axd"><div class="axr"><dt>Total de vente brut</dt><dd id="ax_vb">–</dd></div><div class="axr"><dt>Frais de vente</dt><dd id="ax_fv">–</dd></div><div class="axr"><dt>TTF 0,40 %</dt><dd id="ax_tf">–</dd></div><div class="axr tt"><dt>Net encaissé</dt><dd id="ax_net">–</dd></div></dl>'
  +'<p class="axn" id="ax_nv" hidden></p>'
  +'<div class="axk"><div class="axb"><small>Taux de rentabilité</small><strong id="ax_tx">–</strong></div><div class="axb"><small>Gain ou perte net</small><strong id="ax_g">–</strong></div><div class="axb"><small>Prix de vente à l’équilibre</small><strong id="ax_be">–</strong></div></div>'
  +'<p class="sub" style="margin:14px 0 0">Frais par tranche du total de l’opération : de 500 à 1 000 € : 1,90 € · au-delà de 1 000 jusqu’à 2 000 € : 2,90 € · au-delà de 2 000 jusqu’à 4 000 € : 3,80 €. TTF de 0,40 % sur le total de vente brut si la sortie n’a pas lieu le même jour. Taux de rentabilité = gain net ÷ coût total de l’achat.</p></section>'
  +'<section><h2>Opérations enregistrées</h2><div class="axbar"><button type="button" class="primary" id="ax_save">Enregistrer cette opération</button><button type="button" id="ax_clear">Tout effacer</button></div>'
  +'<p class="axn" id="ax_nh" hidden></p><ul class="axh" id="ax_hist"></ul>'
  +'<p class="sub" style="margin:12px 0 0">Vos saisies sont rappelées à la prochaine ouverture. L’historique (30 opérations maximum) fait partie de vos données : il est inclus dans la sauvegarde et dans le fichier partagé.</p></section></div>'
}

function calc(){
  var o=cur(),r=res(o);
  $("ax_fa").textContent=r.tot>0?eur2(r.fa):"–";
  $("ax_ca").textContent=r.tot>0?eur2(r.ca):"–";
  note("ax_na",msg(r.tot));
  $("ax_vb").textContent=r.vb>0?eur2(r.vb):"–";
  $("ax_fv").textContent=r.vb>0?eur2(r.fv):"–";
  $("ax_tf").textContent=r.vb>0?(J?"Non applicable (même jour)":eur2(r.t)):"–";
  $("ax_net").textContent=r.vb>0?eur2(r.net):"–";
  note("ax_nv",msg(r.vb));
  var ok=r.tot>0&&r.vb>0,c=ok?cl(r.g):"";
  $("ax_tx").textContent=ok?pct(r.taux):"–";$("ax_tx").className=c;
  $("ax_g").textContent=ok?(r.g>0?"+":"")+eur2(r.g):"–";$("ax_g").className=c;
  $("ax_be").textContent=r.be!==null?eur2(Math.ceil(r.be*100)/100):"–";
}
function majTotal(){
  var t=pn("ax_q")*pn("ax_pa");$("ax_tot").value=t?t.toFixed(2).replace(".",","):"";
  if(!MAN){var d=pn("ax_pa")*1.1;$("ax_pv").value=d?d.toFixed(2).replace(".",","):""}
  calc();
}
function setJ(v){J=v;$("ax_oui").setAttribute("aria-pressed",String(v));$("ax_non").setAttribute("aria-pressed",String(!v));calc()}
function saveLast(){A().last=cur();save()}
function hist(){
  var H=A().hist,ul=$("ax_hist");
  if(!H.length){ul.innerHTML='<li style="border:0;padding:0" class="sub">Aucune opération enregistrée pour l’instant.</li>';return}
  ul.innerHTML=H.map(function(o){
    var r=res(o),c=cl(r.g),d=new Date(o.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    return '<li><div><div class="d">'+d+' · même jour : '+(o.j?"oui":"non")+'</div><div>'+o.q+' × '+eur2(o.pa)+' → '+eur2(o.pv)+'</div><div class="'+c+'"><b>'+pct(r.taux)+'</b> ('+(r.g>0?"+":"")+eur2(r.g)+')</div></div>'
      +'<div class="ac"><button type="button" data-ax-load="'+o.id+'">Recharger</button><button type="button" data-ax-del="'+o.id+'">Supprimer</button></div></li>'
  }).join("");
}
function render(){
  if(!$("axsty")){var s=document.createElement("style");s.id="axsty";s.textContent=CSS;document.head.appendChild(s)}
  $("app").innerHTML=html();
  var L=A().last;J=false;MAN=false;
  if(L){$("ax_q").value=L.q?ns(L.q):"";$("ax_pa").value=L.pa?ns(L.pa):"";MAN=!!L.man;if(MAN)$("ax_pv").value=L.pv?ns(L.pv):"";J=!!L.j}
  $("ax_oui").setAttribute("aria-pressed",String(J));$("ax_non").setAttribute("aria-pressed",String(!J));
  majTotal();hist();
}

/* Onglet dans la barre de navigation */
var nav=$("tabs");
if(nav&&!nav.querySelector('[data-tab="act"]')){
  var b=document.createElement("button");b.setAttribute("data-tab","act");b.textContent="Actions";
  nav.insertBefore(b,nav.querySelector('[data-tab="sav"]'));
}
/* Branchement sur le dessin de la page */
var origDraw=draw;
window.draw=draw=function(){
  origDraw();
  if(T!=="act")return;
  render();
  document.title="Actions — Mes comptes et budget";
  document.querySelector("main").classList.add("narrow");
  setTimeout(function(){var sr=$("sr");if(sr&&T==="act")sr.textContent="Onglet Actions"},120);
};

/* Événements (limités à l’onglet Actions) */
function inAct(e){return e.target&&e.target.closest&&e.target.closest("#acw")}
document.addEventListener("input",function(e){
  if(!inAct(e))return;
  var id=e.target.id;
  if(id==="ax_pv"){MAN=true;calc()}else if(id==="ax_q"||id==="ax_pa")majTotal();else return;
  saveLast();
});
document.addEventListener("click",function(e){
  if(!inAct(e))return;
  var t=e.target.closest("button");if(!t)return;
  if(t.id==="ax_oui"){setJ(true);saveLast()}
  else if(t.id==="ax_non"){setJ(false);saveLast()}
  else if(t.id==="ax_save"){
    var o=cur(),m=$("ax_nh");
    if(!(o.q>0&&o.pa>0&&o.pv>0)){note("ax_nh","Renseignez le nombre d’actions, le prix d’achat et le prix de vente avant d’enregistrer.");return}
    note("ax_nh","");var sn=snap(),a=A();
    o.id=uid();o.at=Date.now();a.hist.unshift(o);a.hist=a.hist.slice(0,30);save();hist();
    toast("Opération enregistrée",undoTo(sn));
  }
  else if(t.hasAttribute("data-ax-load")){
    var h=A().hist.filter(function(x){return x.id===t.getAttribute("data-ax-load")})[0];if(!h)return;
    $("ax_q").value=ns(h.q);$("ax_pa").value=ns(h.pa);$("ax_pv").value=ns(h.pv);MAN=true;setJ(!!h.j);majTotal();saveLast();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  else if(t.hasAttribute("data-ax-del")){
    var sn2=snap(),id=t.getAttribute("data-ax-del");A().hist=A().hist.filter(function(x){return x.id!==id});save();hist();
    toast("Opération supprimée",undoTo(sn2));
  }
  else if(t.id==="ax_clear"){
    if(!A().hist.length)return;
    ask("Effacer toutes les opérations enregistrées dans l’onglet Actions ?","Effacer").then(function(ok){
      if(!ok)return;var sn3=snap();A().hist=[];save();hist();toast("Historique effacé",undoTo(sn3));
    });
  }
});
})();
