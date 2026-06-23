const formulaire = document.getElementById("formulaire");
const btnCopier = document.getElementById("btnCopier");
const btnSMS = document.getElementById("btnSMS");
const btnVider = document.getElementById("btnVider");
const retour = document.getElementById("retour");
const detailsDroits = document.getElementById("detailsDroits");
const blocDroitsDifferes = document.getElementById("blocDroitsDifferes");

function valeur(id) {
  const element = document.getElementById(id);
  return element ? element.value.trim() : "";
}


function valeurRadio(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : "Non";
}

function ligne(label, value) {
  return `${label} : ${value || "-"}`;
}

function construireAdresse() {
  const numero = valeur("numeroAdresse");
  const rue = valeur("rueAdresse");
  const codePostal = valeur("codePostal");
  const ville = valeur("ville");
  const ligne1 = [numero, rue].filter(Boolean).join(" ");
  const ligne2 = [codePostal, ville].filter(Boolean).join(" ");
  if (!ligne1 && !ligne2) return "-";
  return [ligne1, ligne2].filter(Boolean).join(", ");
}

function joursDansMois(mois, annee) {
  return new Date(annee, mois, 0).getDate();
}

function formaterDateProgressive(valeurBrute) {
  const chiffres = valeurBrute.replace(/\D/g, "").slice(0, 8);
  let jour = chiffres.slice(0, 2);
  let mois = chiffres.slice(2, 4);
  let annee = chiffres.slice(4, 8);

  if (jour.length === 1) {
    const j = parseInt(jour, 10);
    if (j > 3) jour = "0" + j;
  }
  if (jour.length === 2) {
    let j = parseInt(jour, 10);
    if (j < 1) j = 1;
    if (j > 31) j = 31;
    jour = String(j).padStart(2, "0");
  }
  if (mois.length === 1) {
    const m = parseInt(mois, 10);
    if (m > 1) mois = "0" + m;
  }
  if (mois.length === 2) {
    let m = parseInt(mois, 10);
    if (m < 1) m = 1;
    if (m > 12) m = 12;
    mois = String(m).padStart(2, "0");
  }
  if (jour.length === 2 && mois.length === 2 && annee.length === 4) {
    let j = parseInt(jour, 10);
    const m = parseInt(mois, 10);
    const a = parseInt(annee, 10);
    const maxJours = joursDansMois(m, a);
    if (j > maxJours) j = maxJours;
    jour = String(j).padStart(2, "0");
  }

  let resultat = "";
  if (jour) resultat += jour;
  if (mois) {
    resultat += "/" + mois;
  } else if (chiffres.length > 2) {
    resultat += "/";
  }
  if (annee) {
    resultat += "/" + annee;
  } else if (chiffres.length > 4) {
    resultat += "/";
  }
  return resultat;
}

function dateValide(dateTexte) {
  const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(\d{4})$/;
  if (!regex.test(dateTexte)) return false;
  const [, jourStr, moisStr, anneeStr] = dateTexte.match(regex);
  const jour = parseInt(jourStr, 10);
  const mois = parseInt(moisStr, 10);
  const annee = parseInt(anneeStr, 10);
  return jour <= joursDansMois(mois, annee);
}

function afficherRetour(texte, erreur = false) {
  if (!retour) return;
  retour.textContent = texte;
  retour.style.color = erreur ? "#b91c1c" : "#2563eb";
}

function afficherErreurDate(input, message) {
  input.style.borderColor = "#b91c1c";
  input.style.boxShadow = "0 0 0 3px rgba(185, 28, 28, 0.15)";
  afficherRetour(message, true);
}

function reinitialiserErreurDate(input) {
  input.style.borderColor = "";
  input.style.boxShadow = "";
  if (retour && retour.textContent.toLowerCase().includes("date")) {
    retour.textContent = "";
  }
}

function initialiserChampDate(id, libelle) {
  const input = document.getElementById(id);
  if (!input) return;

  input.addEventListener("input", () => {
    const nouvelleValeur = formaterDateProgressive(input.value);
    input.value = nouvelleValeur;
    reinitialiserErreurDate(input);
  });

  input.addEventListener("blur", () => {
    const valeurDate = input.value.trim();
    if (!valeurDate) {
      reinitialiserErreurDate(input);
      return;
    }
    if (!dateValide(valeurDate)) {
      afficherErreurDate(
        input,
        `La ${libelle.toLowerCase()} doit être au format JJ/MM/AAAA avec une date valide.`
      );
      return;
    }
    reinitialiserErreurDate(input);
  });
}

