/* ============================================================
   ANIMATIONS — Apparition des éléments au scroll
   Fichier : assets/js/animations.js

   Technique : IntersectionObserver
   → Observe quand un élément entre dans le viewport.
   → Déclenche l'animation CSS au bon moment.
   → Beaucoup plus performant que scroll + getBoundingClientRect().
   ============================================================ */

/* ----------------------------------------------------------
   1. OBSERVER — Détecte l'entrée dans le viewport
---------------------------------------------------------- */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -80px 0px",
    /*
    -80px au lieu de -50px → l'élément doit être plus
    à l'intérieur du viewport avant de se déclencher.
    Tu as plus de temps pour voir l'animation partir.
  */
  },
);

/* ----------------------------------------------------------
   2. CIBLES — Éléments à animer
   
   On observe tous les éléments avec la classe .animate
   qu'on va ajouter dans le HTML sur les éléments voulus.
---------------------------------------------------------- */

function initAnimations() {
  const elements = document.querySelectorAll(".animate");
  elements.forEach((el) => observer.observe(el));

  /*
    Pourquoi une classe .animate et pas cibler directement
    .icon-card, .feature-item, etc. ?
    → Flexibilité totale. On décide dans le HTML
    ce qui s'anime et ce qui ne s'anime pas.
    Demain tu veux animer un titre → tu ajoutes juste .animate.
    Pas besoin de modifier le JS.
  */
}

/* ----------------------------------------------------------
   3. DÉLAI PROGRESSIF — Cards en cascade
   
   Sur les grilles, chaque card apparaît légèrement
   après la précédente — effet cascade.
---------------------------------------------------------- */

function initStaggeredAnimations() {
  const grids = document.querySelectorAll(".three-col, .two-col-grid");

  grids.forEach((grid) => {
    const items = grid.querySelectorAll(".animate");
    items.forEach((item, index) => {
      item.style.transitionDelay = `${index * 150}ms`;
      /*
  150ms au lieu de 100ms entre chaque card.
  La cascade est plus lisible — les cards n'arrivent
  pas toutes en même temps.
*/

      /*
        index * 100ms → chaque card a 100ms de délai de plus.
        Card 1 → 0ms
        Card 2 → 100ms
        Card 3 → 200ms
        Effet cascade naturel et lisible.
        
        Pourquoi style et pas une classe CSS ?
        → Le délai dépend de la position dans la liste (index).
        On ne peut pas calculer ça en CSS pur sans CSS custom properties.
        JS est le bon endroit pour ce calcul dynamique.
      */
    });
  });
}

/* Lancement */
initAnimations();
initStaggeredAnimations();
