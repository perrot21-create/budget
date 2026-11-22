/* synthese_plus.js
   À charger APRÈS budget_plus.js, tout à la fin de index.html :
   <script src="synthese_plus.js"></script>
   Pour annuler : retirer cette ligne. Aucun autre fichier n'est modifié.

   1) « Classement par tiers » = menu déroulant, fermé à l'ouverture, ouvert/fermé au clic.
   2) Synthèse, point 1 : libellés explicatifs + infobulles (Report, Solde cumulé).
   3) Synthèse, point 2 : montants prévus en bleu, report réel en violet italique.
   4) Synthèse, point 3 : trait de séparation entre « flux du mois » et « position cumulée ».
*/
(function () {
  "use strict";
  if (typeof window.drawBud !== "function") return;

  var CT = true; /* true = Classement par tiers replié (état à l'ouverture du fichier) */

  /* ---------- Style ---------- */
  var st = document.createElement("style");
  st.id = "synthese-plus-css";
  st.textContent =
    "#bt tbody tr.grp td{border-top:2px solid color-mix(in srgb,var(--mute) 45%,var(--surface))!important}" +
    "#bt td.nm .sh{margin-left:6px}";
  document.head.appendChild(st);

  /* ---------- Outils ---------- */
  /* Renvoie les cellules des 12 mois et la cellule du cumul annuel d'une ligne du tableau */
  function monthCells(tr) {
    var cells = Array.prototype.slice.call(tr.children, 1), out = [], p = 0, m;
    for (m = 0; m < 12; m++) {
      out.push(cells[p]);
      p += (typeof CM !== "undefined" && CM[m]) ? 3 : 1;
    }
    return { months: out, annual: cells[p] };
  }

  /* Prévu = bleu (rouge si négatif) ; réel = violet italique */
  function tone(td, reel) {
    if (!td) return;
    var neg = td.classList.contains("neg");
    td.classList.remove("pos", "neg", "bl", "ri");
    td.classList.add(reel ? "ri" : (neg ? "neg" : "bl"));
  }

  /* ---------- Classement par tiers : menu déroulant ---------- */
  function applyTier() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    var tier = wrap.querySelector("tr.sec.k-syn.tier");
    if (!tier) return;
    var nm = tier.querySelector("td.nm");
    if (nm) {
      nm.innerHTML =
        '<button type="button" class="tg" data-tt="1" aria-expanded="' + (!CT) +
        '" aria-label="Ouvrir ou fermer le classement par tiers">' + (CT ? "▸" : "▾") +
        "</button> Classement par tiers";
    }
    wrap.querySelectorAll("tr.tz0,tr.tz1").forEach(function (r) {
      r.style.display = CT ? "none" : "";
    });
    /* le repère vertical suit la hauteur réelle du tableau */
    var t = wrap.querySelector("table"), i = wrap.querySelector(".vs i");
    if (t && i) i.style.height = t.offsetHeight + "px";
  }

  /* ---------- Synthèse ---------- */
  function decorate() {
    var wrap = document.getElementById("bt");
    if (!wrap) return;
    var now = new Date(), yr = (typeof Y !== "undefined") ? Y : now.getFullYear();
    var trig = function (m) { return now >= new Date(yr, m, 1); };

    /* Ligne Report */
    var rep = wrap.querySelector("tr.k-syn.gap:not(.tsol)");
    if (rep) {
      rep.classList.add("grp");
      var n1 = rep.querySelector("td.nm");
      if (n1) {
        n1.innerHTML =
          '<span title="Solde de départ du mois. Avant le 1er du mois : solde cumulé prévu du mois précédent (bleu). ' +
          'Dès le 1er du mois : solde réel du mois précédent (violet, italique).">' +
          'Report <span class="sh">début de mois</span></span>';
      }
      var c1 = monthCells(rep);
      c1.months.forEach(function (td, m) {
        if (!td) return;
        var re = trig(m);
        tone(td, re);
        td.title = re
          ? "Report réel : solde réel du mois précédent"
          : "Report prévu : solde cumulé prévu du mois précédent";
      });
      tone(c1.annual, trig(0));
    }

    /* Ligne Solde cumulé */
    var cum = wrap.querySelector("tr.tcum");
    if (cum) {
      var n2 = cum.querySelector("td.nm");
      if (n2) {
        n2.innerHTML =
          '<span title="Report + Solde du mois">Solde cumulé <span class="sh">report + solde</span></span>';
      }
      var c2 = monthCells(cum);
      c2.months.forEach(function (td) { tone(td, false); });
      tone(c2.annual, false);
    }

    applyTier();
  }

  /* ---------- Branchement sur drawBud (sans modifier index.html) ---------- */
  var base = window.drawBud;
  window.drawBud = function () {
    var r = base.apply(this, arguments);
    try { decorate(); } catch (e) { console.error("synthese_plus.js :", e); }
    return r;
  };

  /* Clic sur ▸ / ▾ : ouverture/fermeture sur place, sans redessiner le tableau */
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-tt]")) {
      CT = !CT;
      applyTier();
    }
  });
})();
