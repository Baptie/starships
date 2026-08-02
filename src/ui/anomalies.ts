import { genererDescription } from "../engine/planetGenerator";
import { chargerTrophees } from "../engine/persistence";
import { iconePlanete } from "./icons";
import { imagePlanete } from "./planetImage";

/** Modale de consultation des Anomalies rencontrées, superposée à l'écran courant. */
export function ouvrirGalerieAnomalies(): void {
  const trophees = chargerTrophees();

  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.innerHTML = `
    <div class="modal">
      <h2 class="entete-icone">${iconePlanete()}<span>Anomalies rencontrées</span></h2>
      ${
        trophees.length === 0
          ? '<p class="muted">Aucune anomalie rencontrée pour l\'instant.</p>'
          : trophees
              .map(
                (trophee) => `
            <div class="trophee-carte entete-icone">
              <img src="${imagePlanete(trophee.caracteristiques, "anomalie")}" width="40" height="40" class="icone icone--image" alt="" />
              <div>
                <div class="trophee-carte__nom">${trophee.nom}</div>
                <div class="muted">${genererDescription(trophee.caracteristiques)}</div>
              </div>
            </div>`,
              )
              .join("")
      }
      <button class="bouton bouton--secondaire" data-action="fermer" type="button">Fermer</button>
    </div>
  `;

  const fermer = (): void => fond.remove();
  fond.addEventListener("click", (evenement) => {
    if (evenement.target === fond) fermer();
  });
  fond.querySelector('[data-action="fermer"]')?.addEventListener("click", fermer);

  document.body.appendChild(fond);
}
