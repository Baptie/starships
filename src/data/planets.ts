/**
 * Onglet "Planetes" de docs/calibrage.xlsx — table des types de planète,
 * caractéristiques combinables et génération du nom.
 */

export type Climat = "Infernal" | "Chaud" | "Tempéré" | "Froid" | "Glacial";
/**
 * "Désert" est un terrain générique : sa variante d'affichage et de rendu
 * (glacé / volcanique / rocailleux) est dérivée du climat, pas tirée
 * indépendamment — sinon on obtient des absurdités type "désert glacé"
 * sous climat Chaud. Voir `varianteDesert`/`libelleTerrain` ci-dessous.
 */
export type Terrain = "Eau" | "Jungle" | "Désert" | "Gaz";
export type Atmosphere = "Inexistante" | "Toxique" | "Irrespirable" | "Respirable" | "Dense";
export type Systeme = "Errante" | "1 soleil" | "2 soleils" | "3 soleils" | "Trou noir" | "Étoile à neutrons";
export type Ecosysteme =
  | "Pas de vie"
  | "Vie primitive"
  | "Vie animale"
  | "Vie intelligente"
  | "Société complexe établie";

export type TypePlanete = "classique" | "anomalie" | "paradisiaque" | "infernale";

export interface CaracteristiquesPlanete {
  climat: Climat;
  terrain: Terrain;
  atmosphere: Atmosphere;
  systeme: Systeme;
  ecosysteme: Ecosysteme;
}

export interface OptionPonderee<T> {
  readonly valeur: T;
  readonly poids: number;
}

export const TYPES_PLANETE: Record<
  TypePlanete,
  { probabilite: number; gainRunMin: number; gainRunMax: number; trophee: boolean }
> = {
  classique: { probabilite: 50, gainRunMin: 2000, gainRunMax: 5000, trophee: false },
  anomalie: { probabilite: 10, gainRunMin: 15000, gainRunMax: 20000, trophee: true },
  paradisiaque: { probabilite: 20, gainRunMin: 0, gainRunMax: 0, trophee: false },
  infernale: { probabilite: 20, gainRunMin: 0, gainRunMax: 0, trophee: false },
};

/** Gain sûr du "Scanner à distance" (fourchette) ; la planète est comptée. */
export const GAIN_SCAN_DISTANCE = { min: 500, max: 1500 } as const;

/**
 * Victoire (installation sur une Paradisiaque) : 1 Irridium par tranche de
 * Slag détenu, arrondi à l'entier inférieur. Remplace l'ancien taux de
 * conversion à 0,01 % (point ouvert #2 du cadrage).
 */
export const SLAG_PAR_IRRIDIUM_VICTOIRE = 10000;

/** Irridium gagné à chaque Anomalie rencontrée (indépendant du Slag détenu). */
export const IRRIDIUM_ANOMALIE = 10;

export const INFERNALE = {
  perteMonnaieRunPourcent: 50,
  coquePlancherPourcent: 10,
} as const;

export interface TablesCaracteristiques {
  climat: readonly OptionPonderee<Climat>[];
  terrain: readonly OptionPonderee<Terrain>[];
  atmosphere: readonly OptionPonderee<Atmosphere>[];
  systeme: readonly OptionPonderee<Systeme>[];
  ecosysteme: readonly OptionPonderee<Ecosysteme>[];
}

/**
 * Point ouvert #4 (CLAUDE.md) : pondération de rareté non définie au
 * cadrage. Résolu ici en conditionnant les 5 caractéristiques au type de
 * planète déjà tiré, pour que le décor reste cohérent avec le type
 * (ex. une Paradisiaque tire rarement un climat Infernal). Poids relatifs,
 * pas besoin de sommer à 100 (tirerPondere normalise).
 */
