import { chargerMonnaiePersistante, chargerTrophees } from "../engine/persistence";
import { iconeAnomalie, iconeIrridiumCompteur } from "./icons";
import { ouvrirGalerieAnomalies } from "./anomalies";
import { ouvrirBoutique } from "./boutique";
import { ouvrirHistorique } from "./historique";

export function rendreAccueil(racine: HTMLElement, onNouveauDepart: () => void): void {
  const irridium = chargerMonnaiePersistante();
  const trophees = chargerTrophees().length;

  racine.innerHTML = `
    <main>
      <div class="carte">
        <div class="entete-icone">
          <img src="/assets/starships_logo.png" width="32" height="32" class="icone icone--image" alt="" aria-hidden="true" />
          <h1>Starships</h1>
        </div>
        <p class="muted">Dirigez un vaisseau et son équipage à travers des galaxies générées. Découvrez un maximum de planètes avant de perdre le vaisseau — ou trouvez un monde où vous installer.</p>
      </div>
      <div class="carte">
        <span class="entete-icone muted">${iconeIrridiumCompteur(16)}<span>Irridium : <strong>${irridium}</strong></span></span>
        <button class="bouton bouton--secondaire entete-icone" data-action="anomalies" type="button" style="justify-content:center">${iconeAnomalie()}<span>Anomalies rencontrées (${trophees})</span></button>
        <button class="bouton bouton--secondaire" data-action="historique" type="button">Historique des runs</button>
        <button class="bouton bouton--secondaire" data-action="boutique" type="button">Boutique</button>
      </div>
      <div class="carte">
        <button class="bouton" data-action="nouveau-depart" type="button">Nouveau départ</button>
      </div>
    </main>
  `;

  racine.querySelector('[data-action="nouveau-depart"]')?.addEventListener("click", onNouveauDepart);
  racine.querySelector('[data-action="anomalies"]')?.addEventListener("click", () => ouvrirGalerieAnomalies());
  racine.querySelector('[data-action="historique"]')?.addEventListener("click", () => ouvrirHistorique());
  racine.querySelector('[data-action="boutique"]')?.addEventListener("click", () => ouvrirBoutique());
}
