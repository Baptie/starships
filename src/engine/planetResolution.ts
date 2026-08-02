import { INFERNALE, IRRIDIUM_ANOMALIE, TYPES_PLANETE, type TypePlanete } from "../data/planets";
import { tirerEntier } from "./random";
import type { Planete } from "./planetGenerator";

export interface ResolutionExploration {
  type: TypePlanete;
  monnaieRunGagnee: number;
  monnaieRunPerduePourcent: number;
  /** Non nul uniquement pour Infernale : nouvelle valeur de coque, dégâts subis, ou explosion. */
  coque: { explosion: boolean; nouvelleValeur: number | null; degats: number };
  irridiumGagne: number;
  /**
   * Anomalie uniquement. Un trophée n'est effectivement accordé que si la
   * combinaison n'est pas déjà dans le portefeuille — à vérifier par l'appelant.
   */
  tropheeEligible: boolean;
  /** Paradisiaque uniquement : le joueur peut choisir de s'arrêter (victoire). */
  victoirePossible: boolean;
}

/**
 * Résout les effets d'une exploration selon le type de planète tiré.
 * Ne modifie aucun état — l'appelant (engine/state.ts) applique le résultat
 * au run (et vérifie l'unicité du trophée).
 */
export function resoudreExplorationPlanete(
  planete: Planete,
  coqueActuelle: number,
): ResolutionExploration {
  const base: ResolutionExploration = {
    type: planete.type,
    monnaieRunGagnee: 0,
    monnaieRunPerduePourcent: 0,
    coque: { explosion: false, nouvelleValeur: null, degats: 0 },
    irridiumGagne: 0,
    tropheeEligible: false,
    victoirePossible: false,
  };

  switch (planete.type) {
    case "classique": {
      const def = TYPES_PLANETE.classique;
      return { ...base, monnaieRunGagnee: tirerEntier(def.gainRunMin, def.gainRunMax) };
    }
    case "anomalie": {
      const def = TYPES_PLANETE.anomalie;
      return {
        ...base,
        monnaieRunGagnee: tirerEntier(def.gainRunMin, def.gainRunMax),
        irridiumGagne: IRRIDIUM_ANOMALIE,
        tropheeEligible: true,
      };
    }
    case "paradisiaque":
      return { ...base, victoirePossible: true };
    case "infernale": {
      const explosion = coqueActuelle <= INFERNALE.coquePlancherPourcent;
      const nouvelleValeur = explosion ? 0 : INFERNALE.coquePlancherPourcent;
      return {
        ...base,
        monnaieRunPerduePourcent: INFERNALE.perteMonnaieRunPourcent,
        coque: { explosion, nouvelleValeur, degats: coqueActuelle - nouvelleValeur },
      };
    }
  }
}