export const CARACTERISTIQUES_PAR_TYPE: Record<TypePlanete, TablesCaracteristiques> = {
  // Aucun biais : gamme "normale", aussi large que les 4 autres types réunis.
  classique: {
    climat: [
      { valeur: "Infernal", poids: 1 },
      { valeur: "Chaud", poids: 1 },
      { valeur: "Tempéré", poids: 1 },
      { valeur: "Froid", poids: 1 },
      { valeur: "Glacial", poids: 1 },
    ],
    terrain: [
      { valeur: "Eau", poids: 1 },
      { valeur: "Jungle", poids: 1 },
      { valeur: "Désert", poids: 2 },
      { valeur: "Gaz", poids: 1 },
    ],
    atmosphere: [
      { valeur: "Inexistante", poids: 1 },
      { valeur: "Toxique", poids: 1 },
      { valeur: "Irrespirable", poids: 1 },
      { valeur: "Respirable", poids: 1 },
      { valeur: "Dense", poids: 1 },
    ],
    systeme: [
      { valeur: "Errante", poids: 1 },
      { valeur: "1 soleil", poids: 1 },
      { valeur: "2 soleils", poids: 1 },
      { valeur: "3 soleils", poids: 1 },
      { valeur: "Trou noir", poids: 1 },
      { valeur: "Étoile à neutrons", poids: 1 },
    ],
    ecosysteme: [
      { valeur: "Pas de vie", poids: 1 },
      { valeur: "Vie primitive", poids: 1 },
      { valeur: "Vie animale", poids: 1 },
      { valeur: "Vie intelligente", poids: 1 },
      { valeur: "Société complexe établie", poids: 1 },
    ],
  },
  // Monde hospitalier : climat tempéré, eau/végétation, air respirable, étoile(s) stable(s), vie développée.
  paradisiaque: {
    climat: [
      { valeur: "Infernal", poids: 1 },
      { valeur: "Chaud", poids: 4 },
      { valeur: "Tempéré", poids: 6 },
      { valeur: "Froid", poids: 2 },
      { valeur: "Glacial", poids: 1 },
    ],
    terrain: [
      { valeur: "Eau", poids: 5 },
      { valeur: "Jungle", poids: 5 },
      { valeur: "Désert", poids: 3 },
      { valeur: "Gaz", poids: 1 },
    ],
    atmosphere: [
      { valeur: "Inexistante", poids: 1 },
      { valeur: "Toxique", poids: 1 },
      { valeur: "Irrespirable", poids: 1 },
      { valeur: "Respirable", poids: 8 },
      { valeur: "Dense", poids: 3 },
    ],
    systeme: [
      { valeur: "Errante", poids: 1 },
      { valeur: "1 soleil", poids: 5 },
      { valeur: "2 soleils", poids: 4 },
      { valeur: "3 soleils", poids: 2 },
      { valeur: "Trou noir", poids: 1 },
      { valeur: "Étoile à neutrons", poids: 1 },
    ],
    ecosysteme: [
      { valeur: "Pas de vie", poids: 1 },
      { valeur: "Vie primitive", poids: 2 },
      { valeur: "Vie animale", poids: 4 },
      { valeur: "Vie intelligente", poids: 3 },
      { valeur: "Société complexe établie", poids: 3 },
    ],
  },
  // Monde hostile : climat brûlant, terrain aride, air toxique ou absent, peu ou pas de vie.
  infernale: {
    climat: [
      { valeur: "Infernal", poids: 6 },
      { valeur: "Chaud", poids: 4 },
      { valeur: "Tempéré", poids: 1 },
      { valeur: "Froid", poids: 1 },
      { valeur: "Glacial", poids: 1 },
    ],
    terrain: [
      { valeur: "Eau", poids: 1 },
      { valeur: "Jungle", poids: 1 },
      { valeur: "Désert", poids: 7 },
      { valeur: "Gaz", poids: 4 },
    ],
    atmosphere: [
      { valeur: "Inexistante", poids: 3 },
      { valeur: "Toxique", poids: 5 },
      { valeur: "Irrespirable", poids: 4 },
      { valeur: "Respirable", poids: 1 },
      { valeur: "Dense", poids: 2 },
    ],
    systeme: [
      { valeur: "Errante", poids: 2 },
      { valeur: "1 soleil", poids: 2 },
      { valeur: "2 soleils", poids: 2 },
      { valeur: "3 soleils", poids: 3 },
      { valeur: "Trou noir", poids: 2 },
      { valeur: "Étoile à neutrons", poids: 3 },
    ],
    ecosysteme: [
      { valeur: "Pas de vie", poids: 6 },
      { valeur: "Vie primitive", poids: 3 },
      { valeur: "Vie animale", poids: 2 },
      { valeur: "Vie intelligente", poids: 1 },
      { valeur: "Société complexe établie", poids: 1 },
    ],
  },
  // Monde exotique : phénomènes stellaires rares, écosystèmes improbables.
  anomalie: {
    climat: [
      { valeur: "Infernal", poids: 2 },
      { valeur: "Chaud", poids: 2 },
      { valeur: "Tempéré", poids: 2 },
      { valeur: "Froid", poids: 2 },
      { valeur: "Glacial", poids: 2 },
    ],
    terrain: [
      { valeur: "Eau", poids: 1 },
      { valeur: "Jungle", poids: 1 },
      { valeur: "Désert", poids: 2 },
      { valeur: "Gaz", poids: 1 },
    ],
    atmosphere: [
      { valeur: "Inexistante", poids: 2 },
      { valeur: "Toxique", poids: 2 },
      { valeur: "Irrespirable", poids: 2 },
      { valeur: "Respirable", poids: 2 },
      { valeur: "Dense", poids: 3 },
    ],
    systeme: [
      { valeur: "Errante", poids: 3 },
      { valeur: "1 soleil", poids: 1 },
      { valeur: "2 soleils", poids: 2 },
      { valeur: "3 soleils", poids: 3 },
      { valeur: "Trou noir", poids: 4 },
      { valeur: "Étoile à neutrons", poids: 4 },
    ],
    ecosysteme: [
      { valeur: "Pas de vie", poids: 2 },
      { valeur: "Vie primitive", poids: 2 },
      { valeur: "Vie animale", poids: 2 },
      { valeur: "Vie intelligente", poids: 3 },
      { valeur: "Société complexe établie", poids: 3 },
    ],
  },
};

