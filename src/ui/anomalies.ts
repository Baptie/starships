import { chargerTrophees } from "../engine/persistence";
import { creerCarteDetail, creerVignetteCarte, donneesCarte, telechargerCartePNG, type AnomalyCardData } from "./cards";
import { iconePlanete } from "./icons";

/** Modale de consultation des Anomalies rencontrées (vignettes -> carte détail), superposée à l'écran courant. */
export function ouvrirGalerieAnomalies(): void {
  const trophees = chargerTrophees();

  const fond = document.createElement("div");
  fond.className = "modal-fond";

  const modal = document.createElement("div");
  modal.className = "modal";

  const titre = document.createElement("h2");
  titre.className = "entete-icone";
  titre.innerHTML = `${iconePlanete()}<span>Anomalies rencontrées</span>`;

  const conteneur = document.createElement("div");

  const fermerBtn = document.createElement("button");
  fermerBtn.className = "bouton bouton--secondaire";
  fermerBtn.type = "button";
  fermerBtn.textContent = "Fermer";

  function afficherGrille(): void {
    conteneur.innerHTML = "";
    if (trophees.length === 0) {
      const vide = document.createElement("p");
      vide.className = "muted";
      vide.textContent = "Aucune anomalie rencontrée pour l'instant.";
      conteneur.appendChild(vide);
      return;
    }
    const grille = document.createElement("div");
    grille.className = "grille-cartes";
    for (const trophee of trophees) {
      const data = donneesCarte(trophee);
      grille.appendChild(creerVignetteCarte(data, afficherDetail));
    }
    conteneur.appendChild(grille);
  }

  function afficherDetail(data: AnomalyCardData): void {
    conteneur.innerHTML = "";
    conteneur.appendChild(creerCarteDetail(data));

    const telecharger = document.createElement("button");
    telecharger.className = "bouton";
    telecharger.type = "button";
    telecharger.textContent = "Télécharger en PNG";
    telecharger.addEventListener("click", () => {
      telecharger.disabled = true;
      telecharger.textContent = "Export en cours…";
      telechargerCartePNG(data)
        .catch(() => {
          /* export échoué : on laisse simplement le joueur réessayer */
        })
        .finally(() => {
          telecharger.disabled = false;
          telecharger.textContent = "Télécharger en PNG";
        });
    });

    const retour = document.createElement("button");
    retour.className = "bouton bouton--secondaire";
    retour.type = "button";
    retour.textContent = "Retour à la collection";
    retour.addEventListener("click", afficherGrille);

    conteneur.append(telecharger, retour);
  }

  afficherGrille();
  modal.append(titre, conteneur, fermerBtn);
  fond.appendChild(modal);

  const fermer = (): void => fond.remove();
  fond.addEventListener("click", (evenement) => {
    if (evenement.target === fond) fermer();
  });
  fermerBtn.addEventListener("click", fermer);

  document.body.appendChild(fond);
}