function verifierDatesAvantEnvoi() {
 const definitions = [
  { id: "dateNaissance", libelle: "Date de naissance" },
  { id: "datePlacement", libelle: "Date et heure du placement" },
  { id: "dateFaits", libelle: "Date des faits" }
];

  for (const def of definitions) {
    const input = document.getElementById(def.id);
    if (!input) continue;
    const valeurDate = input.value.trim();
    if (!valeurDate) continue;
    if (!dateValide(valeurDate)) {
      afficherErreurDate(
        input,
        `La ${def.libelle.toLowerCase()} doit être au format JJ/MM/AAAA avec une date valide.`
      );
      input.focus();
      return false;
    }
  }

  return true;
}

function appliquerMajusculeTotale(texte) {
  return texte.toUpperCase();
}

function appliquerCapitalisation(texte) {
  return texte
    .toLowerCase()
    .split(" ")
    .map((mot) => {
      if (!mot) return mot;
      return mot.charAt(0).toUpperCase() + mot.slice(1);
    })
    .join(" ");
}

function initialiserChampsMajuscules() {
  document.querySelectorAll(".champ-majuscule").forEach((champ) => {
    champ.addEventListener("input", (event) => {
      const position = event.target.selectionStart;
      event.target.value = appliquerMajusculeTotale(event.target.value);
      event.target.setSelectionRange(position, position);
    });
  });
}

function initialiserChampsCapitalises() {
  document.querySelectorAll(".champ-capitalise").forEach((champ) => {
    champ.addEventListener("input", (event) => {
      const position = event.target.selectionStart;
      event.target.value = appliquerCapitalisation(event.target.value);
      event.target.setSelectionRange(position, position);
    });
  });
}

function initialiserChampCodePostal() {
  const champ = document.getElementById("codePostal");
  if (!champ) return;
  champ.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 5);
  });
}

function formaterUPVA(valeurBrute) {
  return valeurBrute.replace(/[^0-9/]/g, "").slice(0, 17);
}

function initialiserChampUPVA() {
  const champ = document.getElementById("upva");
  if (!champ) return;
  champ.addEventListener("input", (event) => {
    const position = event.target.selectionStart;
    event.target.value = formaterUPVA(event.target.value);
    event.target.setSelectionRange(position, position);
  });
}

function formaterDateFR(date) {
  const jour = String(date.getDate()).padStart(2, "0");
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const annee = date.getFullYear();
  return `${jour}/${mois}/${annee}`;
}

function initialiserDatePlacement() {
  initialiserChampDate("datePlacement", "Date et heure du placement");
  const input = document.getElementById("datePlacement");
  if (!input) return;
  if (!input.value) input.value = formaterDateFR(new Date());
}

function construireDateHeurePlacement() {
  const datePlacement = valeur("datePlacement");
  const heurePlacement = valeur("heurePlacement");
  if (datePlacement && heurePlacement) return `${datePlacement} à ${heurePlacement}`;
  return datePlacement || heurePlacement || "-";
}

function construireTexte() {
  const droitsNotifies = valeurRadio("droitsNotifies");
  const lignes = [
    "PLACEMENT EN GARDE À VUE",
    "================================",
    "",
    ligne("Unité", valeur("unite")),
    ligne("UPVA", valeur("upva")),
    ligne("Date et heure du placement", construireDateHeurePlacement()),
    "",
    "IDENTITÉ",
    "--------------------------------",
    ligne("Nom", valeur("nom")),
    ligne("Prénom", valeur("prenom")),
    ligne("Date de naissance", valeur("dateNaissance")),
    ligne("Nom Père", valeur("nomPere")),
    ligne("Prénom Père", valeur("prenomPere")),
    ligne("Nom Mère", valeur("nomMere")),
    ligne("Prénom Mère", valeur("prenomMere")),
    ligne("Adresse", construireAdresse()),
    ligne("Profession", valeur("profession")),
    "",
    "FAITS",
    "--------------------------------",
    ligne("NATINF", valeur("natinf")),
    ligne("Libellé", valeur("libelle")),
    ligne("Date des faits", valeur("dateFaits")),
    ligne("Lieu des faits", valeur("lieuFaits")),
    "",
    "DROITS",
    "--------------------------------",
    ligne("Droits notifiés", droitsNotifies)
  ];

  if (droitsNotifies === "Non") {
    lignes.push(ligne("Droits différés", valeurRadio("droitsDifferes")));
  }

  if (droitsNotifies === "Oui") {
    lignes.push(
      ligne("Droit au silence", valeurRadio("droitSilence")),
      ligne("Médecin", valeurRadio("medecin")),
      ligne("Avocat", valeurRadio("avocat")),
      ligne("Famille", valeurRadio("famille")),
      ligne("Employeur", valeurRadio("employeur"))
    );
  }

  lignes.push(
    "",
    "ENQUÊTEUR",
    "--------------------------------",
    ligne("Grade", valeur("enqueteurGrade")),
    ligne("Nom", valeur("enqueteurNom")),
    ligne("Prénom", valeur("enqueteurPrenom")),
    ligne("Unité", valeur("enqueteurUnite"))
  );

  return lignes.join("\n");
}

