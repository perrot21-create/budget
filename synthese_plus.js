/* synthese_plus.js (v4)
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
*/
(function () {
  "use strict";
  if (typeof window.drawBud !== "function") return;

  var localCT = true; /* utilisé seulement si index.html ne définit pas déjà CT */
  var timer = null;

  function closed() { return (typeof CT !== "undefined") ? CT : localCT; }
  function toggle() {
    if (typeof CT !== "undefined") { CT = !CT; return true; }
    localCT = !localCT; return false;
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
    "#spk .lgr{border-top-color:var(--reel);border-top-style:dashed}";
  document.head.appendChild(st);

  /* ---------- Outils ---------- */
  var MS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  function z() { return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; }
  function fx(n) { return (typeof f === "function" ? f(n) : String(Math.round(n * 100) / 100)) + "\u202f\u20ac"; }
  function fm(n) { return n ? fx(n) : "\u2013"; }
  function rowsOf(wrap) { return Array.prototype.slice.call(wrap.querySelectorAll("tbody tr")); }
  function labelOf(tr) {
    var n = tr.querySelector("td.nm");
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function isNeg(td) {
    return td.classList.contains("neg") || /^[-\u2212]/.test(td.textContent.trim());
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
  /* Positions des cellules d'une ligne ; null si la ligne n'a pas la structure attendue */
  function layout(tr, H) {
    var kids = Array.prototype.slice.call(tr.children), nm = tr.querySelector("td.nm"), i0 = kids.indexOf(nm);
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

  /* ---------- Classement par tiers : menu déroulant ---------- */
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
    wrap.querySelectorAll("tr.tz0,tr.tz1").forEach(function (r) { r.style.display = cl ? "none" : ""; });
    var t = wrap.querySelector("table"), i = wrap.querySelector(".vs i");
    if (t && i) i.style.height = t.offsetHeight + "px";
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
      '<span class="sub"><i class="lgb"></i>prévu<i class="lgr"></i>réel' + (neg ? ' · <b class="neg">\u26A0 ' + neg + " mois en négatif</b>" : "") + "</span></div>" + svg;
    wrap.parentNode.insertBefore(box, wrap);
  }

  /* ---------- Synthèse ---------- */
  function decorate() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    var now = new Date(), yr = (typeof Y !== "undefined") ? Y : now.getFullYear();
    var cy = now.getFullYear(), cm = now.getMonth();
    var trig = function (m) { return now >= new Date(yr, m, 1); };
    var rex = function (m) { return yr < cy || (yr === cy && m <= cm); };   /* le réel existe */
    var fin = function (m) { return yr < cy || (yr === cy && m < cm); };    /* mois terminé */
    var K = null, H = heads();
    try { K = calc(yr); } catch (e) { console.warn("synthese_plus.js : calcul impossible", e); }

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
    });

    applyTier(wrap);
    if (K) { try { spark(wrap, K, yr, rex); } catch (e2) { console.warn("synthese_plus.js : courbe", e2); } }
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

  /* Clic sur le triangle (phase de capture : passe avant tout ancien écouteur d'index.html) */
  window.addEventListener("click", function (e) {
    if (!(e.target.closest && e.target.closest("[data-tt]"))) return;
    e.stopImmediatePropagation();
    var redraw = toggle();
    if (redraw) {
      window.drawBud();
    } else {
      var wrap = document.getElementById("bt");
      if (wrap) applyTier(wrap);
    }
  }, true);
})();
