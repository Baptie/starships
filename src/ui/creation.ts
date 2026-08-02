import { ETAPES_CREATION } from "../data/creation";
import { skillsParDefaut, transfererSkill } from "../engine/skillAllocation";
import { SKILL_NAMES, type Skills } from "../engine/types";
import { LABELS_STAT } from "./format";
import { iconeStat } from "./icons";

export function rendreCreation(racine: HTMLElement, onTermine: (skills: Skills) => void): void {
  let skills: Skills = skillsParDefaut();
  let index = 0;

  function rendreEtape(): void {
    const etape = ETAPES_CREATION[index];
    if (!etape) {
      rendreRecap();
      return;
    }

    racine.innerHTML = `
      <main>
        <div class="carte">
          <div class="progression">
            ${ETAPES_CREATION.map(
              (_, i) => `<span class="progression__point ${i < index ? "progression__point--fait" : ""}"></span>`,
            ).join("")}
          </div>
          <span class="muted">Création du vaisseau</span>
          <h2>${etape.question}</h2>
          <div class="options">
            ${etape.options
              .map(
                (option, i) => `
              <button class="option-btn" data-index="${i}" type="button">
                <span class="option-btn__titre entete-icone">${iconeStat(option.gagne, 18)}<span>${option.label}</span></span>
                <span class="option-btn__detail">${option.description}</span>
              </button>`,
              )
              .join("")}
          </div>
        </div>
      </main>
    `;

    racine.querySelectorAll<HTMLButtonElement>(".option-btn").forEach((bouton) => {
      bouton.addEventListener("click", () => {
        const i = Number(bouton.dataset.index);
        const option = etape.options[i];
        if (!option) return;
        skills = transfererSkill(skills, option.gagne, option.perd, option.montant);
        index += 1;
        rendreEtape();
      });
    });
  }

  function rendreRecap(): void {
    racine.innerHTML = `
      <main>
        <div class="carte">
          <span class="muted">Équipage constitué</span>
          <h2>Prêt à décoller</h2>
          <div class="repartition">
            ${SKILL_NAMES.map(
              (nom) => `
              <div class="repartition__ligne">
                <div class="repartition__entete"><span class="entete-icone">${iconeStat(nom, 16)}<span>${LABELS_STAT[nom]}</span></span><span>${skills[nom]}</span></div>
                <div class="jauge__barre"><div class="jauge__remplissage" style="width:${skills[nom]}%"></div></div>
              </div>`,
            ).join("")}
          </div>
          <button class="bouton" data-action="decoller" type="button">Décoller</button>
          <button class="bouton bouton--secondaire" data-action="recommencer" type="button">Recommencer</button>
        </div>
      </main>
    `;

    racine.querySelector('[data-action="decoller"]')?.addEventListener("click", () => onTermine(skills));
    racine.querySelector('[data-action="recommencer"]')?.addEventListener("click", () => {
      skills = skillsParDefaut();
      index = 0;
      rendreEtape();
    });
  }

  rendreEtape();
}
