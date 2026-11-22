/* synthese_plus.js (v5)
   À charger APRÈS budget_plus.js, tout à la fin de index.html :
   <script src="synthese_plus.js"></script>
   Pour annuler : retirer cette ligne.

   Contenu :
   - « Classement par tiers » : menu déroulant, fermé à l'ouverture, ouvert/fermé au clic.
   - Points 1 à 3 : libellés explicatifs, prévu en bleu / réel en violet, trait de séparation.
   - Point 4 : ⚠ + fond discret quand le solde cumulé est négatif.
   - Point 5 : ▲ / ▼ devant chaque écart (▲ favorable, ▼ défavorable).
   - Point 6 : mois terminés = réel, mois à venir = prévu (mois repliés), avec repère « réel / prévu ».
   - Point 7 : mini-courbe du solde cumulé au-dessus du tableau.
   - Point 8 : deux colonnes après le cumul annuel : « Moy. / mois » (réel ÷ mois écoulés)
               et « Reste » (budget annuel − réel à ce jour).
   - Point 9 : synthèse (Total revenus, Total dépenses, Solde du mois, Report, Solde cumulé)
               épinglée en bas de l'écran, avec une case pour l'activer / la désactiver.
   - Point 10 : « Classement par tiers » limité aux 10 premiers, bouton « Voir tout »,
                et % de chaque tiers sur le total des dépenses.
*/
(function () {
  "use strict";
  if (typeof window.drawBud !== "function") return;

  var localCT = true; /* utilisé seulement si index.html ne définit pas déjà CT */
  var timer = null, rtimer = null;
  var LIM = 10;          /* point 10 : nombre de tiers visibles par défaut */
  var showAll = false;   /* point 10 : « Voir tout » */
  var pinOn = true;      /* point 9 : synthèse épinglée */
  try {
    var sv = window.localStorage.getItem("synthesePlusPin");
    if (sv !== null) pinOn = (sv === "1");
  } catch (e0) { /* stockage indisponible : on garde la valeur par défaut */ }

  function closed() { return (typeof CT !== "undefined") ? CT : localCT; }
  function toggle() {
    if (typeof CT !== "undefined") { CT = !CT; return true; }
    localCT = !localCT; return false;
  }
  function safe(name, fn) {
    try { fn(); } catch (e) { console.warn("synthese_plus.js : " + name, e); }
  }

  /* ---------- Style ---------- */
  var st = document.createElement("style");
  st.id = "synthese-plus-css";
  st.textContent =
    /* couleurs prévu / réel */
    '#bt td[data-sp="bl"]{color:var(--bl)!important}' +
    '#bt td[data-sp="neg"]{color:var(--neg)!important}' +
    '#bt td[data-sp="re"]{color:var(--reel)!important;font-style:italic}' +
    '#bt td[data-sp="re"][data-sn]{color:var(--neg)!important}' +
    /* point 3 : séparation */
    "#bt tbody tr.grp td{border-top:2px solid color-mix(in srgb,var(--mute) 45%,var(--surface))!important}" +
    "#bt td.nm .sh{margin-left:6px;font-weight:400;color:var(--mute);font-size:var(--fs-sm)}" +
    /* point 4 : alerte solde négatif */
    '#bt td[data-al]::before{content:"\\26A0\\00a0";color:var(--neg)}' +
    "#bt td[data-al]{background-image:linear-gradient(color-mix(in srgb,var(--neg) 16%,transparent),color-mix(in srgb,var(--neg) 16%,transparent))!important}" +
    /* point 5 : symboles sur les écarts */
    '#bt td[data-es="u"]::before{content:"\\25B2\\00a0";color:var(--pos);font-size:.8em}' +
    '#bt td[data-es="d"]::before{content:"\\25BC\\00a0";color:var(--neg);font-size:.8em}' +
    /* point 6 : repère réel / prévu */
    "#bt td[data-pm]::after{margin-left:4px;font-size:.68em;font-weight:400;font-style:normal;color:var(--mute)}" +
    '#bt td[data-pm="r"]::after{content:"r\\00e9el"}' +
    '#bt td[data-pm="p"]::after{content:"pr\\00e9vu"}' +
    /* point 7 : mini-courbe */
    "#spk{display:flex;gap:16px;align-items:center;flex-wrap:wrap;width:95vw;max-width:95vw;margin:0 0 10px calc(50% - 47.5vw);padding:8px 16px;background:var(--surface);border-radius:var(--rc2,12px);box-shadow:var(--sh)}" +
    "#spk .spt{flex:none;display:flex;flex-direction:column;gap:2px;min-width:180px}" +
    "#spk svg{flex:1 1 320px;min-width:0;height:66px}" +
    "#spk .lgb,#spk .lgr{display:inline-block;width:14px;height:0;border-top:3px solid var(--bl);vertical-align:middle;margin:0 4px 0 8px}" +
    "#spk .lgr{border-top-color:var(--reel);border-top-style:dashed}" +
    /* point 8 : colonnes ajoutées */
    "#bt th[data-spx]{white-space:nowrap;text-align:right}" +
    "#bt td[data-spx]{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}" +
    '#bt td[data-spx][data-sx="neg"]{color:var(--neg)!important}' +
    /* point 9 : synthèse épinglée */
    "#bt td.sp-pin{position:sticky!important;z-index:5}" +
    "#bt td.sp-pin.nm{z-index:7}" +
    "#bt td.sp-pin.sp-top{box-shadow:0 -3px 6px -3px rgba(0,0,0,.3)}" +
    "#spk .sppin{margin-left:auto;display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);color:var(--mute);cursor:pointer;white-space:nowrap}" +
    /* point 10 : tiers */
    "#bt td.nm .sp-pc{margin-left:8px;font-weight:400;color:var(--mute);font-size:var(--fs-sm)}" +
    "#bt td.spm .tg{position:sticky;left:8px;width:auto;white-space:nowrap}";
  document.head.appendChild(st);

  /* ---------- Outils ---------- */
  var MS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  function z() { return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function fx(n) { return (typeof f === "function" ? f(n) : String(Math.round(n * 100) / 100)) + "\u202f\u20ac"; }
  function fm(n) { return n ? fx(n) : "\u2013"; }
  function fp(x) { return (Math.round(x * 1000) / 10).toFixed(1).replace(".", ",") + "\u202f%"; }
  function rowsOf(wrap) { return Array.prototype.slice.call(wrap.querySelectorAll("tbody tr")); }
  function ownCells(tr) {
    return Array.prototype.filter.call(tr.children, function (c) { return !c.hasAttribute("data-spx"); });
  }
  function labelOf(tr) {
    var n = tr.querySelector("td.nm");
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function isNeg(td) {
    return td.classList.contains("neg") || /^[-\u2212]/.test(td.textContent.trim());
  }
  /* Lit un montant affiché (« 1 234,56 € », « −12 € », « – ») ; null si pas de chiffre */
  function pn(td) {
    if (!td) return null;
    var t = td.textContent.replace(/[\s\u00a0\u202f]/g, "").replace(/\u2212/g, "-");
    if (!/\d/.test(t)) return null;
    var v = parseFloat(t.replace(/[^0-9,.\-]/g, "").replace(/\./g, "").replace(",", "."));
    return isNaN(v) ? null : v;
  }
  function tone(td, reel) {
    if (!td) return;
    if (reel) { td.setAttribute("data-sp", "re"); td.removeAttribute("data-sn"); }
    else { td.setAttribute("data-sp", isNeg(td) ? "neg" : "bl"); td.removeAttribute("data-sn"); }
  }
  function setReal(td, v, rounded) {
    td.textContent = rounded ? fx(Math.round(v)) : fm(v);
    td.setAttribute("data-sp", "re");
    if (v < 0) td.setAttribute("data-sn", "1"); else td.removeAttribute("data-sn");
  }

  /* ---------- Calcul des soldes (même règle que le tableau) ---------- */
  function calc(yr) {
    var now = new Date(), valid = {};
    S.cats.forEach(function (c) {
      c.subs.forEach(function (s) { valid[c.id + ":" + s.id] = 1; });
      valid[c.id + ":"] = 1;
    });
    var keys = Object.keys(valid);
    function trig(y, m) { return now >= new Date(y, m, 1); }
    function yearArr(y) {
      var rb = z(), db = z(), ra = z(), da = z();
      keys.forEach(function (k) {
        var kd = kindOf(k.split(":")[0]), a = S.budget[y + "|" + k] || [];
        MS.forEach(function (m) { (kd === "rev" ? rb : db)[m] += +a[m] || 0; });
      });
      S.tx.forEach(function (t) {
        if (!t.cat || +t.date.slice(0, 4) !== y) return;
        var k = t.cat + ":" + (t.sub || "");
        if (!valid[k]) return;
        var m = +t.date.slice(5, 7) - 1;
        if (kindOf(t.cat) === "rev") ra[m] += t.v; else da[m] -= t.v;
      });
      return { rb: rb, db: db, ra: ra, da: da };
    }
    function chain(y, s0, r0) {
      var d = yearArr(y), op = [], rc = [];
      MS.forEach(function (m) {
        op[m] = m === 0 ? (trig(y, 0) ? r0 : s0) : (trig(y, m) ? rc[m - 1] : op[m - 1] + d.rb[m - 1] - d.db[m - 1]);
        rc[m] = (m === 0 ? r0 : rc[m - 1]) + d.ra[m] - d.da[m];
      });
      return { d: d, op: op, rc: rc, endB: op[11] + d.rb[11] - d.db[11], endR: rc[11] };
    }
    var carry = 0, key;
    for (key in S.budget) {
      var p = key.split("|"), k = p[1], kd = kindOf(k.split(":")[0]);
      if (+p[0] < 2026 && kd && valid[k]) {
        carry += S.budget[key].reduce(function (a, b) { return a + (+b || 0); }, 0) * (kd === "rev" ? 1 : -1);
      }
    }
    var bs = carry, rs = carry, y, c;
    for (y = 2026; y < yr; y++) { c = chain(y, bs, rs); bs = c.endB; rs = c.endR; }
    c = chain(yr, bs, rs);
    var d = c.d;
    return {
      rb: d.rb, db: d.db, ra: d.ra, da: d.da, op: c.op, rc: c.rc,
      sm: MS.map(function (m) { return d.rb[m] - d.db[m]; }),
      sr: MS.map(function (m) { return d.ra[m] - d.da[m]; }),
      cb: MS.map(function (m) { return c.op[m] + d.rb[m] - d.db[m]; })
    };
  }

  /* ---------- Structure du tableau (d'après les en-têtes) ---------- */
  function heads() {
    var hs = document.querySelectorAll("#bt thead tr:first-child th[data-mo]"), spans = [];
    Array.prototype.forEach.call(hs, function (h) { spans.push(parseInt(h.getAttribute("colspan") || "1", 10)); });
    var a = document.querySelector("#bt thead tr:first-child th.ga");
    var an = a ? parseInt(a.getAttribute("colspan") || "1", 10) : ((typeof CA !== "undefined" && CA) ? 4 : 2);
    return { spans: spans, annual: an };
  }
  /* Positions des cellules d'une ligne ; null si la ligne n'a pas la structure attendue.
     Les cellules ajoutées par ce script (data-spx) sont ignorées. */
  function layout(tr, H) {
    var kids = ownCells(tr), nm = tr.querySelector("td.nm"), i0 = kids.indexOf(nm);
    if (i0 < 0 || H.spans.length !== 12) return null;
    var cells = kids.slice(i0 + 1), exp = H.annual, p = 0, out = [];
    H.spans.forEach(function (s) { exp += s; });
    if (cells.length !== exp) return null;
    H.spans.forEach(function (sp) {
      out.push({ b: cells[p], r: sp > 1 ? cells[p + 1] : null, e: sp > 1 ? cells[p + 2] : null, open: sp > 1 });
      p += sp;
    });
    return {
      months: out,
      annual: { b: cells[p], r: H.annual > 2 ? cells[p + 1] : null, e: H.annual > 2 ? cells[p + 2] : null }
    };
  }
  /* Cellules du cumul annuel : d'après layout(), sinon (lignes de tiers seulement) les dernières cellules */
  function annOf(tr, L, H, tier) {
    if (L) return L.annual;
    if (!tier) return null;
    var kids = ownCells(tr), nm = tr.querySelector("td.nm"), i0 = kids.indexOf(nm);
    if (i0 < 0) return null;
    var cells = kids.slice(i0 + 1), n = cells.length, a = H.annual;
    if (n < a) return null;
    return { b: cells[n - a], r: a > 2 ? cells[n - a + 1] : null, e: a > 2 ? cells[n - a + 2] : null };
  }

  /* Point 5 : ▲ favorable / ▼ défavorable (positif = favorable dans ce tableau) */
  function esym(td) {
    if (!td) return;
    var t = td.textContent.replace(/\s/g, "");
    if (!/\d/.test(t)) { td.removeAttribute("data-es"); return; }
    var v = parseFloat(t.replace(/[^0-9,]/g, "").replace(",", "."));
    if (!v) { td.removeAttribute("data-es"); return; }
    var neg = /^[-\u2212]/.test(t);
    td.setAttribute("data-es", neg ? "d" : "u");
    td.title = neg ? "Écart défavorable" : "Écart favorable";
  }
  function alertCell(td, v, label) {
    if (!td) return;
    if (Math.round(v) < 0) { td.setAttribute("data-al", "1"); td.title = label + " : solde cumulé négatif"; }
    else { td.removeAttribute("data-al"); }
  }

  /* ---------- Point 8 : colonnes « Moy. / mois » et « Reste » ---------- */
  function addHead(wrap, nMo) {
    var rows = wrap.querySelectorAll("thead tr");
    if (!rows.length) return;
    var r1 = rows[0], r2 = rows[1] || null;
    var tipM = "Moyenne mensuelle = réel cumulé ÷ nombre de mois écoulés" + (nMo ? " (" + nMo + ", mois en cours inclus)" : "");
    var tipR = "Reste = budget annuel − réel à ce jour (reste à dépenser, ou à encaisser pour les revenus)";
    function th(txt, tip, cs) {
      var h = document.createElement("th");
      h.setAttribute("data-spx", "h");
      h.textContent = txt;
      if (tip) h.title = tip;
      if (cs) h.colSpan = cs;
      return h;
    }
    if (r2) {
      r1.appendChild(th("Moyenne et reste", "", 2));
      r2.appendChild(th("Moy. / mois", tipM));
      r2.appendChild(th("Reste", tipR));
    } else {
      r1.appendChild(th("Moy. / mois", tipM));
      r1.appendChild(th("Reste", tipR));
    }
  }
  /* ex = { m, r } : valeurs à afficher (undefined = case vide, null = « – ») ; ex null = ligne sans valeurs */
  function addCells(tr, ex, model, nMo) {
    var own = ownCells(tr), last = own[own.length - 1];
    if (!last) return;
    if (!ex && last.colSpan > 1) {
      /* ligne de section : la dernière cellule s'étend sur les deux nouvelles colonnes */
      if (!last.hasAttribute("data-sp-cs")) last.setAttribute("data-sp-cs", String(last.colSpan));
      last.colSpan = parseInt(last.getAttribute("data-sp-cs"), 10) + 2;
      return;
    }
    var cls = ((model || last).className || "").replace(/\b(neg|nm)\b/g, "").trim();
    var a = document.createElement("td"), b = document.createElement("td");
    a.className = cls; b.className = cls;
    a.setAttribute("data-spx", "m"); b.setAttribute("data-spx", "r");
    function put(c, v, tip) {
      if (v === undefined) return;
      if (v === null) { c.textContent = "\u2013"; return; }
      c.textContent = fm(Math.round(v * 100) / 100);
      c.title = tip;
      if (Math.round(v * 100) < 0) c.setAttribute("data-sx", "neg");
    }
    if (ex) {
      put(a, ex.m, "Réel cumulé ÷ " + nMo + " mois écoulés (mois en cours inclus)");
      put(b, ex.r, "Budget annuel − réel à ce jour");
    }
    tr.appendChild(a); tr.appendChild(b);
  }

  /* ---------- Point 10 : tiers (unités, pourcentages, menu) ---------- */
  /* Une « unité » = un tiers (une ligne, ou une ligne suivie de ses lignes de détail) */
  function tierUnits(wrap) {
    var rows = Array.prototype.slice.call(wrap.querySelectorAll("tr.tz0,tr.tz1")), u = [], i;
    if (!rows.length) return u;
    function cls(r) { return r.classList.contains("tz0") ? 0 : 1; }
    var alt = true, flat = true;
    for (i = 1; i < rows.length; i++) {
      if (cls(rows[i]) === cls(rows[i - 1])) alt = false;
      if (cls(rows[i]) !== cls(rows[0])) flat = false;
    }
    if (alt || flat) return rows.map(function (r) { return [r]; }); /* alternance de fond ou lignes uniformes */
    rows.forEach(function (r) {
      if (cls(r) === 0 || !u.length) u.push([r]); else u[u.length - 1].push(r);
    });
    return u;
  }
  function amtOf(A) {
    if (!A) return null;
    var vr = A.r ? pn(A.r) : null, vb = pn(A.b);
    var v = (vr !== null && vr !== 0) ? vr : vb;
    return v === null ? null : Math.abs(v);
  }
  function tierPct(wrap, H, K) {
    var items = [], tot = 0;
    tierUnits(wrap).forEach(function (u) {
      var tr = u[0], A = annOf(tr, layout(tr, H), H, true);
      items.push({ tr: tr, v: amtOf(A) });
    });
    if (K) tot = sum(K.da);
    if (!(tot > 0)) items.forEach(function (it) { tot += it.v || 0; });
    if (!(tot > 0)) return;
    items.forEach(function (it) {
      var nm = it.tr.querySelector("td.nm");
      if (!nm || !it.v) return;
      var s = document.createElement("span");
      s.className = "sp-pc";
      s.setAttribute("data-spx", "pc");
      s.textContent = fp(it.v / tot);
      s.title = "Part du total des dépenses";
      nm.appendChild(s);
    });
  }

  /* ---------- Classement par tiers : menu déroulant + 10 premiers ---------- */
  function applyTier(wrap) {
    var tier = wrap.querySelector("tr.sec.tier");
    if (!tier) return;
    var nm = tier.querySelector("td.nm"), cl = closed();
    if (nm) {
      nm.innerHTML =
        '<button type="button" class="tg" data-tt="1" aria-expanded="' + (!cl) +
        '" aria-label="Ouvrir ou fermer le classement par tiers">' + (cl ? "\u25B8" : "\u25BE") +
        "</button> Classement par tiers";
    }
    var units = tierUnits(wrap), n = units.length;
    var more = wrap.querySelector('tr[data-spx="more"]');
    units.forEach(function (u, k) {
      var hide = cl || (!showAll && k >= LIM);
      u.forEach(function (r) { r.style.display = hide ? "none" : ""; });
    });
    if (n <= LIM) {
      if (more && more.parentNode) more.parentNode.removeChild(more);
    } else {
      if (!more) {
        var lastU = units[n - 1], last = lastU[lastU.length - 1], cols = 0;
        Array.prototype.forEach.call(last.children, function (c) { cols += c.colSpan || 1; });
        more = document.createElement("tr");
        more.className = "spmore";
        more.setAttribute("data-spx", "more");
        more.innerHTML = '<td class="nm spm"><button type="button" class="tg" data-tm="1"></button></td>' +
          (cols > 1 ? '<td colspan="' + (cols - 1) + '"></td>' : "");
        last.parentNode.insertBefore(more, last.nextSibling);
      }
      var bt = more.querySelector("button");
      if (bt) {
        bt.textContent = showAll ? "\u25B4 Réduire aux " + LIM + " premiers" : "\u25BE Voir tout (" + n + " tiers)";
        bt.setAttribute("aria-expanded", String(showAll));
      }
      more.style.display = cl ? "none" : "";
    }
    var t = wrap.querySelector("table"), i = wrap.querySelector(".vs i");
    if (t && i) i.style.height = t.offsetHeight + "px";
  }

  /* ---------- Point 9 : synthèse épinglée en bas ---------- */
  function pin(wrap) {
    wrap = wrap || document.getElementById("bt");
    if (!wrap) return;
    Array.prototype.forEach.call(wrap.querySelectorAll("td.sp-pin"), function (td) {
      td.classList.remove("sp-pin", "sp-top");
      td.style.bottom = "";
      if (td.hasAttribute("data-pbg")) { td.style.backgroundColor = ""; td.removeAttribute("data-pbg"); }
    });
    if (!pinOn || window.innerHeight < 560) return;
    var rows = rowsOf(wrap).filter(function (tr) {
      return tr.offsetParent !== null && /^(Total revenus|Total d|Solde du mois|Report|Solde cumul)/.test(labelOf(tr));
    });
    var off = 0, i;
    for (i = rows.length - 1; i >= 0; i--) {
      var tr = rows[i], h = tr.getBoundingClientRect().height, isTop = (i === 0), o = off;
      Array.prototype.forEach.call(tr.children, function (td) {
        td.classList.add("sp-pin");
        if (isTop) td.classList.add("sp-top");
        td.style.bottom = o + "px";
        var bg = window.getComputedStyle(td).backgroundColor;
        if (!bg || bg === "transparent" || /,\s*0\)$/.test(bg)) {
          td.style.backgroundColor = "var(--surface)";
          td.setAttribute("data-pbg", "1");
        }
      });
      off += h;
    }
  }

  /* ---------- Point 7 : mini-courbe ---------- */
  function spark(wrap, K, yr, rex) {
    var old = document.getElementById("spk");
    if (old) old.remove();
    var cb = K.cb, re = MS.map(function (m) { return rex(m) ? K.rc[m] : null; });
    var all = cb.concat(re.filter(function (v) { return v !== null; }), [0]);
    var lo = Math.min.apply(null, all), hi = Math.max.apply(null, all), sp = (hi - lo) || 1;
    var X = function (m) { return 16 + m * (568 / 11); };
    var Yv = function (v) { return 52 - (v - lo) / sp * 40; };
    var pl = function (a) {
      return a.map(function (v, m) { return v === null ? "" : X(m).toFixed(1) + "," + Yv(v).toFixed(1); })
        .filter(Boolean).join(" ");
    };
    var neg = 0;
    MS.forEach(function (m) { var v = re[m] !== null ? re[m] : cb[m]; if (Math.round(v) < 0) neg++; });
    var ini = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
    var svg = '<svg viewBox="0 0 600 70" role="img" aria-label="Évolution du solde cumulé ' + yr + '">' +
      (lo < 0 && hi > 0 ? '<line x1="10" x2="590" y1="' + Yv(0).toFixed(1) + '" y2="' + Yv(0).toFixed(1) + '" style="stroke:var(--mute);stroke-dasharray:3 4;stroke-width:1"/>' : "") +
      '<polyline points="' + pl(cb) + '" style="fill:none;stroke:var(--bl);stroke-width:2"/>' +
      (re.some(function (v) { return v !== null; }) ? '<polyline points="' + pl(re) + '" style="fill:none;stroke:var(--reel);stroke-width:2;stroke-dasharray:6 4"/>' : "") +
      MS.map(function (m) {
        var v = cb[m];
        return '<circle cx="' + X(m).toFixed(1) + '" cy="' + Yv(v).toFixed(1) + '" r="3.2" style="fill:' + (Math.round(v) < 0 ? "var(--neg)" : "var(--bl)") + '"><title>' +
          ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"][m] +
          " : prévu " + fx(Math.round(v)) + (re[m] !== null ? ", réel " + fx(Math.round(re[m])) : "") + "</title></circle>";
      }).join("") +
      MS.map(function (m) { return '<text x="' + X(m).toFixed(1) + '" y="67" text-anchor="middle" style="font-size:9px;fill:var(--mute)">' + ini[m] + "</text>"; }).join("") +
      "</svg>";
    var box = document.createElement("div");
    box.id = "spk";
    box.innerHTML =
      '<div class="spt"><b>Solde cumulé ' + yr + "</b>" +
      '<span class="sub">Fin d\u2019année (prévu) : <b>' + fx(Math.round(cb[11])) + "</b></span>" +
      '<span class="sub"><i class="lgb"></i>prévu<i class="lgr"></i>réel' + (neg ? ' · <b class="neg">\u26A0 ' + neg + " mois en négatif</b>" : "") + "</span></div>" + svg +
      '<label class="sppin" title="Garde Total revenus, Total dépenses, Solde du mois, Report et Solde cumulé visibles en bas de l\u2019écran">' +
      '<input type="checkbox" data-pinbox="1"' + (pinOn ? " checked" : "") + "> Épingler la synthèse en bas</label>";
    wrap.parentNode.insertBefore(box, wrap);
  }

  /* ---------- Synthèse ---------- */
  function decorate() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    /* repartir d'un tableau propre : on retire ce que ce script avait ajouté */
    Array.prototype.forEach.call(wrap.querySelectorAll("[data-spx]"), function (n) {
      if (n.parentNode) n.parentNode.removeChild(n);
    });
    var now = new Date(), yr = (typeof Y !== "undefined") ? Y : now.getFullYear();
    var cy = now.getFullYear(), cm = now.getMonth();
    var trig = function (m) { return now >= new Date(yr, m, 1); };
    var rex = function (m) { return yr < cy || (yr === cy && m <= cm); };   /* le réel existe */
    var fin = function (m) { return yr < cy || (yr === cy && m < cm); };    /* mois terminé */
    var nMo = yr < cy ? 12 : (yr === cy ? cm + 1 : 0);                      /* mois écoulés, mois en cours inclus */
    var K = null, H = heads();
    try { K = calc(yr); } catch (e) { console.warn("synthese_plus.js : calcul impossible", e); }

    safe("en-têtes", function () { addHead(wrap, nMo); });

    rowsOf(wrap).forEach(function (tr) {
      var nm = tr.querySelector("td.nm");
      if (!nm) return;
      var lb = labelOf(tr), L = layout(tr, H), isRep = /^Report/.test(lb), isCum = /^Solde cumul/.test(lb), m;

      if (isRep) {
        tr.classList.add("grp");
        nm.innerHTML =
          '<span class="spl" title="Solde de départ du mois. Avant le 1er du mois : solde cumulé prévu du mois précédent (bleu). ' +
          'Dès le 1er du mois : solde réel du mois précédent (violet, italique).">' +
          'Report <span class="sh">début de mois</span></span>';
        if (L) {
          L.months.forEach(function (c, i) {
            var re = trig(i);
            tone(c.b, re);
            c.b.title = re ? "Report réel : solde réel du mois précédent" : "Report prévu : solde cumulé prévu du mois précédent";
          });
          tone(L.annual.b, trig(0));
        }
      } else if (isCum) {
        nm.innerHTML = '<span class="spl" title="Report + Solde du mois">Solde cumulé <span class="sh">report + solde</span></span>';
        if (L) {
          for (m = 0; m < 12; m++) {
            var c = L.months[m];
            if (K && !c.open && fin(m)) {
              setReal(c.b, K.rc[m], true);
              c.b.title = "Réel (mois terminé)";
              alertCell(c.b, K.rc[m], "Réel");
            } else {
              tone(c.b, false);
              if (K) alertCell(c.b, K.cb[m], "Prévu");
            }
            if (K && c.open && c.r) alertCell(c.r, rex(m) ? K.rc[m] : 0, "Réel");
          }
          tone(L.annual.b, false);
        }
      } else if (L && K) {
        /* Point 6 : lignes Total revenus / Total dépenses / Solde du mois */
        var src = /^Total revenus/.test(lb) ? [K.rb, K.ra] : /^Total d/.test(lb) ? [K.db, K.da] : /^Solde du mois/.test(lb) ? [K.sm, K.sr] : null;
        if (src) {
          var mark = /^Total revenus/.test(lb);
          for (m = 0; m < 12; m++) {
            var cc = L.months[m];
            if (cc.open) continue;
            if (fin(m)) {
              setReal(cc.b, src[1][m], false);
              cc.b.title = "Réel (mois terminé)";
              if (mark) cc.b.setAttribute("data-pm", "r");
            } else if (mark) {
              cc.b.setAttribute("data-pm", "p");
              cc.b.title = "Prévu";
            }
          }
        }
      }

      /* Point 5 : symboles sur tous les écarts */
      if (L) {
        L.months.forEach(function (c) { if (c.e) esym(c.e); });
        if (L.annual.e) esym(L.annual.e);
      }

      /* Point 8 : moyenne mensuelle et reste (budget annuel − réel à ce jour) */
      var isTier = tr.classList.contains("tz0") || tr.classList.contains("tz1");
      var A = annOf(tr, L, H, isTier), ex = null;
      if (A && isTier) {
        var amt = amtOf(A);
        if (amt) ex = { m: nMo > 0 ? amt / nMo : null }; /* pas de budget par tiers : « Reste » vide */
      } else if (A && !isRep && !isCum && !/^Solde du mois/.test(lb) && !tr.classList.contains("tier")) {
        var tt = K ? (/^Total revenus/.test(lb) ? [K.rb, K.ra] : /^Total d/.test(lb) ? [K.db, K.da] : null) : null;
        var vb = null, vr = null;
        if (A.r) { vb = pn(A.b); vr = pn(A.r); }       /* détail annuel affiché : on lit les cellules */
        else if (tt) { vb = sum(tt[0]); vr = sum(tt[1]); } /* sinon : seulement pour les lignes de total */
        if (vb !== null || vr !== null) {
          vb = vb || 0; vr = vr || 0;
          ex = { m: nMo > 0 ? vr / nMo : null, r: vb - vr };
        }
      }
      addCells(tr, ex, A ? A.b : null, nMo);
    });

    safe("pourcentages des tiers", function () { tierPct(wrap, H, K); });
    safe("classement par tiers", function () { applyTier(wrap); });
    if (K) safe("courbe", function () { spark(wrap, K, yr, rex); });
    safe("synthèse épinglée", function () { pin(wrap); });
  }

  /* Faut-il (re)décorer ? Oui si les libellés ou le bouton ne sont pas en place */
  function needs() {
    var wrap = document.getElementById("bt");
    if (!wrap || !wrap.querySelector("tbody tr")) return false;
    if (!wrap.querySelector(".spl")) return true;
    if (wrap.querySelector("tr.sec.tier") && !wrap.querySelector("[data-tt]")) return true;
    return false;
  }

  /* ---------- Branchement sur drawBud (sans modifier index.html) ---------- */
  var base = window.drawBud;
  window.drawBud = function () {
    var r = base.apply(this, arguments);
    try { decorate(); } catch (e) { console.error("synthese_plus.js :", e); }
    return r;
  };

  var app = document.getElementById("app");
  if (app && window.MutationObserver) {
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        try { if (needs()) decorate(); } catch (e) { console.error("synthese_plus.js :", e); }
      }, 40);
    }).observe(app, { childList: true, subtree: true });
  }

  /* Clics : triangle « Classement par tiers » et bouton « Voir tout »
     (phase de capture : passe avant tout ancien écouteur d'index.html) */
  window.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target.closest("[data-tt],[data-tm]") : null;
    if (!t) return;
    e.stopImmediatePropagation();
    var wrap = document.getElementById("bt");
    if (t.hasAttribute("data-tm")) {
      showAll = !showAll;
      if (wrap) applyTier(wrap);
      return;
    }
    var redraw = toggle();
    if (redraw) {
      window.drawBud();
    } else if (wrap) {
      applyTier(wrap);
    }
  }, true);

  /* Case « Épingler la synthèse en bas » */
  window.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || !t.hasAttribute || !t.hasAttribute("data-pinbox")) return;
    pinOn = !!t.checked;
    try { window.localStorage.setItem("synthesePlusPin", pinOn ? "1" : "0"); } catch (e1) { /* ignoré */ }
    pin(document.getElementById("bt"));
  }, true);

  /* Les hauteurs de lignes changent avec la fenêtre : on recalcule l'épinglage */
  window.addEventListener("resize", function () {
    clearTimeout(rtimer);
    rtimer = setTimeout(function () { safe("épinglage", function () { pin(); }); }, 120);
  });
})();