export type VarianteDesert = "glacé" | "volcanique" | "rocailleux";

/** Le désert n'est jamais glacé sous un climat chaud, ni volcanique sous un climat froid. */
export function varianteDesert(climat: Climat): VarianteDesert {
  if (climat === "Glacial" || climat === "Froid") return "glacé";
  if (climat === "Infernal" || climat === "Chaud") return "volcanique";
  return "rocailleux"; // Tempéré
}

/** Libellé affiché du terrain : le Désert précise sa variante selon le climat. */
export function libelleTerrain(c: CaracteristiquesPlanete): string {
  return c.terrain === "Désert" ? `Désert ${varianteDesert(c.climat)}` : c.terrain;
}

export const PREFIXES_SYSTEME: Record<Systeme, string> = {
  Errante: "Kesh-",
  "1 soleil": "Sol-",
  "2 soleils": "Bi-",
  "3 soleils": "Tri-",
  "Trou noir": "Abys-",
  "Étoile à neutrons": "Puls-",
};

export const SUFFIXES_CLIMAT: Record<Climat, string> = {
  Infernal: "-agon",
  Chaud: "-ora",
  Tempéré: "-eth",
  Froid: "-ice",
  Glacial: "-friz",
};

/** Point ouvert #3 (CLAUDE.md) : banque provisoire, à étoffer. */
export const BANQUE_RACINES: readonly string[] = [
  "tara",
  "mund",
  "oth",
  "vex",
  "illia",
  "kar",
  "nyx",
];
