import { EVENEMENTS } from "../data/events";
import {
  CARBURANT_PAR_CHAPITRE,
  EVENEMENTS_PAR_CHAPITRE,
  MONNAIE_RUN_INITIALE,
  SOLDE_CHAPITRE,
  STATS_INITIALES,
} from "../data/stats";
import { GAIN_SCAN_DISTANCE, SLAG_PAR_IRRIDIUM_VICTOIRE } from "../data/planets";
import { genererNomGalaxie } from "./galaxyGenerator";
import type { Planete } from "./planetGenerator";
import { genererPlanete } from "./planetGenerator";
import { determinerNatureAnomalie } from "./planetArt";
import { determinerRarete } from "./planetRarity";
import { resoudreExplorationPlanete, type ResolutionExploration } from "./planetResolution";
import { ajouterMonnaiePersistante, ajouterTrophee, possedeTrophee } from "./persistence";
import { clamp, tirerEntier } from "./random";
import type { GameEvent, ResolutionResult, RunState, Skills, SlotEvenement, StatKey } from "./types";

export function creerRun(skills: Skills): RunState {
  const run: RunState = {
    chapitre: 0,
    nomGalaxie: "",
    stats: { ...STATS_INITIALES },
    skills: { ...skills },
    monnaieRun: MONNAIE_RUN_INITIALE,
    planetesDecouvertes: 0,
    fileEvenements: [],
    slotCourant: null,
    dernierEvenementNom: null,
    statut: "en_cours",
  };
  ouvrirChapitre(run);
  return run;
}

function melanger<T>(liste: readonly T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = tirerEntier(0, i);
    const temp = copie[i]!;
    copie[i] = copie[j]!;
    copie[j] = temp;
  }
  return copie;
}

/**
 * Le calibrage fixe 2 à 4 événements par chapitre mais ne précise pas la
 * proportion événements narratifs / détections de planète. On garantit une
 * détection par chapitre (cœur du gameplay : découvrir des planètes), le
 * reste étant tiré sans doublon parmi les événements narratifs.
 */
function tirerSlotsChapitre(): SlotEvenement[] {
  const total = tirerEntier(EVENEMENTS_PAR_CHAPITRE.min, EVENEMENTS_PAR_CHAPITRE.max);
  const nbNarratifs = total - 1;
  const pool = [...EVENEMENTS];
  const narratifs: GameEvent[] = [];
  for (let i = 0; i < nbNarratifs && pool.length > 0; i++) {
    const index = tirerEntier(0, pool.length - 1);
    narratifs.push(pool[index]!);
    pool.splice(index, 1);
  }
  const slots: SlotEvenement[] = [
    { type: "planete" },
    ...narratifs.map((evenement) => ({ type: "narratif" as const, evenement })),
  ];
  return melanger(slots);
}

export function ouvrirChapitre(run: RunState): void {
  run.chapitre += 1;
  run.nomGalaxie = genererNomGalaxie();
  run.monnaieRun += SOLDE_CHAPITRE;
  run.stats.carburant = clamp(run.stats.carburant - CARBURANT_PAR_CHAPITRE, 0, 100);
  run.fileEvenements = tirerSlotsChapitre();
  run.slotCourant = run.fileEvenements.shift() ?? null;
  verifierFinDefaite(run);
}

/** À appeler après acquittement du résultat courant par le joueur. */
export function passerAuSlotSuivant(run: RunState): void {
  const suivant = run.fileEvenements.shift();
  if (suivant) {
    run.slotCourant = suivant;
  } else {
    ouvrirChapitre(run);
  }
}

function appliquerEffet(run: RunState, stat: StatKey, montant: number): void {
  switch (stat) {
    case "carburant":
    case "coque":
    case "moral":
    case "reputation":
      run.stats[stat] = clamp(run.stats[stat] + montant, 0, 100);
      break;
    case "monnaieRun":
      run.monnaieRun = Math.max(0, run.monnaieRun + montant);
      break;
    case "combat":
    case "mecanique":
    case "relationnel":
    case "exploration":
      run.skills[stat] = clamp(run.skills[stat] + montant, 0, 100);
      break;
  }
}

function verifierFinDefaite(run: RunState): void {
  if (run.statut !== "en_cours") return;
  if (run.stats.carburant <= 0) run.statut = "defaite_carburant";
  else if (run.stats.coque <= 0) run.statut = "defaite_coque";
}

export function appliquerResultat(run: RunState, nomEvenement: string, resultat: ResolutionResult): void {
  run.dernierEvenementNom = nomEvenement;
  if (resultat.coutApplique) {
    appliquerEffet(run, resultat.coutApplique.stat, resultat.coutApplique.montant);
  }
  for (const effet of resultat.effets) {
    appliquerEffet(run, effet.stat, effet.montant);
  }
  verifierFinDefaite(run);
}

export function commencerRencontrePlanete(): Planete {
  return genererPlanete();
}

/** Retourne le gain (fourchette tirée), révélé par l'appelant sur un écran de résultat dédié. */
export function scannerPlanete(run: RunState, planete: Planete): number {
  const gain = tirerEntier(GAIN_SCAN_DISTANCE.min, GAIN_SCAN_DISTANCE.max);
  run.dernierEvenementNom = `Scanner à distance de ${planete.nom}`;
  run.monnaieRun += gain;
  run.planetesDecouvertes += 1;
  return gain;
}

export function ignorerPlanete(run: RunState, planete: Planete): void {
  run.dernierEvenementNom = `Ignorer ${planete.nom}`;
}

export interface ResultatExploration {
  resolution: ResolutionExploration;
  nouveauTrophee: boolean;
}

export function explorerPlanete(run: RunState, planete: Planete): ResultatExploration {
  run.dernierEvenementNom = `Exploration de ${planete.nom}`;
  const resolution = resoudreExplorationPlanete(planete, run.stats.coque);
  run.planetesDecouvertes += 1;

  if (resolution.monnaieRunGagnee > 0) {
    run.monnaieRun += resolution.monnaieRunGagnee;
  }
  if (resolution.monnaieRunPerduePourcent > 0) {
    const perte = Math.round((run.monnaieRun * resolution.monnaieRunPerduePourcent) / 100);
    run.monnaieRun = Math.max(0, run.monnaieRun - perte);
  }
  if (resolution.coque.nouvelleValeur !== null) {
    run.stats.coque = clamp(resolution.coque.nouvelleValeur, 0, 100);
  }
  verifierFinDefaite(run);

  let nouveauTrophee = false;
  if (resolution.tropheeEligible && !possedeTrophee(planete.cleTrophee)) {
    nouveauTrophee = ajouterTrophee({
      cle: planete.cleTrophee,
      nom: planete.nom,
      caracteristiques: planete.caracteristiques,
      instanceSeed: planete.instanceSeed,
      anomalyKind: determinerNatureAnomalie(planete.caracteristiques),
      rarity: determinerRarete(planete.caracteristiques),
    });
  }
  if (resolution.irridiumGagne > 0) {
    ajouterMonnaiePersistante(resolution.irridiumGagne);
  }

  return { resolution, nouveauTrophee };
}

/** Planète paradisiaque : le joueur choisit de s'installer. Retourne le gain converti. */
export function terminerParVictoire(run: RunState): number {
  const gain = Math.floor(run.monnaieRun / SLAG_PAR_IRRIDIUM_VICTOIRE);
  if (gain > 0) ajouterMonnaiePersistante(gain);
  run.statut = "victoire";
  return gain;
}
