import { GENERATION_SKILLS } from "../data/stats";
import { tirerEntier } from "./random";
import { SKILL_NAMES, type SkillName, type Skills } from "./types";

/** Répartition égale : 200 / 4 = 50, dans les bornes [20, 80]. */
export function skillsParDefaut(): Skills {
  return { combat: 50, mecanique: 50, relationnel: 50, exploration: 50 };
}

export function repartitionValide(skills: Skills): boolean {
  const total = SKILL_NAMES.reduce((somme, nom) => somme + skills[nom], 0);
  if (total !== GENERATION_SKILLS.budgetTotal) return false;
  return SKILL_NAMES.every(
    (nom) => skills[nom] >= GENERATION_SKILLS.valeurMin && skills[nom] <= GENERATION_SKILLS.valeurMax,
  );
}

/**
 * Répartition aléatoire respectant le budget total et les bornes par skill,
 * par tirage-rejet (le budget tombe pile sur la moyenne des bornes, donc peu
 * d'itérations en pratique). Repli sur la répartition égale au pire cas.
 */
export function skillsAleatoires(): Skills {
  const { valeurMin, valeurMax, budgetTotal } = GENERATION_SKILLS;
  for (let tentative = 0; tentative < 200; tentative++) {
    const valeurs = SKILL_NAMES.map(() => tirerEntier(valeurMin, valeurMax));
    const total = valeurs.reduce((a, b) => a + b, 0);
    if (total === budgetTotal) {
      return {
        combat: valeurs[0]!,
        mecanique: valeurs[1]!,
        relationnel: valeurs[2]!,
        exploration: valeurs[3]!,
      };
    }
  }
  return skillsParDefaut();
}

/**
 * Transfère `montant` points de `perd` vers `gagne`, borné à ce que `perd`
 * peut céder et à ce que `gagne` peut recevoir sans sortir de [min, max].
 * Le total (200) est préservé quel que soit l'ordre ou le nombre d'appels —
 * c'est ce qui rend le parcours de création du vaisseau (src/data/creation.ts)
 * toujours valide, sans jamais avoir à vérifier le budget après coup.
 */
export function transfererSkill(skills: Skills, gagne: SkillName, perd: SkillName, montant: number): Skills {
  const { valeurMin, valeurMax } = GENERATION_SKILLS;
  const dispo = Math.max(0, Math.min(montant, skills[perd] - valeurMin, valeurMax - skills[gagne]));
  return { ...skills, [gagne]: skills[gagne] + dispo, [perd]: skills[perd] - dispo };
}
