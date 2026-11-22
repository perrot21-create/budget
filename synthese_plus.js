/* synthese_plus.js (v3)
   À charger APRÈS budget_plus.js, tout à la fin de index.html :
   <script src="synthese_plus.js"></script>
   Pour annuler : retirer cette ligne.

   v3 – améliorations visuelles du bloc synthèse :
   - chiffres alignés à droite, chasse fixe, symbole € discret
   - « Solde cumulé » mis en valeur, « Report » plus discret
   - mois en cours surligné, mois écoulés (réel) / à venir (prévu) distingués
   - légende compacte (prévu, réel, négatif, mois en cours)
   - soldes négatifs en pastille rouge
   - indicateur ▲/▼ de l’écart réel − prévu
   - en-tête et première colonne figés
   - colonne du cumul annuel séparée par une bordure
   - « Classement par tiers » : chevron animé, barre de proportion + %, sous-totaux en gras, zébrures

   Variable CSS facultative : --sp-top (décalage de l’en-tête figé si la page a un bandeau fixe).
*/
(function () {
  "use strict";
  if (typeof window.drawBud !== "function") return;

  var CT = true;      /* true = Classement par tiers replié à l'ouverture */
  var timer = null;

  /* ---------- Style (couleurs forcées pour résister aux autres fichiers) ---------- */
  var mix = function (c, p) { return "color-mix(in srgb," + c + " " + p + "%,transparent)"; };
  var tint = function (c, p) { var m = mix(c, p); return "linear-gradient(" + m + "," + m + ")"; };
  var line = "color-mix(in srgb,var(--mute) 55%,var(--surface))";

  var st = document.createElement("style");
  st.id = "synthese-plus-css";
  st.textContent = [
    /* Chiffres */
    "#bt{font-variant-numeric:tabular-nums}",
    "#bt tbody td:not(.nm){text-align:right}",
    "#bt .eur{color:var(--mute);font-size:.85em;font-weight:400}",
    "#bt .pl{display:inline-block;padding:1px 8px;border-radius:999px}",

    /* Couleurs prévu / réel / négatif */
    '#bt td[data-sp="bl"]{color:var(--bl)!important}',
    '#bt td[data-sp="neg"]{color:var(--neg)!important}',
    '#bt td[data-sp="neg"] .pl{background:' + mix("var(--neg)", 14) + ";font-weight:600}",
    '#bt td[data-sp="re"]{color:var(--reel)!important;font-style:italic}',

    /* Libellés */
    "#bt td.nm .sh{margin-left:6px;font-weight:400;color:var(--mute);font-size:calc(var(--fs-sm) * .92);opacity:.85}",

    /* Hiérarchie des lignes */
    "#bt tbody tr.grp td{border-top:2px solid " + line + "!important;font-size:.94em}",
    "#bt tbody tr.cum td{font-weight:700;border-top:2px solid " + line + ";" +
      "background-color:color-mix(in srgb,var(--bl) 7%,var(--surface))}",

    /* Passé / mois en cours / à venir */
    "#bt td.mf,#bt th.mf{background-image:" + tint("var(--bl)", 4) + "}",
    "#bt td.mc,#bt th.mc{background-image:" + tint("var(--reel)", 10) + "}",
    "#bt td.mc0,#bt th.mc{border-left:2px solid var(--reel)}",
    "#bt td.mc1,#bt th.mc{border-right:2px solid var(--reel)}",
    '#bt th.mc::before{content:"\\25CF";color:var(--reel);margin-right:4px;font-size:.7em;vertical-align:1px}',

    /* Cumul annuel */
    "#bt td.ann,#bt th.ann{border-left:2px solid " + line + "}",

    /* Écart réel − prévu */
    "#bt .dl{margin-left:4px;font-size:.75em;font-style:normal}",
    "#bt .dl.up{color:var(--pos,#2e9e5b)}",
    "#bt .dl.dn{color:var(--neg)}",

    /* En-tête et première colonne figés */
    "#bt thead th{position:sticky;top:var(--sp-top,0px);z-index:3;background-color:var(--surface)}",
    "#bt thead th:first-child{left:0;z-index:4}",
    "#bt tbody td.nm{position:sticky;left:0;z-index:2;background-color:var(--surface)}",

    /* Classement par tiers */
    "#bt .tg[data-tt]{display:inline-block;transition:transform .2s ease}",
    '#bt .tg[data-tt][aria-expanded="true"]{transform:rotate(90deg)}',
    "#bt tr.tz0 td{font-weight:700}",
    "#bt tr.tz0:nth-child(even) td,#bt tr.tz1:nth-child(even) td{" +
      "background-color:color-mix(in srgb,var(--mute) 6%,var(--surface))}",
    "#bt td.nm .pc{margin-left:6px;font-weight:600;color:var(--mute);font-size:var(--fs-sm)}",

    /* Légende */
    "#sp-legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:0 0 8px;font-size:var(--fs-sm);color:var(--mute)}",
    "#sp-legend .k{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:5px;vertical-align:-1px}"
  ].join("\n");
  document.head.appendChild(st);

  /* ---------- Outils ---------- */
  function rowsOf(wrap) {
    return Array.prototype.slice.call(wrap.querySelectorAll("tbody tr"));
  }
  function labelOf(tr) {
    var n = tr.querySelector("td.nm");
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function num(s) {
    var t = String(s || "").replace(/[\s\u00a0\u202f\u20ac]/g, "").replace(/\u2212/g, "-").replace(",", ".");
    var v = parseFloat(t);
    return isNaN(v) ? null : v;
  }
  function fmt(v) {
    return v.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  /* Toutes les cellules de chaque mois (d'après les en-têtes) + cellule du cumul annuel */
  function groups(tr) {
    var heads = document.querySelectorAll("#bt thead tr:first-child th[data-mo]");
    var cells = Array.prototype.slice.call(tr.children, 1), out = [], p = 0;
    Array.prototype.forEach.call(heads, function (h) {
      var n = parseInt(h.getAttribute("colspan") || "1", 10);
      out.push(cells.slice(p, p + n));
      p += n;
    });
    return { months: out, annual: cells[p] };
  }
  /* Cellules « Budget » des 12 mois + cellule du cumul annuel */
  function monthCells(tr) {
    var g = groups(tr);
    return { months: g.months.map(function (c) { return c[0]; }), annual: g.annual };
  }
  function isNeg(td) {
    return td.classList.contains("neg") || /^[-\u2212]/.test(td.textContent.trim());
  }
  function tone(td, reel) {
    if (!td) return;
    td.setAttribute("data-sp", reel ? "re" : (isNeg(td) ? "neg" : "bl"));
  }
  /* Pastille : enveloppe le montant, avec « € » discret */
  function pill(td) {
    if (!td || td.children.length) return;
    var t = td.textContent.trim();
    if (!t) return;
    var m = t.match(/^(.*?)\s*\u20ac$/);
    td.innerHTML = '<span class="pl">' + esc(m ? m[1] : t) + "</span>" +
      (m ? ' <span class="eur">\u20ac</span>' : "");
  }

  /* ---------- Classement par tiers : menu déroulant ---------- */
  function applyTier(wrap) {
    var tier = wrap.querySelector("tr.sec.tier");
    if (!tier) return;
    var nm = tier.querySelector("td.nm");
    var btn = tier.querySelector("[data-tt]");
    if (btn) {
      btn.setAttribute("aria-expanded", String(!CT));   /* le chevron pivote en CSS */
    } else if (nm) {
      nm.innerHTML =
        '<button type="button" class="tg" data-tt="1" aria-expanded="' + (!CT) +
        '" aria-label="Ouvrir ou fermer le classement par tiers">\u25B8</button> Classement par tiers';
    }
    wrap.querySelectorAll("tr.tz0,tr.tz1").forEach(function (r) {
      r.style.display = CT ? "none" : "";
    });

    /* Barre de proportion + % de chaque tiers sur le total */
    var tz0 = Array.prototype.slice.call(wrap.querySelectorAll("tr.tz0")), vals = [], tot = 0, mx = 0;
    tz0.forEach(function (r) {
      var a = groups(r).annual, v = a ? Math.abs(num(a.textContent) || 0) : 0;
      vals.push(v); tot += v; if (v > mx) mx = v;
    });
    if (tot > 0) {
      tz0.forEach(function (r, i) {
        var c = r.querySelector("td.nm");
        if (!c) return;
        var pct = vals[i] / tot * 100, w = mx ? vals[i] / mx * 100 : 0;
        c.style.backgroundImage = "linear-gradient(90deg," + mix("var(--bl)", 18) + " " + w.toFixed(1) + "%,transparent " + w.toFixed(1) + "%)";
        var sp = c.querySelector(".pc");
        if (!sp) { sp = document.createElement("span"); sp.className = "pc"; c.appendChild(sp); }
        sp.textContent = pct.toFixed(1).replace(".", ",") + " %";
      });
    }

    var t = wrap.querySelector("table"), i2 = wrap.querySelector(".vs i");
    if (t && i2) i2.style.height = t.offsetHeight + "px";
  }

  /* En-têtes figés : la 2e ligne d'en-tête se cale sous la 1re */
  function stickyHead() {
    var top = 0;
    Array.prototype.forEach.call(document.querySelectorAll("#bt thead tr"), function (r) {
      Array.prototype.forEach.call(r.children, function (th) {
        th.style.top = "calc(var(--sp-top,0px) + " + top + "px)";
      });
      top += r.offsetHeight;
    });
  }

  /* Légende compacte */
  function legend(wrap) {
    if (document.getElementById("sp-legend") || !wrap.parentNode) return;
    var d = document.createElement("div");
    d.id = "sp-legend";
    d.innerHTML =
      '<span><i class="k" style="background:var(--bl)"></i>prévu</span>' +
      '<span><i class="k" style="background:var(--reel)"></i>réel</span>' +
      '<span><i class="k" style="background:var(--neg)"></i>négatif</span>' +
      '<span><i class="k" style="background:transparent;border:2px solid var(--reel)"></i>mois en cours</span>';
    wrap.parentNode.insertBefore(d, wrap);
  }

  /* ---------- Synthèse ---------- */
  function decorate() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    var now = new Date(), yr = (typeof Y !== "undefined") ? Y : now.getFullYear();
    var trig = function (m) { return now >= new Date(yr, m, 1); };
    /* mois courant : 0-11 ; 12 = tout est passé ; -1 = tout est à venir */
    var curM = yr === now.getFullYear() ? now.getMonth() : (yr < now.getFullYear() ? 12 : -1);

    legend(wrap);

    /* En-têtes : mois en cours / à venir, colonne du cumul annuel */
    var heads = document.querySelectorAll("#bt thead tr:first-child th[data-mo]");
    Array.prototype.forEach.call(heads, function (h, m) {
      h.classList.remove("mc", "mf");
      if (m === curM) h.classList.add("mc"); else if (m > curM) h.classList.add("mf");
    });
    if (heads.length) {
      var ah = heads[heads.length - 1].nextElementSibling;
      if (ah) ah.classList.add("ann");
    }

    rowsOf(wrap).forEach(function (tr) {
      var lb = labelOf(tr), nm = tr.querySelector("td.nm");
      if (!nm) return;

      /* Colonnes : passé / mois en cours / à venir + cumul annuel */
      var g = groups(tr);
      g.months.forEach(function (cells, m) {
        cells.forEach(function (td, k) {
          if (!td) return;
          td.classList.remove("mc", "mf", "mc0", "mc1");
          if (m === curM) {
            td.classList.add("mc");
            if (k === 0) td.classList.add("mc0");
            if (k === cells.length - 1) td.classList.add("mc1");
          } else if (m > curM) {
            td.classList.add("mf");
          }
        });
      });
      if (g.annual) g.annual.classList.add("ann");

      if (/^Report/.test(lb)) {
        tr.classList.add("grp");
        nm.innerHTML =
          '<span class="spl" title="Solde de départ du mois. Avant le 1er du mois : solde cumulé prévu du mois précédent (bleu). ' +
          'Dès le 1er du mois : solde réel du mois précédent (violet, italique).">' +
          'Report <span class="sh">début de mois</span></span>';
        var c1 = monthCells(tr);
        c1.months.forEach(function (td, m) {
          if (!td) return;
          var re = trig(m);
          tone(td, re);
          pill(td);
          td.title = re
            ? "Report réel : solde réel du mois précédent"
            : "Report prévu : solde cumulé prévu du mois précédent";
        });
        tone(c1.annual, trig(0));
        pill(c1.annual);
      } else if (/^Solde cumul/.test(lb)) {
        tr.classList.add("cum");
        nm.innerHTML =
          '<span class="spl" title="Report + Solde du mois">Solde cumulé <span class="sh">report + solde</span></span>';
        var c2 = monthCells(tr);
        c2.months.forEach(function (td) { tone(td, false); pill(td); });
        tone(c2.annual, false);
        pill(c2.annual);
      }

      /* Écart réel − prévu (lignes « Solde… », mois commencés, si une 2e colonne existe) */
      if (/^Solde/.test(lb)) {
        g.months.forEach(function (cells, m) {
          if (m > curM || cells.length < 2 || !cells[0] || !cells[1]) return;
          if (cells[1].querySelector(".dl")) return;
          var b = num(cells[0].textContent), r = num(cells[1].textContent);
          if (b === null || r === null) return;
          var d = r - b;
          if (Math.abs(d) < 0.005) return;
          var s = document.createElement("span");
          s.className = "dl " + (d > 0 ? "up" : "dn");
          s.textContent = d > 0 ? "\u25B2" : "\u25BC";
          s.title = "Écart réel \u2212 prévu : " + (d > 0 ? "+" : "") + fmt(d) + " \u20ac";
          cells[1].appendChild(s);
        });
      }
    });

    applyTier(wrap);
    stickyHead();
  }

  /* Faut-il (re)décorer ? Oui si les libellés, la légende ou le bouton ne sont pas en place */
  function needs() {
    var wrap = document.getElementById("bt");
    if (!wrap || !wrap.querySelector("tbody tr")) return false;
    if (!wrap.querySelector(".spl")) return true;
    if (!document.getElementById("sp-legend")) return true;
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

  /* Si un autre fichier redessine le tableau ensuite, on réapplique */
  var app = document.getElementById("app");
  if (app && window.MutationObserver) {
    new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        try { if (needs()) decorate(); } catch (e) { console.error("synthese_plus.js :", e); }
      }, 40);
    }).observe(app, { childList: true, subtree: true });
  }

  /* Recaler l'en-tête figé si la fenêtre change de taille */
  window.addEventListener("resize", function () {
    try { stickyHead(); } catch (e) { /* rien */ }
  });

  /* Clic sur le triangle : ouverture/fermeture sur place */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-tt]")) {
      CT = !CT;
      var wrap = document.getElementById("bt");
      if (wrap) applyTier(wrap);
    }
  });
})();
