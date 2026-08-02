import {
  MESSAGES_DEFAITE_CARBURANT,
  MESSAGES_DEFAITE_COQUE,
  MESSAGES_VICTOIRE,
} from "../data/messages";
import { SKILL_NAMES, type RunState, type SkillName } from "./types";

const LABELS_SKILL: Record<SkillName, string> = {
  combat: "Combat",
  mecanique: "Mécanique",
  relationnel: "Relationnel",
  exploration: "Exploration",
};

function skillDominant(run: RunState): string {
  let meilleur: SkillName = "combat";
  for (const nom of SKILL_NAMES) {
    if (run.skills[nom] > run.skills[meilleur]) meilleur = nom;
  }
  return LABELS_SKILL[meilleur];
}

function nomDernierEvenement(run: RunState): string {
  return run.dernierEvenementNom ?? "un dernier événement resté sans nom";
}

function piocher<T>(liste: readonly T[]): T {
  const item = liste[Math.floor(Math.random() * liste.length)];
  if (item === undefined) throw new Error("piocher: liste vide");
  return item;
}

function interpoler(modele: string, run: RunState): string {
  return modele
    .replaceAll("{galaxie}", run.nomGalaxie)
    .replaceAll("{evenement}", nomDernierEvenement(run))
    .replaceAll("{skill}", skillDominant(run))
    .replaceAll("{planetes}", String(run.planetesDecouvertes));
}

export function genererMessageFin(run: RunState): string {
  const messages =
    run.statut === "defaite_carburant"
      ? MESSAGES_DEFAITE_CARBURANT
      : run.statut === "defaite_coque"
        ? MESSAGES_DEFAITE_COQUE
        : run.statut === "victoire"
          ? MESSAGES_VICTOIRE
          : null;
  if (!messages) throw new Error("genererMessageFin: run encore en cours");
  return interpoler(piocher(messages), run);
}
