/* Onglet « Actions » : calculatrice d’achat et de revente d’actions.
   À charger APRÈS le script principal : <script src="actions.js"></script> juste avant </body>.
   Les données sont rangées dans S.actions : sauvegarde, fichier partagé et annulation incluses. */
(function(){
"use strict";
var J=false,MAN=false,SETO=false;
var DEF=[{min:500,max:1000,fee:1.9},{min:1000,max:2000,fee:2.9},{min:2000,max:4000,fee:3.8}];
var $=function(i){return document.getElementById(i)};
function A(){if(!S.actions||!Array.isArray(S.actions.hist))S.actions={hist:[],last:null,cfg:null};return S.actions}
function cfg(){var a=A();if(!a.cfg||!Array.isArray(a.cfg.tiers)||!(a.cfg.ttf>=0))a.cfg={tiers:DEF.map(function(t){return{min:t.min,max:t.max,fee:t.fee}}),ttf:0.004};return a.cfg}
function parse(s){s=String(s).replace(/\s/g,"").replace(",",".");return s===""?NaN:parseFloat(s)}
function pn(id){var v=parse($(id).value);return isFinite(v)&&v>=0?v:0}
function ns(v){return String(Math.round(v*10000)/10000).replace(".",",")}
function sorted(c){return c.tiers.slice().sort(function(a,b){return a.min-b.min})}
function fee(m,c){c=c||cfg();var T=sorted(c);for(var i=0;i<T.length;i++){if(m>=T[i].min&&m<=T[i].max)return T[i].fee}return null}
/* Montant exact : aucun arrondi à 2 décimales (seules les erreurs de calcul informatique au-delà de 8 décimales sont éliminées) */
function ex(n){
  var s=(Math.round(n*1e8)/1e8).toFixed(8).replace(/0+$/,""),neg=s.charAt(0)==="-";if(neg)s=s.slice(1);
  var d=s.split("."),dec=d[1]||"";while(dec.length<2)dec+="0";
  return(neg?"−":"")+d[0].replace(/\B(?=(\d{3})+(?!\d))/g,"\u202f")+","+dec+"\u00a0€"
}
/* TTF : calculée à l'achat, uniquement sur le montant total de l'achat (hors frais).
   Elle s'ajoute au coût de l'achat, sauf si la vente a lieu le même jour. Aucune TTF sur la vente. */
function res(o,c){
  c=c||cfg();
  var tot=o.q*o.pa,fa=fee(tot,c)||0,ta=o.j?0:tot*c.ttf,ca=tot+fa+ta,vb=o.q*o.pv,fv=fee(vb,c)||0,net=vb-fv,g=net-ca,be=null;
  if(o.q>0&&tot>0){
    var cand=[0];c.tiers.forEach(function(x){if(cand.indexOf(x.fee)<0)cand.push(x.fee)});
    cand.forEach(function(fx){var p=(ca+fx)/o.q,m=p*o.q,fm=fee(m,c),ok=fx===0?(fm===null||fm===0):fm===fx;if(ok&&(be===null||p<be))be=p});
  }
  return{tot:tot,fa:fa,ta:ta,t:ta,ca:ca,vb:vb,fv:fv,net:net,g:g,taux:ca?g/ca*100:0,be:be}
}
function cur(){return{q:pn("ax_q"),pa:pn("ax_pa"),pv:pn("ax_pv"),j:J,man:MAN}}
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
  return"Frais par tranche du total de l’opération ("+tr+"). TTF de "+ttfTxt()+" calculée à l’achat sur le montant total de l’achat, hors frais, et ajoutée au coût de l’achat si la vente n’a pas lieu le même jour. Taux de rentabilité = gain net ÷ coût total de l’achat."
}
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
+'#acw .axh .d{font-size:var(--fs-sm);color:var(--mute);font-variant-numeric:tabular-nums}#acw .axh .d b{color:var(--ink)}'
+'#acw .axh .ac{display:flex;gap:6px}#acw .axh .ac button{padding:3px 10px;font-size:var(--fs-sm)}'
+'#acw .axbar{display:flex;flex-wrap:wrap;gap:8px}'
+'#acw .axt td{padding:4px 6px;vertical-align:middle}#acw .axt input{min-width:110px}';

function html(){
  return '<div id="acw"><h2 class="vh">Calculatrice d’actions</h2>'
  +'<div class="axbar" style="justify-content:flex-end;margin-bottom:12px"><button type="button" id="ax_setb" aria-expanded="false" aria-controls="ax_set">⚙ Réglages</button></div>'
  +'<section id="ax_set" hidden><h2>Réglages des frais</h2>'
  +'<p class="sub">Modifiez les tranches de frais et la TTF en cas de changement d’opérateur. Les mêmes frais s’appliquent à l’achat et à la revente, selon le total de l’opération. Si deux tranches se touchent à la même valeur, la tranche la plus basse s’applique. Les opérations déjà enregistrées conservent leurs montants d’origine.</p>'
  +'<div class="tw2"><table class="lt axt"><thead><tr><th>Total de l’opération : de (€)</th><th>à (€)</th><th>Frais (€)</th><th></th></tr></thead><tbody id="ax_tb"></tbody></table></div>'
  +'<div class="axbar" style="margin-top:10px"><button type="button" id="ax_tadd">Ajouter une tranche</button><button type="button" id="ax_tdef">Valeurs d’origine</button></div>'
  +'<div class="axg" style="margin-top:14px"><label class="axf"><span>TTF (en %) sur l’achat, si la vente n’a pas lieu le même jour</span><input class="axin" id="ax_ttf" inputmode="decimal" autocomplete="off"></label></div>'
  +'<p class="axn" id="ax_ns" hidden></p></section>'
  +'<section><h2>Achat</h2><div class="axg">'
  +'<label class="axf"><span>Nombre d’actions</span><input class="axin" id="ax_q" inputmode="numeric" autocomplete="off" placeholder="0"></label>'
  +'<label class="axf"><span>Prix d’achat brut par action (€)</span><input class="axin" id="ax_pa" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<label class="axf"><span>Total de l’opération (€)</span><input class="axin lk" id="ax_tot" readonly tabindex="-1" aria-readonly="true"></label></div>'
  +'<dl class="axd"><div class="axr"><dt>Frais d’achat</dt><dd id="ax_fa">–</dd></div><div class="axr"><dt id="ax_ttl">TTF</dt><dd id="ax_tf">–</dd></div><div class="axr tt"><dt>Coût total de l’achat</dt><dd id="ax_ca">–</dd></div></dl>'
  +'<p class="axn" id="ax_na" hidden></p></section>'
  +'<section><h2>Revente</h2><div class="axg">'
  +'<label class="axf"><span>Prix de vente simulé par action (€), par défaut achat + 10 %</span><input class="axin" id="ax_pv" inputmode="decimal" autocomplete="off" placeholder="0,00"></label>'
  +'<div class="axf"><span id="ax_lj">Sortie le même jour</span><div class="axs" role="group" aria-labelledby="ax_lj"><button type="button" id="ax_oui" aria-pressed="false">Oui</button><button type="button" id="ax_non" aria-pressed="true">Non</button></div></div></div>'
  +'<dl class="axd"><div class="axr"><dt>Total de vente brut</dt><dd id="ax_vb">–</dd></div><div class="axr"><dt>Frais de vente</dt><dd id="ax_fv">–</dd></div><div class="axr tt"><dt>Net encaissé</dt><dd id="ax_net">–</dd></div></dl>'
  +'<p class="axn" id="ax_nv" hidden></p>'
  +'<div class="axk"><div class="axb"><small>Taux de rentabilité</small><strong id="ax_tx">–</strong></div><div class="axb"><small>Gain ou perte net</small><strong id="ax_g">–</strong></div><div class="axb"><small>Prix de vente à l’équilibre</small><strong id="ax_be">–</strong></div></div>'
  +'<p class="sub" id="ax_hint" style="margin:14px 0 0"></p></section>'
  +'<section><h2>Opérations enregistrées</h2><div class="axbar"><button type="button" class="primary" id="ax_save">Enregistrer cette opération</button><button type="button" id="ax_clear">Tout effacer</button></div>'
  +'<p class="axn" id="ax_nh" hidden></p><ul class="axh" id="ax_hist"></ul>'
  +'<p class="sub" style="margin:12px 0 0">Les montants enregistrés sont exacts, sans arrondi. Vos saisies sont rappelées à la prochaine ouverture. L’historique (30 opérations maximum) fait partie de vos données : il est inclus dans la sauvegarde et dans le fichier partagé.</p></section></div>'
}

function calc(){
  var o=cur(),r=res(o);
  $("ax_ttl").textContent="TTF "+ttfTxt();$("ax_hint").textContent=hint();
  $("ax_fa").textContent=r.tot>0?eur2(r.fa):"–";
  $("ax_tf").textContent=r.tot>0?(J?"Non applicable (même jour)":eur2(r.ta)):"–";
  $("ax_ca").textContent=r.tot>0?eur2(r.ca):"–";
  note("ax_na",msg(r.tot));
  $("ax_vb").textContent=r.vb>0?eur2(r.vb):"–";
  $("ax_fv").textContent=r.vb>0?eur2(r.fv):"–";
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
    var r=o.r||res(o),c=cl(r.g),d=new Date(o.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
    /* Opérations enregistrées avant ce changement (TTF sur la vente) : affichage d'origine conservé */
    var nw=r.ta!==undefined;
    var achat=nw?'Achat : '+ex(r.tot)+' + frais '+ex(r.fa)+' + TTF '+ex(r.ta)+' = <b>'+ex(r.ca)+'</b>':'Achat : '+ex(r.tot)+' + frais '+ex(r.fa)+' = <b>'+ex(r.ca)+'</b>';
    var vente=nw?'Vente : '+ex(r.vb)+' − frais '+ex(r.fv)+' = <b>'+ex(r.net)+'</b>':'Vente : '+ex(r.vb)+' − frais '+ex(r.fv)+' − TTF '+ex(r.t)+' = <b>'+ex(r.net)+'</b>';
    return '<li><div style="flex:1 1 320px"><div class="d">'+d+' · même jour : '+(o.j?"oui":"non")+'</div>'
      +'<div><b>'+o.q+'</b> action(s) · achat à '+ex(o.pa)+' · vente à '+ex(o.pv)+'</div>'
      +'<div class="d">'+achat+'</div>'
      +'<div class="d">'+vente+'</div>'
      +'<div class="'+c+'">Gain ou perte : <b>'+(r.g>0?"+":"")+ex(r.g)+'</b> · rentabilité <b>'+pct(r.taux)+'</b></div></div>'
      +'<div class="ac"><button type="button" data-ax-load="'+o.id+'">Recharger</button><button type="button" data-ax-del="'+o.id+'">Supprimer</button></div></li>'
  }).join("");
}
function tierRows(){
  $("ax_tb").innerHTML=cfg().tiers.map(function(t,i){
    var inp=function(k,v,l){return'<td><input class="axin" data-ax-t="'+i+':'+k+'" inputmode="decimal" autocomplete="off" value="'+ns(v)+'" aria-label="Tranche '+(i+1)+' : '+l+'"></td>'};
    return'<tr>'+inp("min",t.min,"de (€)")+inp("max",t.max,"à (€)")+inp("fee",t.fee,"frais (€)")+'<td><button type="button" data-ax-tdel="'+i+'" aria-label="Supprimer la tranche '+(i+1)+'">✕</button></td></tr>'
  }).join("")||'<tr><td colspan="4" class="sub">Aucune tranche : aucun frais n’est appliqué.</td></tr>';
  $("ax_ttf").value=ns(cfg().ttf*100);
}
function collect(){
  var out=[],bad=false;
  document.querySelectorAll("#ax_tb tr").forEach(function(tr){
    var inp=tr.querySelectorAll("input");if(!inp.length)return;
    var v=[].map.call(inp,function(i){return parse(i.value)});
    if(v.some(function(x){return !isFinite(x)||x<0})||v[0]>=v[1])bad=true;else out.push({min:v[0],max:v[1],fee:v[2]})
  });
  return bad?null:out
}
function tiersChanged(){
  var out=collect();
  if(!out){note("ax_ns","Vérifiez les tranches : chaque ligne doit avoir un montant « de » inférieur au montant « à », et des valeurs positives. Les changements ne sont pas enregistrés tant que ce n’est pas corrigé.");return}
  cfg().tiers=out;save();calc();
  var s=sorted(cfg()),ov=false;for(var i=1;i<s.length;i++)if(s[i].min<s[i-1].max)ov=true;
  note("ax_ns",ov?"Attention : certaines tranches se chevauchent. La tranche la plus basse correspondante s’applique.":"")
}
function render(){
  if(!$("axsty")){var s=document.createElement("style");s.id="axsty";s.textContent=CSS;document.head.appendChild(s)}
  $("app").innerHTML=html();
  $("ax_set").hidden=!SETO;$("ax_setb").setAttribute("aria-expanded",String(SETO));tierRows();
  var L=A().last;J=false;MAN=false;
  if(L){$("ax_q").value=L.q?ns(L.q):"";$("ax_pa").value=L.pa?ns(L.pa):"";MAN=!!L.man;if(MAN)$("ax_pv").value=L.pv?ns(L.pv):"";J=!!L.j}
  $("ax_oui").setAttribute("aria-pressed",String(J));$("ax_non").setAttribute("aria-pressed",String(!J));
  majTotal();hist();
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

function inAct(e){return e.target&&e.target.closest&&e.target.closest("#acw")}
document.addEventListener("input",function(e){
  if(!inAct(e))return;
  var id=e.target.id;
  if(id==="ax_pv"){MAN=true;calc()}else if(id==="ax_q"||id==="ax_pa")majTotal();else return;
  saveLast();
});
document.addEventListener("change",function(e){
  if(!inAct(e))return;
  var t=e.target;
  if(t.hasAttribute&&t.hasAttribute("data-ax-t"))tiersChanged();
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
  else if(t.id==="ax_setb"){SETO=!SETO;$("ax_set").hidden=!SETO;t.setAttribute("aria-expanded",String(SETO))}
  else if(t.id==="ax_tadd"){var T2=cfg().tiers,hi=T2.length?Math.max.apply(null,T2.map(function(x){return x.max})):0;T2.push({min:hi,max:hi+1000,fee:0});save();tierRows();calc();note("ax_ns","")}
  else if(t.hasAttribute("data-ax-tdel")){cfg().tiers.splice(+t.getAttribute("data-ax-tdel"),1);save();tierRows();calc();note("ax_ns","")}
  else if(t.id==="ax_tdef"){
    ask("Rétablir les tranches de frais et la TTF d’origine (500–1 000 € : 1,90 € · 1 000–2 000 € : 2,90 € · 2 000–4 000 € : 3,80 € · TTF 0,40 %) ?","Remplacer").then(function(ok){
      if(!ok)return;S.actions.cfg=null;cfg();save();tierRows();calc();note("ax_ns","")
    });
  }
  else if(t.id==="ax_save"){
    var o=cur();
    if(!(o.q>0&&o.pa>0&&o.pv>0)){note("ax_nh","Renseignez le nombre d’actions, le prix d’achat et le prix de vente avant d’enregistrer.");return}
    note("ax_nh","");var sn=snap(),a=A();
    o.r=res(o);o.id=uid();o.at=Date.now();a.hist.unshift(o);a.hist=a.hist.slice(0,30);save();hist();
    toast("Opération enregistrée",undoTo(sn));
  }
  else if(t.hasAttribute("data-ax-load")){
    var h=A().hist.filter(function(x){return x.id===t.getAttribute("data-ax-load")})[0];if(!h)return;
    $("ax_q").value=ns(h.q);$("ax_pa").value=String(h.pa).replace(".",",");$("ax_pv").value=String(h.pv).replace(".",",");MAN=true;setJ(!!h.j);majTotal();saveLast();
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
