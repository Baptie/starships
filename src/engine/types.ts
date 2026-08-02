export type SkillName = "combat" | "mecanique" | "relationnel" | "exploration";

export const SKILL_NAMES: readonly SkillName[] = [
  "combat",
  "mecanique",
  "relationnel",
  "exploration",
];

export interface Skills {
  combat: number;
  mecanique: number;
  relationnel: number;
  exploration: number;
}

/** Toute cible d'un coût, gain ou perte : jauges, stats, monnaie ou skill. */
export type StatKey =
  | "carburant"
  | "coque"
  | "moral"
  | "reputation"
  | "monnaieRun"
  | SkillName;

export interface ShipStats {
  carburant: number;
  coque: number;
  moral: number;
  reputation: number;
}

/** Montant fixe, ou fourchette [min, max] tirée au hasard. */
export type Montant = number | readonly [number, number];

export interface Effet {
  stat: StatKey;
  montant: Montant;
}

export interface Cout {
  stat: StatKey;
  montant: number;
}

export type TypeOption = "aleatoire" | "deterministe";

export interface EventOption {
  id: string;
  label: string;
  type: TypeOption;
  /** null pour les options déterministes (marquées "—" au calibrage). */
  skillGouvernant: SkillName | null;
  /** null pour les options déterministes : pas de jet, effets toujours appliqués. */
  pBase: number | null;
  cout: Cout | null;
  gains: readonly Effet[];
  pertes: readonly Effet[];
  note: string | null;
}

export interface GameEvent {
  id: string;
  categorie: string;
  nom: string;
  options: readonly EventOption[];
}

export type IssueResolution = "reussite_critique" | "reussite" | "echec" | "echec_critique";

export interface EffetApplique {
  stat: StatKey;
  montant: number;
}

export interface ResolutionResult {
  issue: IssueResolution;
  jet: number | null;
  pFinal: number | null;
  /** Coût prélevé, appliqué quelle que soit l'issue — distinct des gains/pertes. */
  coutApplique: EffetApplique | null;
  effets: readonly EffetApplique[];
}

export type SlotEvenement =
  | { type: "narratif"; evenement: GameEvent }
  | { type: "planete" };

export type StatutRun = "en_cours" | "victoire" | "defaite_carburant" | "defaite_coque";

export interface RunState {
  chapitre: number;
  nomGalaxie: string;
  stats: ShipStats;
  skills: Skills;
  monnaieRun: number;
  planetesDecouvertes: number;
  fileEvenements: SlotEvenement[];
  slotCourant: SlotEvenement | null;
  dernierEvenementNom: string | null;
  statut: StatutRun;
}
