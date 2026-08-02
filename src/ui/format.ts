import type { TypePlanete } from "../data/planets";
import type { StatKey, StatutRun } from "../engine/types";

export const LABELS_TYPE_PLANETE: Record<TypePlanete, string> = {
  classique: "Classique",
  anomalie: "Anomalie",
  paradisiaque: "Paradisiaque",
  infernale: "Infernale",
};

export const LABELS_STATUT_RUN: Record<StatutRun, string> = {
  en_cours: "En cours",
  victoire: "Installation réussie",
  defaite_carburant: "Dérive silencieuse",
  defaite_coque: "Dislocation en vol",
};

export const LABELS_STAT: Record<StatKey, string> = {
  carburant: "Carburant",
  coque: "Coque",
  moral: "Moral",
  reputation: "Réputation",
  monnaieRun: "Slag",
  combat: "Combat",
  mecanique: "Mécanique",
  relationnel: "Relationnel",
  exploration: "Exploration",
};

export function formatNombre(n: number): string {
  return Math.round(n).toLocaleString("fr-FR");
}

export function formatEffet(stat: StatKey, montant: number): string {
  const signe = montant > 0 ? "+" : "";
  return `${LABELS_STAT[stat]} ${signe}${formatNombre(montant)}`;
}
