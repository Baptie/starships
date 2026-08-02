import { genererMessageFin } from "../engine/fin";
import type { RunState } from "../engine/types";
import { formatNombre, LABELS_STATUT_RUN } from "./format";
import { iconeIrridiumCompteur, iconeSlagCompteur } from "./icons";

export function rendreFin(
  racine: HTMLElement,
  run: RunState,
  gainConversion: number | null,
  onRejouer: () => void,
): void {
  const message = genererMessageFin(run);

  racine.innerHTML = `
    <main>
      <div class="carte fin">
        <h2 class="fin__titre">${LABELS_STATUT_RUN[run.statut]}</h2>
        <p class="fin__message">${message}</p>
        <div class="fin__recap">
          <div>Chapitre<strong>${run.chapitre}</strong></div>
          <div>Planètes<strong>${run.planetesDecouvertes}</strong></div>
          <div><span class="entete-icone">${iconeSlagCompteur(14)}<span>Slag</span></span><strong>${formatNombre(run.monnaieRun)}</strong></div>
          <div><span class="entete-icone">${iconeIrridiumCompteur(14)}<span>Irridium gagné</span></span><strong>${formatNombre(gainConversion ?? 0)}</strong></div>
        </div>
        <button class="bouton" data-action="rejouer" type="button">Retour à l'accueil</button>
      </div>
    </main>
  `;

  racine.querySelector('[data-action="rejouer"]')?.addEventListener("click", onRejouer);
}