function mettreAJourBlocDroits() {
  const droitsNotifies = valeurRadio("droitsNotifies");
  if (blocDroitsDifferes) blocDroitsDifferes.hidden = droitsNotifies !== "Non";
  if (detailsDroits) detailsDroits.hidden = droitsNotifies !== "Oui";
}

function formulaireContientDesDonnees() {
  const champsTexte = formulaire.querySelectorAll('input[type="text"], textarea');
  for (const champ of champsTexte) {
    if (champ.value.trim() !== "") return true;
  }

  const radiosOui = [
    "droitsNotifiesOui",
    "droitsDifferesOui",
    "droitSilenceOui",
    "medecinOui",
    "avocatOui",
    "familleOui",
    "employeurOui"
  ];

  return radiosOui.some((id) => {
    const radio = document.getElementById(id);
    return radio && radio.checked;
  });
}

function viderLesChamps() {
  const datePlacement = document.getElementById("datePlacement");
  const valeurDatePlacement = datePlacement ? datePlacement.value : "";

  formulaire.querySelectorAll('input[type="text"], textarea').forEach((champ) => {
    champ.value = "";
    champ.style.borderColor = "";
    champ.style.boxShadow = "";
  });

  if (datePlacement) {
  datePlacement.value = formaterDateFR(new Date());
}

  formulaire.querySelectorAll('input[type="radio"]').forEach((radio) => {
    radio.checked =
      radio.id === "droitsNotifiesNon" ||
      radio.id === "droitsDifferesNon" ||
      radio.id === "droitSilenceNon" ||
      radio.id === "medecinNon" ||
      radio.id === "avocatNon" ||
      radio.id === "familleNon" ||
      radio.id === "employeurNon";
  });

  mettreAJourBlocDroits();
  afficherRetour("Les champs ont été vidés.");

  const premierChamp = document.getElementById("unite");
  if (premierChamp) premierChamp.focus();
}

document.querySelectorAll('input[name="droitsNotifies"]').forEach((radio) => {
  radio.addEventListener("change", mettreAJourBlocDroits);
});

if (btnVider) {
  btnVider.addEventListener("click", () => {
    if (!formulaireContientDesDonnees()) {
      viderLesChamps();
      return;
    }
    const confirmation = window.confirm("Vider tous les champs de la fiche en cours ?");
    if (!confirmation) return;
    viderLesChamps();
  });
}

if (btnCopier) {
  btnCopier.addEventListener("click", async () => {
    if (!verifierDatesAvantEnvoi()) return;
    const texte = construireTexte();
    try {
      await navigator.clipboard.writeText(texte);
      afficherRetour("Texte copié dans le presse-papiers.");
    } catch (e) {
      afficherRetour("Impossible de copier automatiquement. Copiez le texte manuellement.", true);
    }
  });
}

if (btnSMS) {
  btnSMS.addEventListener("click", () => {
    if (!verifierDatesAvantEnvoi()) return;
    const corps = construireTexte();
    try {
      window.location.href = `sms:?body=${encodeURIComponent(corps)}`;
      afficherRetour("Ouverture de l’application SMS...");
    } catch (e) {
      afficherRetour("Impossible d’ouvrir l’application SMS sur cet appareil.", true);
    }
  });
}

function demarrer() {
  initialiserChampDate("dateNaissance", "Date de naissance");
  initialiserChampDate("dateFaits", "Date des faits");
  initialiserChampsMajuscules();
  initialiserChampsCapitalises();
  initialiserChampCodePostal();
  initialiserChampUPVA();
  initialiserDatePlacement();
  mettreAJourBlocDroits();
}

window.onload = demarrer;