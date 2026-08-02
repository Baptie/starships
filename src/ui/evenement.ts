import { MESSAGES_OPTIONS } from "../data/eventMessages";
import type { EventOption, GameEvent, IssueResolution, ResolutionResult, RunState } from "../engine/types";
import { formatEffet, formatNombre, LABELS_STAT } from "./format";
import { rendreJauges } from "./gauges";
import { iconeCategorie, iconeStat } from "./icons";

const LABELS_ISSUE: Record<IssueResolution, string> = {
  reussite_critique: "Réussite critique",
  reussite: "Réussite",
  echec: "Échec",
  echec_critique: "Échec critique",
};

function detailOption(option: EventOption): string {
  return option.skillGouvernant ? LABELS_STAT[option.skillGouvernant] : "";
}

function badgeCout(option: EventOption): string {
  if (!option.cout) return "";
  const { stat, montant } = option.cout;
  return `<span class="cout-badge">${iconeStat(stat, 13)}− ${formatNombre(montant)} ${LABELS_STAT[stat]}</span>`;
}

export function rendreEvenement(
  racine: HTMLElement,
  run: RunState,
  evenement: GameEvent,
  onChoisir: (option: EventOption) => void,
): void {
  racine.innerHTML = `
    ${rendreJauges(run)}
    <main>
      <div class="carte">
        <span class="muted entete-icone">${iconeCategorie(evenement.categorie)}${evenement.categorie}</span>
        <h2>${evenement.nom}</h2>
        <div class="options">
          ${evenement.options
            .map(
              (option, index) => `
            <button class="option-btn" data-index="${index}" type="button">
              <span class="option-btn__titre">${option.label}</span>
              <span class="option-btn__detail">${detailOption(option)}</span>
              ${badgeCout(option)}
            </button>`,
            )
            .join("")}
        </div>
      </div>
    </main>
  `;

  racine.querySelectorAll<HTMLButtonElement>(".option-btn").forEach((bouton) => {
    bouton.addEventListener("click", () => {
      const index = Number(bouton.dataset.index);
      const option = evenement.options[index];
      if (option) onChoisir(option);
    });
  });
}

function phraseResultat(option: EventOption, issue: IssueResolution): string | null {
  const messages = MESSAGES_OPTIONS[option.id];
  if (!messages) return null;
  if (messages.resultat) return messages.resultat;
  switch (issue) {
    case "reussite_critique":
      return messages.reussiteCritique ?? messages.reussite ?? null;
    case "reussite":
      return messages.reussite ?? null;
    case "echec":
      return messages.echec ?? null;
    case "echec_critique":
      return messages.echecCritique ?? messages.echec ?? null;
  }
}

export function rendreResultatEvenement(
  racine: HTMLElement,
  run: RunState,
  option: EventOption,
  resultat: ResolutionResult,
  onContinuer: () => void,
): void {
  const phrase = phraseResultat(option, resultat.issue);

  racine.innerHTML = `
    ${rendreJauges(run)}
    <main>
      <div class="carte">
        ${
          resultat.pFinal !== null
            ? `<span class="issue issue--${resultat.issue}">${LABELS_ISSUE[resultat.issue]}</span>`
            : ""
        }
        <h2>${option.label}</h2>
        ${phrase ? `<p>${phrase}</p>` : ""}
        <ul class="effets">
          ${resultat.effets
            .map(
              (e) =>
                `<li class="effet ${e.montant >= 0 ? "effet--gain" : "effet--perte"}">${iconeStat(e.stat, 14)}<span>${formatEffet(e.stat, e.montant)}</span></li>`,
            )
            .join("")}
        </ul>
        ${resultat.effets.length === 0 ? '<p class="muted">Aucun autre effet.</p>' : ""}
        <button class="bouton" data-action="continuer" type="button">Continuer</button>
      </div>
    </main>
  `;

  racine.querySelector('[data-action="continuer"]')?.addEventListener("click", onContinuer);
}
