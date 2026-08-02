import { chargerHistorique } from "../engine/persistence";
import { formatNombre, LABELS_STATUT_RUN } from "./format";
import { iconeIrridiumCompteur, iconePlanete, iconeSlagCompteur } from "./icons";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Modale de consultation de l'historique des runs, superposée à l'écran courant. */
export function ouvrirHistorique(): void {
  const historique = chargerHistorique();

  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.innerHTML = `
    <div class="modal">
      <h2 class="entete-icone">${iconePlanete()}<span>Historique des runs</span></h2>
      ${
        historique.length === 0
          ? '<p class="muted">Aucun run terminé pour l\'instant.</p>'
          : historique
              .map(
                (entree) => `
            <div class="trophee-carte">
              <div class="trophee-carte__nom">${LABELS_STATUT_RUN[entree.statut]}</div>
              <div class="muted">${formatDate(entree.date)} — ${entree.nomGalaxie}, chapitre ${entree.chapitre}, ${entree.planetesDecouvertes} planète(s)</div>
              <ul class="effets" style="margin-top:0.4rem">
                <li class="effet">${iconeSlagCompteur(14)}<span>Slag ${formatNombre(entree.slagFinal)}</span></li>
                ${
                  entree.irridiumGagne > 0
                    ? `<li class="effet effet--gain">${iconeIrridiumCompteur(14)}<span>Irridium +${formatNombre(entree.irridiumGagne)}</span></li>`
                    : ""
                }
              </ul>
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
