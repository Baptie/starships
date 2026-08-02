import { avertissementStockageVu, marquerAvertissementStockageVu } from "../engine/persistence";

/** Affiché une seule fois, au tout premier lancement de l'application. */
export function afficherAvertissementPremierLancementSiNecessaire(): void {
  if (avertissementStockageVu()) return;

  const fond = document.createElement("div");
  fond.className = "modal-fond";
  fond.innerHTML = `
    <div class="modal">
      <h2>Avant de commencer</h2>
      <p class="muted">
        Vos données de jeu (progression, Irridium, trophées, historique) sont
        enregistrées uniquement sur cet appareil, dans le cache de votre
        navigateur. Elles ne sont envoyées ni sauvegardées ailleurs — si vous
        videz le cache ou changez d'appareil, elles seront perdues.
      </p>
      <button class="bouton" data-action="fermer" type="button">J'ai compris</button>
    </div>
  `;

  const fermer = (): void => {
    marquerAvertissementStockageVu();
    fond.remove();
  };
  fond.querySelector('[data-action="fermer"]')?.addEventListener("click", fermer);

  document.body.appendChild(fond);
}
