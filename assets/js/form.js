/* ============================================================
   FORM — Validation + notification
   Fichier : assets/js/form.js

   Fonctionnement :
   1. Validation en temps réel sur chaque champ (blur + input)
   2. Validation globale à la soumission
   3. Notification de succès ou d'erreur après envoi
   ============================================================ */

/* ----------------------------------------------------------
   1. CONFIGURATION — Règles de validation par champ
   
   On centralise les règles ici.
   Pour ajouter un champ → on ajoute une entrée ici.
   On ne touche pas au reste du code.
---------------------------------------------------------- */

const RULES = {
  name: {
    required: true,
    minLength: 2,
    messages: {
      required: "Votre nom est requis.",
      minLength: "Le nom doit contenir au moins 2 caractères.",
    },
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: "Votre email est requis.",
      pattern: "Veuillez entrer un email valide.",
    },
  },
  phone: {
    required: false,
    pattern: /^[\d\s\+\-\(\)]{8,}$/,
    messages: {
      pattern: "Veuillez entrer un numéro valide.",
    },
  },
  message: {
    required: true,
    minLength: 10,
    messages: {
      required: "Votre message est requis.",
      minLength: "Le message doit contenir au moins 10 caractères.",
    },
  },
};

/*
  Pourquoi un objet RULES séparé ?
  → Séparation des responsabilités.
  Les règles métier sont ici.
  La logique de validation est ailleurs.
  Si le client veut changer une règle, on touche RULES uniquement.
*/

/* ----------------------------------------------------------
   2. VALIDATION — Valide un champ selon ses règles
   
   Retourne : { valid: bool, message: string }
---------------------------------------------------------- */

function validateField(name, value) {
  const rules = RULES[name];

  /*
    Si pas de règle définie pour ce champ → valide par défaut.
    Évite les erreurs sur des champs non déclarés dans RULES.
  */
  if (!rules) return { valid: true, message: "" };

  const trimmed = value.trim();

  /* Vérification required */
  if (rules.required && trimmed === "") {
    return { valid: false, message: rules.messages.required };
  }

  /* Si le champ est vide et pas required → on skip les autres règles */
  if (trimmed === "") return { valid: true, message: "" };

  /* Vérification minLength */
  if (rules.minLength && trimmed.length < rules.minLength) {
    return { valid: false, message: rules.messages.minLength };
  }

  /* Vérification pattern regex */
  if (rules.pattern && !rules.pattern.test(trimmed)) {
    return { valid: false, message: rules.messages.pattern };
  }

  return { valid: true, message: "" };
}

/*
  Pourquoi trimmed = value.trim() ?
  → Un utilisateur qui tape des espaces ne doit pas
  contourner la validation "required".
  On retire les espaces avant/après avant de valider.
*/

/* ----------------------------------------------------------
   3. UI — Affiche ou retire l'erreur sur un champ
---------------------------------------------------------- */

function showError(input, message) {
  const group = input.closest(".form-group");

  /*
    .closest() remonte dans le DOM jusqu'à trouver .form-group.
    C'est lui qui contient le label, l'input et le message d'erreur.
    On travaille toujours au niveau du groupe — pas de l'input seul.
  */

  input.classList.add("form-input--error");
  input.setAttribute("aria-invalid", "true");

  /*
    aria-invalid → accessibilité.
    Les lecteurs d'écran annoncent "invalide" sur ce champ.
  */

  let errorEl = group.querySelector(".form-error");

  if (!errorEl) {
    errorEl = document.createElement("span");
    errorEl.classList.add("form-error");
    errorEl.setAttribute("role", "alert");
    /*
      role="alert" → le lecteur d'écran lit immédiatement
      ce message sans que l'utilisateur doive naviguer jusqu'à lui.
    */
    group.appendChild(errorEl);
  }

  errorEl.textContent = message;
}

function clearError(input) {
  const group = input.closest(".form-group");

  input.classList.remove("form-input--error");
  input.removeAttribute("aria-invalid");

  const errorEl = group.querySelector(".form-error");
  if (errorEl) errorEl.remove();
}

