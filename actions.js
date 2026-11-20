/* Onglet « Actions » : calculatrice d’achat et de revente d’actions.
   À charger APRÈS le script principal : <script src="actions.js"></script> juste avant </body>.
   Les données sont rangées dans S.actions : sauvegarde, fichier partagé et annulation incluses. */
(function(){
"use strict";
var J=false,MAN=false,SETO=false,PCT=10,EXP={},SORT="new";
var DEF=[{min:500,max:1000,fee:1.9},{min:1000,max:2000,fee:2.9},{min:2000,max:4000,fee:3.8}];
var $=function(i){return document.getElementById(i)};
function A(){if(!S.actions||!Array.isArray(S.actions.hist))S.actions={hist:[],last:null,cfg:null};return S.actions}
function cfg(){var a=A();if(!a.cfg||!Array.isArray(a.cfg.tiers)||!(a.cfg.ttf>=0))a.cfg={tiers:DEF.map(function(t){return{min:t.min,max:t.max,fee:t.fee}}),ttf:0.004};return a.cfg}
function parse(s){s=String(s).replace(/\s/g,"").replace(",",".");return s===""?NaN:parseFloat(s)}
function pn(id){var v=parse($(id).value);return isFinite(v)&&v>=0?v:0}
function ns(v){return String(Math.round(v*10000)/10000).replace(".",",")}
function sorted(c){return c.tiers.slice().sort(function(a,b){return a.min-b.min})}
function fee(m,c){c=c||cfg();var T=sorted(c);for(var i=0;i<T.length;i++){if(m>=T[i].min&&m<=T[i].max)return T[i].fee}return null}
/* Texte de la tranche de frais appliquée à un montant */
function trTxt(m){var T=sorted(cfg());for(var i=0;i<T.length;i++){if(m>=T[i].min&&m<=T[i].max)return"tranche "+eur(T[i].min)+" à "+eur(T[i].max)}return""}
/* TTF : calculée à l'achat, uniquement sur le montant total de l'achat (hors frais).
   Elle s'ajoute au coût de l'achat, sauf si la vente a lieu le même jour. Aucune TTF sur la vente.
   Les calculs gardent la valeur exacte ; l'affichage est arrondi à 2 décimales (eur2). */
function res(o,c){
  c=c||cfg();
  var tot=o.q*o.pa,fa=fee(tot,c)||0,ta=o.j?0:tot*c.ttf,ca=tot+fa+ta,vb=o.q*o.pv,fv=fee(vb,c)||0,net=vb-fv,g=net-ca,be=null;
  if(o.q>0&&tot>0){
    var cand=[0];c.tiers.forEach(function(x){if(cand.indexOf(x.fee)<0)cand.push(x.fee)});
    cand.forEach(function(fx){var p=(ca+fx)/o.q,m=p*o.q,fm=fee(m,c),ok=fx===0?(fm===null||fm===0):fm===fx;if(ok&&(be===null||p<be))be=p});
  }
  return{tot:tot,fa:fa,ta:ta,t:ta,ca:ca,vb:vb,fv:fv,net:net,g:g,taux:ca?g/ca*100:0,be:be}
}
function pvOf(pa,p){return Math.round(pa*(1+p/100)*100)/100}
function cur(){return{q:pn("ax_q"),pa:pn("ax_pa"),pv:pn("ax_pv"),j:J,man:MAN,pct:PCT}}
function pct(t){return(t>0?"+":"")+t.toFixed(2).replace(".",",")+" %"}
function cl(n){return n>0?"pos":n<0?"neg":""}
function ttfTxt(){return ns(cfg().ttf*100)+" %"}
function msg(m){
  if(m<=0||fee(m)!==null)return"";
  var T=cfg().tiers;if(!T.length)return"Aucune tranche de frais définie : frais comptés à 0 €.";
  var lo=Math.min.apply(null,T.map(function(x){return x.min})),hi=Math.max.apply(null,T.map(function(x){return x.max}));
  return"Aucun barème de frais défini pour "+eur2(m)+" (tranches de "+eur(lo)+" à "+eur(hi)+") : frais comptés à 0 €."
}
function hint(){
  var T=sorted(cfg()),tr=T.length?T.map(function(t){return"de "+eur(t.min)+" à "+eur(t.max)+" : "+eur2(t.fee)}).join(" · "):"aucune tranche définie";
  return"Frais par tranche du total de l’opération ("+tr+"). Les mêmes frais s’appliquent à l’achat et à la revente. Si deux tranches se touchent à la même valeur, la tranche la plus basse s’applique. TTF de "+ttfTxt()+" calculée à l’achat sur le montant total de l’achat, hors frais, et ajoutée au coût de l’achat si la vente n’a pas lieu le même jour. Taux de rentabilité = gain net ÷ coût total de l’achat. Les opérations déjà enregistrées conservent leurs montants d’origine."
}
function note(id,t){var e=$(id);e.hidden=!t;e.textContent=t||""}

var CSS=[
'#acw{--ain:#fff3b8;--ainb:#c9a40f;--alk:color-mix(in srgb,var(--mute) 14%,var(--surface))}',
':root[data-theme="dark"] #acw{--ain:#3d3512;--ainb:#b39a2e}',
'@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) #acw{--ain:#3d3512;--ainb:#b39a2e}}',
'#acw h3{margin:18px 0 6px;font-size:var(--fs-md);font-weight:600;color:var(--mute)}',
'#acw .axtop{display:flex;justify-content:flex-end;margin-bottom:12px}',
/* barre de résultats : reste visible sous l’en-tête pendant la saisie */
'#acw .axres{position:sticky;top:calc(env(safe-area-inset-top,0px) + var(--axh,64px) + 4px);z-index:15;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:0 0 28px;padding:6px 0 10px;background:var(--bg)}',
'#acw .axb{min-width:0;border-radius:12px;padding:10px 14px;background:var(--alk)}',
'#acw .axb small{display:block;color:var(--mute);font-size:var(--fs-md)}',
'#acw .axb strong{font-size:1.45rem;font-weight:800;letter-spacing:-.02em;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}',
'#acw .axb.pos{background:color-mix(in srgb,var(--pos) 16%,var(--surface))}',
'#acw .axb.neg{background:color-mix(in srgb,var(--neg) 16%,var(--surface))}',
/* À gauche : Achat puis Revente ; à droite : Opérations enregistrées, de la hauteur des deux blocs réunis */
'#acw .axmain{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:28px;align-items:stretch;margin-bottom:28px}',
'#acw .axleft{display:flex;flex-direction:column;gap:28px;min-width:0}',
'#acw .axleft>section,#acw .axops{margin-bottom:0}',
'#acw .axops{position:relative;min-width:0;padding:0;min-height:320px}',
'#acw .axopi{position:absolute;inset:0;display:flex;flex-direction:column;padding:var(--sp,20px);overflow:hidden}',
'#acw .axopb{flex:1 1 auto;min-height:0;overflow:auto}',
'#acw .axoph{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px}',
'#acw .axoph h2{margin:0}',
'#acw .axoph select{height:40px;min-width:0;max-width:100%}',
/* champs alignés : toutes les cases d’une même ligne ont leur contrôle à la même hauteur */
'#acw .axg{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:12px;align-items:end}',
'#acw .axf{display:flex;flex-direction:column;justify-content:flex-end;gap:4px;min-width:0;font-size:var(--fs-sm);font-weight:600;color:var(--mute)}',
'#acw .axf>span{min-height:2.7em;display:flex;align-items:flex-end;line-height:1.25}',
'#acw .axin{width:100%;height:42px;font-size:var(--fs-lg);font-weight:700;text-align:right;background:var(--ain);border:2px solid var(--ainb);color:var(--ink)}',
'#acw .axin.alr{border-color:var(--neg);box-shadow:0 0 0 1px var(--neg)}',
'#acw .axin.lk{background:var(--alk);border:1px solid var(--line);cursor:not-allowed;user-select:none;-webkit-user-select:none}',
/* lignes de calcul : simple texte, sans fond ni curseur « interdit » */
'#acw .axd{margin:14px 0 0;display:grid;gap:4px}',
'#acw .axr{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:4px 0}',
'#acw .axr dt{color:var(--mute)}#acw .axr.tt dt{color:var(--ink);font-weight:600}',
'#acw .axr dd{margin:0;text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}',
'#acw .axr.tt dd{font-weight:700}',
'#acw .axtr{margin-left:6px;font-size:var(--fs-sm);font-weight:400;color:var(--mute)}',
'#acw .axs{display:flex;width:100%;align-self:stretch;border:1px solid var(--line);border-radius:var(--rb,8px);overflow:hidden}',
'#acw .axs button{flex:1 1 0;min-width:0;border:0;border-radius:0;height:42px;padding:0 4px}',
'#acw .axs button+button{border-left:1px solid var(--line)}',
'#acw .axs button[aria-pressed=true]{background:var(--accent);color:var(--onacc);font-weight:700}',
'#acw .axn{color:var(--neg);margin:10px 0 0;font-size:var(--fs-md)}',
'#acw .axsc .tg{color:var(--accent);font-weight:600;text-decoration:underline}',
'#acw .axdet{margin:0 0 28px}',
'#acw .axdet p{margin:8px 0 0}',
'#acw .axbar{display:flex;flex-wrap:wrap;gap:8px}',
'#acw .axfoot{justify-content:flex-end;margin-top:14px}',
'#acw .axtot{margin:12px 0 0}',
/* historique en tableau, détail du calcul dépliable */
'#acw .axh{width:100%}',
'#acw .axh tbody tr td{background:none}',
'#acw .axh tbody:nth-of-type(even) tr td{background:color-mix(in srgb,var(--mute) 8%,var(--surface))}',
'#acw .axh tr.axdt td{border-top:0;padding-top:0}',
'#acw .axh tr.axdt div{font-size:var(--fs-sm);color:var(--mute);line-height:1.5}',
'#acw .axh tr.axdt b{color:var(--ink)}',
'#acw .axh td.act{text-align:right;white-space:nowrap}',
'#acw .axh td.act button{width:34px;height:34px;padding:0;font-size:var(--fs-lg);line-height:1;color:var(--mute);background:transparent;border-color:transparent}',
'#acw .axh td.act button:hover{background:var(--surface);border-color:var(--line);color:var(--ink)}',
'#acw .axh td.act [data-ax-del]:hover{color:var(--neg);border-color:var(--neg)}',
'#acw .axt tbody tr td{background:none}',
'#acw .axt td{padding:4px 6px;vertical-align:middle}#acw .axt input{min-width:110px}',
'#acw .axt tr.axttf td{border-top:2px solid var(--line);font-weight:600}',
'@media(max-width:1100px){#acw .axhq,#acw .axhr{display:none}}',
'@media(max-width:760px){#acw .axres{gap:8px}#acw .axb{padding:8px 10px}#acw .axb small{font-size:var(--fs-sm)}#acw .axb strong{font-size:1.05rem}#acw .axbar button{flex:1 1 100%}}',
'@media(max-width:640px){#acw .axmain{grid-template-columns:1fr}#acw .axops{min-height:0}#acw .axopi{position:static;max-height:75vh}}'
].join("");

function html(){
  return '<div id="acw"><h2 class="vh">Calculatrice d’actions</h2>'
  +'<div class="axtop"><button type="button" id="ax_setb" aria-expanded="false" aria-controls="ax_set">⚙ Réglages</button></div>'
  +'<section id="ax_set" hidden><h2>Réglages des frais</h2>'
  +'<div class="tw2"><table class="lt axt"><thead><tr><th>Total de l’opération : de (€)</th><th>à (€)</th><th>Frais (€)</th><th></th></tr></thead><tbody id="ax_tb"></tbody></table></div>'
  +'<div class="axbar" style="margin-top:10px"><button type="button" id="ax_tadd">Ajouter une tranche</button><button type="button" id="ax_tdef">Valeurs d’origine</button></div>'
  +'<p class="axn" id="ax_ns" hidden></p></section>'
  +'<div class="axres" id="ax_res" role="group" aria-label="Résultat de la simulation">'
  +'<div class="axb" id="ax_bg"><small>Gain ou perte net</small><strong id="ax_g">–</strong></div>'
  +'<div class="axb" id="ax_bt"><small>Taux de rentabilité</small><strong id="ax_tx">–</strong></div>'
  +'<div class="axb"><small>Prix de vente à l’équilibre</small><strong id="ax_be">–</strong></div></div>'
  +'<div class="axmain"><div class="axleft">'
  +'<section><h2>Achat</h2><div class="axg">'
  +'<label class="axf"><span>Nombre d’actions</span><input class="axin" id="ax_q" inputmode="numeric" autocomplete="off" placeholder="0"></label>'
  +'<label class="axf"><span>Prix d’achat brut par action (€)</span><input class="axin" id="ax_pa" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<label class="axf"><span>Total de l’opération (€)</span><input class="axin lk" id="ax_tot" readonly tabindex="-1" aria-readonly="true"></label></div>'
  +'<dl class="axd"><div class="axr"><dt>Frais d’achat<span class="axtr" id="ax_fat"></span></dt><dd id="ax_fa">–</dd></div><div class="axr"><dt id="ax_ttl">TTF</dt><dd id="ax_tf">–</dd></div><div class="axr tt"><dt>Coût total de l’achat</dt><dd id="ax_ca">–</dd></div></dl>'
  +'<p class="axn" id="ax_na" hidden></p></section>'
  +'<section><h2>Revente</h2><div class="axg">'
  +'<label class="axf"><span>Prix de vente simulé par action (€)</span><input class="axin" id="ax_pv" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<div class="axf"><span id="ax_lp">Hausse sur le prix d’achat</span><div class="axs" role="group" aria-labelledby="ax_lp"><button type="button" data-ax-pct="5" aria-pressed="false">+5 %</button><button type="button" data-ax-pct="10" aria-pressed="true">+10 %</button><button type="button" data-ax-pct="20" aria-pressed="false">+20 %</button></div></div>'
  +'<div class="axf"><span id="ax_lj">Revente le jour même (pas de TTF)</span><div class="axs" role="group" aria-labelledby="ax_lj"><button type="button" id="ax_oui" aria-pressed="false">Oui</button><button type="button" id="ax_non" aria-pressed="true">Non</button></div></div></div>'
  +'<dl class="axd"><div class="axr"><dt>Total de vente brut</dt><dd id="ax_vb">–</dd></div><div class="axr"><dt>Frais de vente<span class="axtr" id="ax_fvt"></span></dt><dd id="ax_fv">–</dd></div><div class="axr tt"><dt>Net encaissé</dt><dd id="ax_net">–</dd></div></dl>'
  +'<p class="axn" id="ax_nv" hidden></p>'
  +'<h3>Scénarios de revente</h3><div class="tw2"><table class="lt axsc" aria-label="Scénarios de revente"><thead><tr><th>Hausse</th><th class="r">Prix de vente</th><th class="r">Gain net</th><th class="r">Rentabilité</th></tr></thead><tbody id="ax_sc"></tbody></table></div></section>'
  +'</div>'
  +'<section class="axops"><div class="axopi"><div class="axoph"><h2>Opérations enregistrées</h2>'
  +'<select id="ax_sort" aria-label="Trier ou filtrer les opérations"><option value="new">Plus récentes d’abord</option><option value="old">Plus anciennes d’abord</option><option value="gd">Gain décroissant</option><option value="ga">Gain croissant</option><option value="pos">Gains seulement</option><option value="neg">Pertes seulement</option></select></div>'
  +'<div class="axbar"><button type="button" class="primary" id="ax_save">Enregistrer cette opération</button></div>'
  +'<p class="axn" id="ax_nh" hidden></p><p class="sub axtot" id="ax_sum"></p>'
  +'<div class="axopb"><div id="ax_hl"></div>'
  +'<div class="axbar axfoot" id="ax_foot" hidden><button type="button" class="danger" id="ax_clear">Tout effacer</button></div>'
  +'<p class="sub" style="margin:12px 0 0">Les montants sont affichés avec 2 décimales ; les calculs conservent la valeur exacte. Vos saisies sont rappelées à la prochaine ouverture. L’historique (30 opérations maximum) fait partie de vos données : il est inclus dans la sauvegarde et dans le fichier partagé.</p></div></div></section>'
  +'</div>'
  +'<details class="axdet"><summary>ⓘ Comment c’est calculé</summary><p class="sub" id="ax_hint"></p></details></div>'
}

function scen(o){
  var sc=$("ax_sc");
  if(!(o.q>0&&o.pa>0)){sc.innerHTML='<tr><td colspan="4" class="sub">Renseignez le nombre d’actions et le prix d’achat pour voir les scénarios.</td></tr>';return}
  sc.innerHTML=[1,2,3].map(function(i){var p=window.tset?tset("act","h"+i,[5,10,20][i-1]):[5,10,20][i-1];
    var pv=pvOf(o.pa,p),x=res({q:o.q,pa:o.pa,pv:pv,j:o.j}),c=cl(x.g);
    return'<tr><td><button type="button" class="tg" data-ax-pct="'+p+'" title="Utiliser ce prix de vente">+'+p+' %</button></td><td class="r">'+eur2(pv)+'</td><td class="r '+c+'">'+(x.g>0?"+":"")+eur2(x.g)+'</td><td class="r '+c+'">'+pct(x.taux)+'</td></tr>'
  }).join("");
}
function calc(){
  var o=cur(),r=res(o),ta=trTxt(r.tot),tv=trTxt(r.vb);
  $("ax_ttl").textContent="TTF "+ttfTxt();$("ax_hint").textContent=hint();
  $("ax_fat").textContent=r.tot>0&&ta?"· "+ta:"";
  $("ax_fa").textContent=r.tot>0?eur2(r.fa):"–";
  $("ax_tf").textContent=r.tot>0?(J?"Non applicable (même jour)":eur2(r.ta)):"–";
  $("ax_ca").textContent=r.tot>0?eur2(r.ca):"–";
  note("ax_na",msg(r.tot));
  $("ax_vb").textContent=r.vb>0?eur2(r.vb):"–";
  $("ax_fvt").textContent=r.vb>0&&tv?"· "+tv:"";
  $("ax_fv").textContent=r.vb>0?eur2(r.fv):"–";
  $("ax_net").textContent=r.vb>0?eur2(r.net):"–";
  note("ax_nv",msg(r.vb));
  var ok=r.tot>0&&r.vb>0,c=ok?cl(r.g):"";
  $("ax_tx").textContent=ok?pct(r.taux):"–";
  $("ax_g").textContent=ok?(r.g>0?"+":"")+eur2(r.g):"–";
  $("ax_be").textContent=r.be!==null?eur2(Math.ceil(r.be*100)/100):"–";
  $("ax_bg").className="axb "+c;$("ax_bt").className="axb "+c;
  document.querySelectorAll("#acw .axs [data-ax-pct]").forEach(function(b){b.setAttribute("aria-pressed",String(!MAN&&PCT===+b.getAttribute("data-ax-pct")))});
  scen(o);
}
function majTotal(){
  var t=pn("ax_q")*pn("ax_pa");$("ax_tot").value=t?t.toFixed(2).replace(".",","):"";
  if(!MAN){var d=pvOf(pn("ax_pa"),PCT);$("ax_pv").value=d?d.toFixed(2).replace(".",","):""}
  calc();
}
function setJ(v){J=v;$("ax_oui").setAttribute("aria-pressed",String(v));$("ax_non").setAttribute("aria-pressed",String(!v));calc()}
function setPct(p){PCT=p;MAN=false;majTotal();saveLast()}
function saveLast(){A().last=cur();save()}
function setTop(){var h=document.querySelector("header"),w=$("acw");if(h&&w)w.style.setProperty("--axh",h.offsetHeight+"px")}
function hist(){
  var H=A().hist,hl=$("ax_hl");
  $("ax_foot").hidden=!H.length;
  if(!H.length){$("ax_sum").textContent="";hl.innerHTML='<p class="sub">Aucune opération enregistrée pour l’instant.</p>';return}
  var g=function(o){return(o.r||res(o)).g},L=H.slice();
  if(SORT==="old")L.reverse();
  else if(SORT==="gd")L.sort(function(a,b){return g(b)-g(a)});
  else if(SORT==="ga")L.sort(function(a,b){return g(a)-g(b)});
  else if(SORT==="pos")L=L.filter(function(o){return g(o)>0});
  else if(SORT==="neg")L=L.filter(function(o){return g(o)<0});
  var tot=Math.round(L.reduce(function(s,o){return s+g(o)},0)*1e8)/1e8;
  $("ax_sum").innerHTML='<b>'+L.length+'</b>'+(L.length<H.length?' sur '+H.length:'')+' opération(s) · gain cumulé <b class="'+cl(tot)+'">'+(tot>0?"+":"")+eur2(tot)+'</b>';
  if(!L.length){hl.innerHTML='<p class="sub">Aucune opération ne correspond à ce filtre.</p>';return}
  hl.innerHTML='<div class="tw2"><table class="lt axh" aria-label="Opérations enregistrées"><thead><tr><th>Date</th><th class="r axhq">Qté</th><th class="r">Achat</th><th class="r">Vente</th><th class="r">Gain</th><th class="r axhr">Rentabilité</th><th><span class="vh">Actions</span></th></tr></thead>'
  +L.map(function(o){
    var r=o.r||res(o),c=cl(r.g),op=!!EXP[o.id],d=new Date(o.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    /* Opérations enregistrées avant ce changement (TTF sur la vente) : affichage d'origine conservé */
    var nw=r.ta!==undefined;
    var achat=nw?'Achat : '+eur2(r.tot)+' + frais '+eur2(r.fa)+' + TTF '+eur2(r.ta)+' = <b>'+eur2(r.ca)+'</b>':'Achat : '+eur2(r.tot)+' + frais '+eur2(r.fa)+' = <b>'+eur2(r.ca)+'</b>';
    var vente=nw?'Vente : '+eur2(r.vb)+' − frais '+eur2(r.fv)+' = <b>'+eur2(r.net)+'</b>':'Vente : '+eur2(r.vb)+' − frais '+eur2(r.fv)+' − TTF '+eur2(r.t)+' = <b>'+eur2(r.net)+'</b>';
    return'<tbody><tr><td><button type="button" class="tg" data-ax-tg="'+o.id+'" aria-expanded="'+op+'" aria-label="Afficher le détail du calcul">'+(op?"▾":"▸")+'</button>'+d+(o.j?' <span class="sub">· même jour</span>':'')+'</td>'
      +'<td class="r axhq">'+o.q+'</td><td class="r">'+eur2(o.pa)+'</td><td class="r">'+eur2(o.pv)+'</td>'
      +'<td class="r '+c+'"><b>'+(r.g>0?"+":"")+eur2(r.g)+'</b></td><td class="r axhr '+c+'">'+pct(r.taux)+'</td>'
      +'<td class="act"><button type="button" data-ax-load="'+o.id+'" aria-label="Recharger dans le calculateur" title="Recharger dans le calculateur">↺</button><button type="button" data-ax-del="'+o.id+'" aria-label="Supprimer" title="Supprimer">✕</button></td></tr>'
      +'<tr class="axdt"'+(op?'':' hidden')+'><td colspan="7"><div>'+o.q+' action(s) · achat '+eur2(o.pa)+' · vente '+eur2(o.pv)+'</div><div>'+achat+'</div><div>'+vente+'</div><div>Rentabilité <b>'+pct(r.taux)+'</b> · revente le jour même : '+(o.j?"oui":"non")+'</div></td></tr></tbody>'
  }).join("")+'</table></div>';
}
function tierRows(){
  var rows=cfg().tiers.map(function(t,i){
    var inp=function(k,v,l){return'<td><input class="axin" data-ax-t="'+i+':'+k+'" inputmode="decimal" autocomplete="off" value="'+ns(v)+'" aria-label="Tranche '+(i+1)+' : '+l+'"></td>'};
    return'<tr data-ax-r="'+i+'">'+inp("min",t.min,"de (€)")+inp("max",t.max,"à (€)")+inp("fee",t.fee,"frais (€)")+'<td><button type="button" data-ax-tdel="'+i+'" aria-label="Supprimer la tranche '+(i+1)+'">✕</button></td></tr>'
      +'<tr class="axerr" data-ax-e="'+i+'" hidden><td colspan="4" class="warn" role="alert"></td></tr>'
  }).join("")||'<tr><td colspan="4" class="sub">Aucune tranche : aucun frais n’est appliqué.</td></tr>';
  /* la TTF fait partie du tableau des frais */
  rows+='<tr class="axttf"><td colspan="2">TTF sur l’achat (en %), sauf revente le jour même</td><td><input class="axin" id="ax_ttf" inputmode="decimal" autocomplete="off" value="'+ns(cfg().ttf*100)+'" aria-label="TTF en pourcentage"></td><td></td></tr>';
  $("ax_tb").innerHTML=rows;
}
/* Lecture des tranches saisies, avec le message d'erreur de chaque ligne fautive */
function collect(){
  var out=[],errs={},n=0;
  document.querySelectorAll("#ax_tb tr[data-ax-r]").forEach(function(tr,i){
    var v=[].map.call(tr.querySelectorAll("input"),function(x){return parse(x.value)});
    if(v.some(function(x){return !isFinite(x)||x<0})){errs[i]="Saisissez des nombres positifs dans les trois champs.";n++}
    else if(v[0]>=v[1]){errs[i]="Le montant « de » doit être inférieur au montant « à ».";n++}
    else out.push({min:v[0],max:v[1],fee:v[2]});
  });
  return{out:out,errs:errs,n:n}
}
function showErrs(errs){
  document.querySelectorAll("#ax_tb tr[data-ax-r]").forEach(function(tr,i){
    var m=errs[i],e=document.querySelector('#ax_tb tr[data-ax-e="'+i+'"]');
    tr.querySelectorAll("input").forEach(function(x){x.classList.toggle("alr",!!m);if(m)x.setAttribute("aria-invalid","true");else x.removeAttribute("aria-invalid")});
    if(e){e.hidden=!m;e.firstChild.textContent=m||""}
  });
}
function tiersChanged(){
  var c=collect();showErrs(c.errs);
  if(c.n){note("ax_ns","Les changements ne sont pas enregistrés tant que les lignes en rouge ne sont pas corrigées.");return}
  var s=c.out.slice().sort(function(a,b){return a.min-b.min}),reord=JSON.stringify(s)!==JSON.stringify(c.out);
  cfg().tiers=s;save();calc();if(reord)tierRows();
  var ov=false;for(var i=1;i<s.length;i++)if(s[i].min<s[i-1].max)ov=true;
  note("ax_ns",ov?"Attention : certaines tranches se chevauchent. La tranche la plus basse correspondante s’applique.":"")
}
function render(){
  if(!$("axsty")){var s=document.createElement("style");s.id="axsty";s.textContent=CSS;document.head.appendChild(s)}
  $("app").innerHTML=html();setTop();
  $("ax_set").hidden=!SETO;$("ax_setb").setAttribute("aria-expanded",String(SETO));tierRows();
  $("ax_sort").value=SORT;
  var L=A().last;J=false;MAN=false;PCT=window.tset?tset("act","h2",10):10;
  if(L){$("ax_q").value=L.q?ns(L.q):"";$("ax_pa").value=L.pa?ns(L.pa):"";MAN=!!L.man;if(L.pct>0)PCT=L.pct;if(MAN)$("ax_pv").value=L.pv?ns(L.pv):"";J=!!L.j}
  $("ax_oui").setAttribute("aria-pressed",String(J));$("ax_non").setAttribute("aria-pressed",String(!J));
  majTotal();hist();
  /* curseur dans « Nombre d’actions » sur ordinateur (pas sur téléphone : le clavier s’ouvrirait) */
  if(matchMedia("(pointer:fine)").matches)setTimeout(function(){var q=$("ax_q");if(q&&T==="act")q.focus()},0);
}
function saveOp(){
  var o=cur();
  if(!(o.q>0&&o.pa>0&&o.pv>0)){note("ax_nh","Renseignez le nombre d’actions, le prix d’achat et le prix de vente avant d’enregistrer.");return}
  note("ax_nh","");var sn=snap(),a=A();
  o.r=res(o);o.id=uid();o.at=Date.now();a.hist.unshift(o);a.hist=a.hist.slice(0,+(window.tset?tset("act","max",30):30));save();hist();
  toast("Opération enregistrée",undoTo(sn));
}

var nav=$("tabs");
if(nav&&!nav.querySelector('[data-tab="act"]')){
  var b=document.createElement("button");b.setAttribute("data-tab","act");b.textContent="Actions";
  nav.insertBefore(b,nav.querySelector('[data-tab="sav"]'));
}
var origDraw=draw;
window.draw=draw=function(){
  origDraw();
  if(T!=="act")return;
  render();
  document.title="Actions — Mes comptes et budget";
  document.querySelector("main").classList.add("narrow");
  setTimeout(function(){var sr=$("sr");if(sr&&T==="act")sr.textContent="Onglet Actions"},120);
};
addEventListener("resize",function(){if(T==="act")setTop()});

function inAct(e){return e.target&&e.target.closest&&e.target.closest("#acw")}
document.addEventListener("input",function(e){
  if(!inAct(e))return;
  var id=e.target.id;
  if(id==="ax_pv"){MAN=true;calc()}else if(id==="ax_q"||id==="ax_pa")majTotal();else return;
  saveLast();
});
document.addEventListener("keydown",function(e){
  if(e.key!=="Enter"||!inAct(e)||!/^ax_(q|pa|pv)$/.test(e.target.id))return;
  e.preventDefault();saveOp();
});
document.addEventListener("change",function(e){
  if(!inAct(e))return;
  var t=e.target;
  if(t.id==="ax_sort"){SORT=t.value;hist()}
  else if(t.hasAttribute&&t.hasAttribute("data-ax-t"))tiersChanged();
  else if(t.id==="ax_ttf"){
    var v=parse(t.value);
    if(!isFinite(v)||v<0||v>100){note("ax_ns","La TTF doit être un pourcentage entre 0 et 100.");return}
    cfg().ttf=v/100;save();calc();note("ax_ns","");
  }
});
document.addEventListener("click",function(e){
  if(!inAct(e))return;
  var t=e.target.closest("button");if(!t)return;
  if(t.id==="ax_oui"){setJ(true);saveLast()}
  else if(t.id==="ax_non"){setJ(false);saveLast()}
  else if(t.hasAttribute("data-ax-pct")){setPct(+t.getAttribute("data-ax-pct"))}
  else if(t.id==="ax_setb"){SETO=!SETO;$("ax_set").hidden=!SETO;t.setAttribute("aria-expanded",String(SETO))}
  else if(t.id==="ax_tadd"){var T2=cfg().tiers,hi=T2.length?Math.max.apply(null,T2.map(function(x){return x.max})):0;T2.push({min:hi,max:hi+1000,fee:0});save();tierRows();calc();note("ax_ns","")}
  else if(t.hasAttribute("data-ax-tdel")){cfg().tiers.splice(+t.getAttribute("data-ax-tdel"),1);save();tierRows();calc();note("ax_ns","")}
  else if(t.id==="ax_tdef"){
    ask("Rétablir les tranches de frais et la TTF d’origine (500–1 000 € : 1,90 € · 1 000–2 000 € : 2,90 € · 2 000–4 000 € : 3,80 € · TTF 0,40 %) ?","Remplacer").then(function(ok){
      if(!ok)return;S.actions.cfg=null;cfg();save();tierRows();calc();note("ax_ns","")
    });
  }
  else if(t.id==="ax_save"){saveOp()}
  else if(t.hasAttribute("data-ax-tg")){
    var id=t.getAttribute("data-ax-tg"),row=t.closest("tbody").querySelector(".axdt"),ouv=row.hidden;
    row.hidden=!ouv;t.setAttribute("aria-expanded",String(ouv));t.textContent=ouv?"▾":"▸";
    if(ouv)EXP[id]=1;else delete EXP[id];
  }
  else if(t.hasAttribute("data-ax-load")){
    var h=A().hist.filter(function(x){return x.id===t.getAttribute("data-ax-load")})[0];if(!h)return;
    $("ax_q").value=ns(h.q);$("ax_pa").value=String(h.pa).replace(".",",");$("ax_pv").value=String(h.pv).replace(".",",");MAN=true;setJ(!!h.j);majTotal();saveLast();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  else if(t.hasAttribute("data-ax-del")){
    var sn2=snap(),id2=t.getAttribute("data-ax-del");A().hist=A().hist.filter(function(x){return x.id!==id2});delete EXP[id2];save();hist();
    toast("Opération supprimée",undoTo(sn2));
  }
  else if(t.id==="ax_clear"){
    if(!A().hist.length)return;
    ask("Effacer toutes les opérations enregistrées dans l’onglet Actions ?","Effacer").then(function(ok){
      if(!ok)return;var sn3=snap();A().hist=[];EXP={};save();hist();toast("Historique effacé",undoTo(sn3));
    });
  }
});
})();
