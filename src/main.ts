import "./ui/style.css";
import type { EventOption, RunState, Skills } from "./engine/types";
import {
  appliquerResultat,
  commencerRencontrePlanete,
  creerRun,
  explorerPlanete,
  ignorerPlanete,
  passerAuSlotSuivant,
  scannerPlanete,
  terminerParVictoire,
  type ResultatExploration,
} from "./engine/state";
import { resoudreOption } from "./engine/resolution";
import { ajouterHistorique } from "./engine/persistence";
import type { Planete } from "./engine/planetGenerator";
import { rendreAccueil } from "./ui/accueil";
import { rendreCreation } from "./ui/creation";
import { rendreEvenement, rendreResultatEvenement } from "./ui/evenement";
import { rendrePlaneteDetection, rendreResultatPlanete, rendreResultatScan } from "./ui/planete";
import { rendreFin } from "./ui/fin";
import { afficherAvertissementPremierLancementSiNecessaire } from "./ui/avertissement";

const racine = document.getElementById("app");
if (!racine) throw new Error("Élément #app introuvable.");

let run: RunState | null = null;

function demarrer(skills: Skills): void {
  run = creerRun(skills);
  afficherSlotCourant();
}

function afficherSlotCourant(): void {
  if (!run) return;
  const slot = run.slotCourant;
  if (!slot) {
    afficherAccueil();
    return;
  }

  if (slot.type === "narratif") {
    rendreEvenement(racine!, run, slot.evenement, (option) => choisirOption(option));
  } else {
    const planete = commencerRencontrePlanete();
    rendrePlaneteDetection(racine!, run, planete, {
      onExplorer: () => explorer(planete),
      onScanner: () => {
        const gain = scannerPlanete(run!, planete);
        rendreResultatScan(racine!, run!, planete, gain, () => avancer());
      },
      onIgnorer: () => {
        ignorerPlanete(run!, planete);
        avancer();
      },
    });
  }
}

function choisirOption(option: EventOption): void {
  if (!run || run.slotCourant?.type !== "narratif") return;
  const evenement = run.slotCourant.evenement;
  const resultat = resoudreOption(option, run.skills);
  appliquerResultat(run, `${evenement.nom} — ${option.label}`, resultat);
  rendreResultatEvenement(racine!, run, option, resultat, () => avancer());
}

function explorer(planete: Planete): void {
  if (!run) return;
  const resultat: ResultatExploration = explorerPlanete(run, planete);
  rendreResultatPlanete(racine!, run, planete, resultat, {
    onContinuer: () => avancer(),
    onInstaller: () => installer(),
  });
}

function installer(): void {
  if (!run) return;
  const gain = terminerParVictoire(run);
  afficherFin(gain);
}

function avancer(): void {
  if (!run) return;
  if (run.statut !== "en_cours") {
    afficherFin(null);
    return;
  }
  passerAuSlotSuivant(run);
  // L'ouverture d'un nouveau chapitre consomme du carburant et peut à elle
  // seule provoquer une défaite : revérifier avant d'afficher le slot tiré.
  if (run.statut !== "en_cours") {
    afficherFin(null);
    return;
  }
  afficherSlotCourant();
}

function afficherFin(gainConversion: number | null): void {
  if (!run) return;
  ajouterHistorique({
    date: new Date().toISOString(),
    statut: run.statut,
    nomGalaxie: run.nomGalaxie,
    chapitre: run.chapitre,
    planetesDecouvertes: run.planetesDecouvertes,
    slagFinal: run.monnaieRun,
    irridiumGagne: gainConversion ?? 0,
  });
  rendreFin(racine!, run, gainConversion, () => afficherAccueil());
}

function afficherCreation(): void {
  run = null;
  rendreCreation(racine!, (skills) => demarrer(skills));
}

function afficherAccueil(): void {
  run = null;
  rendreAccueil(racine!, () => afficherCreation());
}

afficherAccueil();
afficherAvertissementPremierLancementSiNecessaire();
