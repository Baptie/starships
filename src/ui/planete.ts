import type { Planete } from "../engine/planetGenerator";
import type { ResultatExploration } from "../engine/state";
import type { RunState } from "../engine/types";
import { formatNombre, LABELS_TYPE_PLANETE } from "./format";
import { rendreJauges } from "./gauges";
import { iconeCoque, iconeIrridium, iconePlanete, iconeSlag } from "./icons";
import { rendreIllustrationPlanete } from "./planetImage";

export function rendrePlaneteDetection(
  racine: HTMLElement,
  run: RunState,
  planete: Planete,
  actions: { onExplorer: () => void; onScanner: () => void; onIgnorer: () => void },
): void {
  racine.innerHTML = `
    ${rendreJauges(run)}
    <main>
      <div class="carte">
        <span class="muted entete-icone">${iconePlanete()}Planète détectée</span>
        ${rendreIllustrationPlanete(planete.caracteristiques)}
        <h2>${planete.nom}</h2>
        <p>${planete.description}</p>
        <div class="options">
          <button class="option-btn" data-action="explorer" type="button">
            <span class="option-btn__titre">Explorer</span>
            <span class="option-btn__detail">Risque et récompense — le type de la planète est révélé</span>
          </button>
          <button class="option-btn" data-action="scanner" type="button">
            <span class="option-btn__titre">Scanner à distance</span>
            <span class="option-btn__detail">Gain sûr et faible, planète comptée</span>
          </button>
          <button class="option-btn" data-action="ignorer" type="button">
            <span class="option-btn__titre">Ignorer</span>
            <span class="option-btn__detail">Aucun effet, planète non comptée</span>
          </button>
        </div>
      </div>
    </main>
  `;

  racine.querySelector('[data-action="explorer"]')?.addEventListener("click", actions.onExplorer);
  racine.querySelector('[data-action="scanner"]')?.addEventListener("click", actions.onScanner);
  racine.querySelector('[data-action="ignorer"]')?.addEventListener("click", actions.onIgnorer);
}

export function rendreResultatScan(
  racine: HTMLElement,
  run: RunState,
  planete: Planete,
  gain: number,
  onContinuer: () => void,
): void {
  racine.innerHTML = `
    ${rendreJauges(run)}
    <main>
      <div class="carte">
        <span class="muted entete-icone">${iconePlanete()}Scan à distance</span>
        ${rendreIllustrationPlanete(planete.caracteristiques)}
        <h2>${planete.nom}</h2>
        <p class="muted">${planete.description}</p>
        <ul class="effets">
          <li class="effet effet--gain">${iconeSlag(14)}<span>Slag +${formatNombre(gain)}</span></li>
        </ul>
        <button class="bouton" data-action="continuer" type="button">Continuer</button>
      </div>
    </main>
  `;

  racine.querySelector('[data-action="continuer"]')?.addEventListener("click", onContinuer);
}

export function rendreResultatPlanete(
  racine: HTMLElement,
  run: RunState,
  planete: Planete,
  resultat: ResultatExploration,
  actions: { onContinuer: () => void; onInstaller?: () => void },
): void {
  const { resolution, nouveauTrophee } = resultat;
  const lignes: string[] = [];

  if (resolution.monnaieRunGagnee > 0) {
    lignes.push(
      `<li class="effet effet--gain">${iconeSlag(14)}<span>Slag +${formatNombre(resolution.monnaieRunGagnee)}</span></li>`,
    );
  }
  if (resolution.monnaieRunPerduePourcent > 0) {
    lignes.push(
      `<li class="effet effet--perte">${iconeSlag(14)}<span>Slag -${resolution.monnaieRunPerduePourcent}%</span></li>`,
    );
  }
  if (resolution.coque.explosion) {
    lignes.push(`<li class="effet effet--perte">${iconeCoque(14)}<span>Coque détruite — explosion</span></li>`);
  } else if (resolution.coque.nouvelleValeur !== null) {
    lignes.push(
      `<li class="effet effet--perte">${iconeCoque(14)}<span>Coque ramenée à ${resolution.coque.nouvelleValeur}</span></li>`,
    );
  }
  if (nouveauTrophee) {
    lignes.push(`<li class="effet effet--gain">${iconePlanete(14)}<span>Nouveau trophée !</span></li>`);
  }
  if (resolution.irridiumGagne > 0) {
    lignes.push(
      `<li class="effet effet--gain">${iconeIrridium(14)}<span>Irridium +${formatNombre(resolution.irridiumGagne)}</span></li>`,
    );
  }

  const estParadisiaque = resolution.type === "paradisiaque" && run.statut === "en_cours";

  racine.innerHTML = `
    ${rendreJauges(run)}
    <main>
      <div class="carte">
        <span class="muted">Type de planète</span>
        ${rendreIllustrationPlanete(planete.caracteristiques, 96, resolution.type)}
        <h2>${LABELS_TYPE_PLANETE[resolution.type]}</h2>
        <p class="muted">${planete.nom} — ${planete.description}</p>
        <ul class="effets">${lignes.join("")}</ul>
        ${lignes.length === 0 ? '<p class="muted">Aucun effet.</p>' : ""}
        ${
          estParadisiaque
            ? `
          <button class="bouton" data-action="installer" type="button">S'installer ici</button>
          <button class="bouton bouton--secondaire" data-action="continuer" type="button">Reprendre la route</button>
        `
            : `<button class="bouton" data-action="continuer" type="button">Continuer</button>`
        }
      </div>
    </main>
  `;

  racine.querySelector('[data-action="continuer"]')?.addEventListener("click", actions.onContinuer);
  if (estParadisiaque && actions.onInstaller) {
    racine.querySelector('[data-action="installer"]')?.addEventListener("click", actions.onInstaller);
  }
}