/*
  On crée l'élément d'erreur dynamiquement → pas besoin
  de le mettre dans le HTML pour chaque champ.
  On le retire complètement quand le champ est valide —
  pas juste le cacher. Le DOM reste propre.
*/

/* ----------------------------------------------------------
   4. NOTIFICATION — Message global succès / erreur
---------------------------------------------------------- */

function showNotification(type, message) {
  /* Retire une notification existante si présente */
  const existing = document.querySelector(".form-notification");
  if (existing) existing.remove();

  const notification = document.createElement("div");
  notification.classList.add("form-notification", `form-notification--${type}`);
  notification.setAttribute("role", "alert");
  notification.textContent = message;

  /*
    On insère la notification AVANT le formulaire.
    L'utilisateur la voit sans scroller.
  */
  const form = document.querySelector(".contact-form");
  form.insertAdjacentElement("beforebegin", notification);

  /*
    insertAdjacentElement('beforebegin') → insère juste avant
    l'élément ciblé dans le DOM, sans modifier son contenu.
  */

  /* Disparition automatique après 5 secondes */
  setTimeout(() => {
    notification.classList.add("form-notification--hiding");
    /*
      On ajoute une classe "hiding" pour déclencher
      l'animation de disparition en CSS.
      On retire l'élément après l'animation (300ms).
    */
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

/* ----------------------------------------------------------
   5. INITIALISATION — Attache les événements au formulaire
---------------------------------------------------------- */

function initForm() {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  /*
    if (!form) return → défense.
    Si le formulaire n'existe pas sur la page,
    on s'arrête proprement. Pas d'erreur JS.
  */

  const inputs = form.querySelectorAll(".form-input, .form-textarea");

  /* Validation en temps réel — sur chaque champ */
  inputs.forEach((input) => {
    /* Au blur (quand on quitte le champ) → validation immédiate */
    input.addEventListener("blur", () => {
      const result = validateField(input.name, input.value);
      if (!result.valid) {
        showError(input, result.message);
      } else {
        clearError(input);
      }
    });

    /* À chaque frappe → si le champ était en erreur, on revalide */
    input.addEventListener("input", () => {
      if (input.classList.contains("form-input--error")) {
        const result = validateField(input.name, input.value);
        if (result.valid) clearError(input);
      }
    });

    /*
      Pourquoi blur ET input ?
      → blur : on ne valide pas pendant que l'utilisateur tape.
        C'est agressif — il n'a pas encore fini.
      → input : si une erreur est déjà affichée, on la retire
        dès que le champ redevient valide. Feedback positif immédiat.
      Les deux ensemble = UX optimale.
    */
  });

  /* Validation à la soumission */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    /*
      e.preventDefault() → empêche le rechargement de page.
      On gère l'envoi nous-mêmes.
    */

    let isValid = true;

    /* On valide tous les champs */
    inputs.forEach((input) => {
      const result = validateField(input.name, input.value);
      if (!result.valid) {
        showError(input, result.message);
        isValid = false;
      } else {
        clearError(input);
      }
    });

    if (!isValid) {
      /* Focus sur le premier champ en erreur */
      const firstError = form.querySelector(".form-input--error");
      if (firstError) firstError.focus();
      return;
    }

    /* Simulation d'envoi — à remplacer par un vrai fetch() */
    simulateSend(form);
  });
}

function simulateSend(form) {
  const btn = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);

  btn.disabled = true;
  btn.textContent = "Envoi en cours...";

  fetch(form.action, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (response.ok) {
        showNotification(
          "success",
          "✓ Message envoyé ! On vous répond sous 24h.",
        );
        form.reset();
      } else {
        throw new Error("Erreur serveur");
      }
    })
    .catch(() => {
      showNotification(
        "error",
        "✗ Une erreur est survenue. Écrivez-nous directement sur WhatsApp.",
      );
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = "Envoyer la demande";
    });
}

/* Lancement */
initForm();
