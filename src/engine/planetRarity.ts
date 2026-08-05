import { CARACTERISTIQUES_PAR_TYPE, type CaracteristiquesPlanete, type OptionPonderee } from "../data/planets";

export type RarityTier = "commune" | "rare" | "legendaire";

/**
 * Un trait compte comme "rare" s'il a été tiré avec un poids inférieur à la
 * moyenne de sa table (donc moins probable que le tirage "typique" d'une
 * Anomalie). Climat et terrain sont uniformes dans la table Anomalie
 * (voir data/planets.ts) : ils ne contribuent jamais de point, la rareté
 * vient naturellement de l'atmosphère, du système et de l'écosystème.
 */
function estTraitRare<T>(valeur: T, table: readonly OptionPonderee<T>[]): boolean {
  const poidsMoyen = table.reduce((somme, o) => somme + o.poids, 0) / table.length;
  const entree = table.find((o) => o.valeur === valeur);
  return (entree?.poids ?? poidsMoyen) < poidsMoyen;
}

/**
 * Détermine la rareté d'une Anomalie à partir des poids déjà définis pour
 * ce type (point ouvert du cadrage, résolu ici sans nouvelle donnée : on
 * réutilise la pondération plutôt que d'en inventer une seconde).
 */
export function determinerRarete(c: CaracteristiquesPlanete): RarityTier {
  const tables = CARACTERISTIQUES_PAR_TYPE.anomalie;
  const points = [
    estTraitRare(c.climat, tables.climat),
    estTraitRare(c.terrain, tables.terrain),
    estTraitRare(c.atmosphere, tables.atmosphere),
    estTraitRare(c.systeme, tables.systeme),
    estTraitRare(c.ecosysteme, tables.ecosysteme),
  ].filter(Boolean).length;

  if (points >= 3) return "legendaire";
  if (points >= 2) return "rare";
  return "commune";
}
