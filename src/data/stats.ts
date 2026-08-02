import type { ShipStats, Skills } from "../engine/types";

/** Onglet "Statistiques" de docs/calibrage.xlsx. */

export const STATS_INITIALES: ShipStats = {
  carburant: 100,
  coque: 100,
  moral: 70,
  reputation: 50,
};

export const MONNAIE_RUN_INITIALE = 2000;

export const FORMULE = {
  pointNeutreSkill: 50,
  coefficientProbabiliteParSkill: 0.7,
  plancherProbabilite: 5,
  plafondProbabilite: 95,
  fenetreCritReussiteBase: 5,
  fenetreCritReussiteBonusASkill100: 10,
  fenetreCritEchecBaseASkill0: 15,
  multiplicateurCritique: 2,
} as const;

/** Répartition des skills au début du run. */
export const GENERATION_SKILLS = {
  budgetTotal: 200,
  valeurMin: 20,
  valeurMax: 80,
} as const;

export const SKILLS_INITIALES_NULLES: Skills = {
  combat: 0,
  mecanique: 0,
  relationnel: 0,
  exploration: 0,
};

/** Bornes de P_base recommandées, à utiliser pour calibrer de nouvelles options. */
export const P_BASE = {
  securisee: 85,
  facile: 60,
  moyenne: 45,
  difficile: 30,
} as const;

/** Solde versé par la station commanditaire à l'ouverture de chaque chapitre. */
export const SOLDE_CHAPITRE = 5000;

export const EVENEMENTS_PAR_CHAPITRE = { min: 2, max: 4 } as const;
