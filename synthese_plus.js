/* synthese_plus.js (v3)
   À charger APRÈS budget_plus.js, tout à la fin de index.html :
   <script src="synthese_plus.js"></script>
   Pour annuler : retirer cette ligne.

   - « Classement par tiers » : menu déroulant, fermé à l'ouverture, ouvert/fermé au clic.
   - Synthèse : libellés explicatifs, montants prévus en bleu, report réel en violet italique,
     trait de séparation au-dessus de la ligne Report.

   Compatible avec les anciennes modifications éventuellement restées dans index.html
   (variable CT et ligne de clic data-tt) : dans ce cas, ce fichier prend la main sur le clic.
*/
(function () {
  "use strict";
  if (typeof window.drawBud !== "function") return;

  var localCT = true; /* utilisé seulement si index.html ne définit pas déjà CT */
  var timer = null;

  /* Menu fermé ? (utilise CT d'index.html s'il existe, sinon l'état local) */
  function closed() { return (typeof CT !== "undefined") ? CT : localCT; }
  /* Bascule ; renvoie true si c'est index.html qui génère/omet les lignes de tiers */
  function toggle() {
    if (typeof CT !== "undefined") { CT = !CT; return true; }
    localCT = !localCT; return false;
  }

  /* ---------- Style (couleurs forcées pour résister aux autres fichiers) ---------- */
  var st = document.createElement("style");
  st.id = "synthese-plus-css";
  st.textContent =
    '#bt td[data-sp="bl"]{color:var(--bl)!important}' +
    '#bt td[data-sp="neg"]{color:var(--neg)!important}' +
    '#bt td[data-sp="re"]{color:var(--reel)!important;font-style:italic}' +
    "#bt tbody tr.grp td{border-top:2px solid color-mix(in srgb,var(--mute) 45%,var(--surface))!important}" +
    "#bt td.nm .sh{margin-left:6px;font-weight:400;color:var(--mute);font-size:var(--fs-sm)}";
  document.head.appendChild(st);

  /* ---------- Outils ---------- */
  function rowsOf(wrap) {
    return Array.prototype.slice.call(wrap.querySelectorAll("tbody tr"));
  }
  function labelOf(tr) {
    var n = tr.querySelector("td.nm");
    return n ? n.textContent.replace(/\s+/g, " ").trim() : "";
  }
  /* Cellules « Budget » des 12 mois (d'après les en-têtes) + cellule du cumul annuel */
  function monthCells(tr) {
    var heads = document.querySelectorAll("#bt thead tr:first-child th[data-mo]");
    var cells = Array.prototype.slice.call(tr.children, 1), out = [], p = 0;
    Array.prototype.forEach.call(heads, function (h) {
      out.push(cells[p]);
      p += parseInt(h.getAttribute("colspan") || "1", 10);
    });
    return { months: out, annual: cells[p] };
  }
  function isNeg(td) {
    return td.classList.contains("neg") || /^[-\u2212]/.test(td.textContent.trim());
  }
  function tone(td, reel) {
    if (!td) return;
    td.setAttribute("data-sp", reel ? "re" : (isNeg(td) ? "neg" : "bl"));
  }

  /* ---------- Classement par tiers : menu déroulant ---------- */
  function applyTier(wrap) {
    var tier = wrap.querySelector("tr.sec.tier");
    if (!tier) return;
    var nm = tier.querySelector("td.nm");
    var cl = closed();
    if (nm) {
      nm.innerHTML =
        '<button type="button" class="tg" data-tt="1" aria-expanded="' + (!cl) +
        '" aria-label="Ouvrir ou fermer le classement par tiers">' + (cl ? "\u25B8" : "\u25BE") +
        "</button> Classement par tiers";
    }
    wrap.querySelectorAll("tr.tz0,tr.tz1").forEach(function (r) {
      r.style.display = cl ? "none" : "";
    });
    var t = wrap.querySelector("table"), i = wrap.querySelector(".vs i");
    if (t && i) i.style.height = t.offsetHeight + "px";
  }

  /* ---------- Synthèse ---------- */
  function decorate() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    var now = new Date(), yr = (typeof Y !== "undefined") ? Y : now.getFullYear();
    var trig = function (m) { return now >= new Date(yr, m, 1); };

    rowsOf(wrap).forEach(function (tr) {
      var lb = labelOf(tr), nm = tr.querySelector("td.nm");
      if (!nm) return;

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
          td.title = re
            ? "Report réel : solde réel du mois précédent"
            : "Report prévu : solde cumulé prévu du mois précédent";
        });
        tone(c1.annual, trig(0));
      } else if (/^Solde cumul/.test(lb)) {
        nm.innerHTML =
          '<span class="spl" title="Report + Solde du mois">Solde cumulé <span class="sh">report + solde</span></span>';
        var c2 = monthCells(tr);
        c2.months.forEach(function (td) { tone(td, false); });
        tone(c2.annual, false);
      }
    });

    applyTier(wrap);
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

  /* Clic sur le triangle. Écouteur en phase de capture sur window : il passe avant tout
     ancien écouteur resté dans index.html, qui est alors ignoré (pas de double bascule). */
  window.addEventListener("click", function (e) {
    if (!(e.target.closest && e.target.closest("[data-tt]"))) return;
    e.stopImmediatePropagation();
    var redraw = toggle();
    if (redraw) {
      window.drawBud();            /* index.html ne génère les lignes que si CT est false */
    } else {
      var wrap = document.getElementById("bt");
      if (wrap) applyTier(wrap);   /* sinon : simple affichage/masquage sur place */
    }
  }, true);
})();
