import { FORMULE } from "../data/stats";
import { clamp, jetD100, resoudreMontant } from "./random";
import type { EffetApplique, EventOption, IssueResolution, ResolutionResult, Skills } from "./types";

export function calculerPFinal(pBase: number, skill: number): number {
  const brut =
    pBase + (skill - FORMULE.pointNeutreSkill) * FORMULE.coefficientProbabiliteParSkill;
  return clamp(brut, FORMULE.plancherProbabilite, FORMULE.plafondProbabilite);
}

/** Le taux (%/point de skill) est partagé entre les deux fenêtres critiques (cf. calibrage). */
const TAUX_FENETRE_CRITIQUE = FORMULE.fenetreCritReussiteBonusASkill100 / 100;

export function calculerFenetreCritReussite(pFinal: number, skill: number): number {
  return Math.min(pFinal, FORMULE.fenetreCritReussiteBase + skill * TAUX_FENETRE_CRITIQUE);
}

export function calculerFenetreCritEchec(skill: number): number {
  return FORMULE.fenetreCritEchecBaseASkill0 - skill * TAUX_FENETRE_CRITIQUE;
}

function skillDeOption(option: EventOption, skills: Skills): number {
  return option.skillGouvernant ? skills[option.skillGouvernant] : FORMULE.pointNeutreSkill;
}

/**
 * Résout une option d'événement : coût prélevé, jet éventuel, puis gains ou
 * pertes appliqués selon l'issue. Ne modifie aucun état — retourne les
 * effets à appliquer par l'appelant (cf. engine/state.ts).
 */
export function resoudreOption(option: EventOption, skills: Skills): ResolutionResult {
  const effets: EffetApplique[] = [];
  const coutApplique: EffetApplique | null = option.cout
    ? { stat: option.cout.stat, montant: -option.cout.montant }
    : null;

  if (option.type === "deterministe") {
    for (const gain of option.gains) {
      effets.push({ stat: gain.stat, montant: resoudreMontant(gain.montant, false) });
    }
    return { issue: "reussite", jet: null, pFinal: null, coutApplique, effets };
  }

  const skill = skillDeOption(option, skills);
  const pBase = option.pBase;
  if (pBase === null) {
    throw new Error(`Option aléatoire "${option.id}" sans P_base.`);
  }
  const pFinal = calculerPFinal(pBase, skill);
  const jet = jetD100();
  const fenetreCritReussite = calculerFenetreCritReussite(pFinal, skill);
  const fenetreCritEchec = calculerFenetreCritEchec(skill);

  let issue: IssueResolution;
  if (jet <= fenetreCritReussite) issue = "reussite_critique";
  else if (jet <= pFinal) issue = "reussite";
  else if (jet > 100 - fenetreCritEchec) issue = "echec_critique";
  else issue = "echec";

  const critique = issue === "reussite_critique" || issue === "echec_critique";
  const succes = issue === "reussite_critique" || issue === "reussite";
  const cibles = succes ? option.gains : option.pertes;
  const signe = succes ? 1 : -1;

  for (const effet of cibles) {
    let montant = resoudreMontant(effet.montant, critique);
    if (critique) montant *= FORMULE.multiplicateurCritique;
    effets.push({ stat: effet.stat, montant: signe * montant });
  }

  return { issue, jet, pFinal, coutApplique, effets };
}
