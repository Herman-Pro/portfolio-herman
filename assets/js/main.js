/* ============================================================
   MAIN — Point d'entrée JS
   Fichier : assets/js/main.js

   Rôle : initialiser tous les modules JS du kit.
   On n'écrit pas de logique ici — on appelle les modules.
   ============================================================ */

/* Les scripts sont chargés dans le HTML dans l'ordre :
   1. menu.js
   2. form.js
   3. animations.js
   4. main.js  ← ce fichier
   
   Chaque fichier s'initialise lui-même.
   main.js est réservé pour la logique globale future.
*/

/* Lien actif navbar selon la section visible au scroll */
function initActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".navbar__link");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove("link-underline--active");
            if (link.getAttribute("href") === `#${entry.target.id}`) {
              link.classList.add("link-underline--active");
            }
          });
        }
      });
    },
    {
      threshold: 0.4,
      /*
      40% de la section doit être visible pour
      activer son lien navbar correspondant.
      Évite les changements trop rapides entre sections.
    */
    },
  );

  sections.forEach((section) => sectionObserver.observe(section));
}

initActiveNavLink();
