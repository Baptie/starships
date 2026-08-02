import type { RunState } from "../engine/types";
import { formatNombre } from "./format";
import { iconeCarburant, iconeCoque, iconeMoral, iconeReputation, iconeSlagCompteur } from "./icons";

function classeRemplissage(valeur: number): string {
  if (valeur <= 20) return "jauge__remplissage jauge__remplissage--critique";
  if (valeur <= 50) return "jauge__remplissage jauge__remplissage--faible";
  return "jauge__remplissage";
}

function jauge(icone: string, label: string, valeur: number): string {
  const pct = Math.max(0, Math.min(100, valeur));
  return `
    <div class="jauge">
      <div class="jauge__label">${icone}<span>${label}</span><span>${Math.round(valeur)}</span></div>
      <div class="jauge__barre"><div class="${classeRemplissage(valeur)}" style="width:${pct}%"></div></div>
    </div>
  `;
}

export function rendreJauges(run: RunState): string {
  return `
    <div class="jauges">
      <div class="jauges__entete">
        <span>Chapitre ${run.chapitre} — <strong>${run.nomGalaxie}</strong></span>
        <span class="entete-icone">${iconeSlagCompteur(16)}<strong>${formatNombre(run.monnaieRun)}</strong></span>
      </div>
      <div class="jauges__grille">
        ${jauge(iconeCarburant(14), "Carburant", run.stats.carburant)}
        ${jauge(iconeCoque(14), "Coque", run.stats.coque)}
      </div>
      <div class="stats-secondaires">
        <span class="entete-icone">${iconeMoral(14)}<strong>${run.stats.moral}</strong></span>
        <span class="entete-icone">${iconeReputation(14)}<strong>${run.stats.reputation}</strong></span>
        <span>Planètes <strong>${run.planetesDecouvertes}</strong></span>
      </div>
    </div>
  `;
}
