import {
  BANQUE_RACINES,
  CARACTERISTIQUES_PAR_TYPE,
  PREFIXES_SYSTEME,
  SUFFIXES_CLIMAT,
  TYPES_PLANETE,
  type CaracteristiquesPlanete,
  type TypePlanete,
} from "../data/planets";
import { tirerEntier, tirerPondere } from "./random";

export interface Planete {
  type: TypePlanete;
  caracteristiques: CaracteristiquesPlanete;
  nom: string;
  description: string;
  /** Clé stable identifiant la combinaison exacte des 5 caractéristiques (trophées). */
  cleTrophee: string;
}

function tirerTypePlanete(): TypePlanete {
  const options = (Object.entries(TYPES_PLANETE) as [TypePlanete, { probabilite: number }][]).map(
    ([type, def]) => ({ valeur: type, poids: def.probabilite }),
  );
  return tirerPondere(options);
}

/** Caractéristiques tirées selon le type déjà connu, pour rester cohérentes avec lui. */
function tirerCaracteristiques(type: TypePlanete): CaracteristiquesPlanete {
  const tables = CARACTERISTIQUES_PAR_TYPE[type];
  return {
    climat: tirerPondere(tables.climat),
    terrain: tirerPondere(tables.terrain),
    atmosphere: tirerPondere(tables.atmosphere),
    systeme: tirerPondere(tables.systeme),
    ecosysteme: tirerPondere(tables.ecosysteme),
  };
}

export function capitaliser(mot: string): string {
  return mot.charAt(0).toUpperCase() + mot.slice(1);
}

export function tirerRacine(): string {
  const index = tirerEntier(0, BANQUE_RACINES.length - 1);
  const racine = BANQUE_RACINES[index];
  if (!racine) throw new Error("tirerRacine: banque de racines vide");
  return racine;
}

/** [Préfixe Système] + [Racine] + [Suffixe Climat] — ex. "Bi-Vex-ice". */
function genererNom(c: CaracteristiquesPlanete): string {
  return `${PREFIXES_SYSTEME[c.systeme]}${capitaliser(tirerRacine())}${SUFFIXES_CLIMAT[c.climat]}`;
}

/** [Terrain] [Atmosphère], climat [Climat], [Écosystème]. */
export function genererDescription(c: CaracteristiquesPlanete): string {
  return `${c.terrain} ${c.atmosphere}, climat ${c.climat}, ${c.ecosysteme}.`;
}

export function cleCaracteristiques(c: CaracteristiquesPlanete): string {
  return [c.climat, c.terrain, c.atmosphere, c.systeme, c.ecosysteme].join("|");
}

export function genererPlanete(): Planete {
  const type = tirerTypePlanete();
  const caracteristiques = tirerCaracteristiques(type);
  return {
    type,
    caracteristiques,
    nom: genererNom(caracteristiques),
    description: genererDescription(caracteristiques),
    cleTrophee: cleCaracteristiques(caracteristiques),
  };
}
