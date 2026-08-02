import type { SkillName } from "../engine/types";

export interface OptionCreation {
  label: string;
  description: string;
  gagne: SkillName;
  perd: SkillName;
  montant: number;
}

export interface EtapeCreation {
  id: string;
  question: string;
  options: readonly [OptionCreation, OptionCreation];
}

/**
 * Parcours de création du vaisseau : chaque étape échange des points entre
 * deux skills (via engine/skillAllocation.ts:transfererSkill), en partant
 * d'une base égale à 50/50/50/50. Le total (200) et les bornes [20, 80]
 * sont garantis par la fonction de transfert, quel que soit l'ordre des choix.
 */
export const ETAPES_CREATION: readonly EtapeCreation[] = [
  {
    id: "recrutement",
    question: "Comment constituez-vous votre équipage ?",
    options: [
      {
        label: "Une escouade de choc",
        description: "D'anciens combattants aguerris, prêts à en découdre.",
        gagne: "combat",
        perd: "mecanique",
        montant: 15,
      },
      {
        label: "Une équipe de techniciens",
        description: "Des ingénieurs hors pair, capables de réparer n'importe quoi.",
        gagne: "mecanique",
        perd: "combat",
        montant: 15,
      },
    ],
  },
  {
    id: "commandement",
    question: "Quel est le style de votre commandant·e ?",
    options: [
      {
        label: "Un négociateur hors pair",
        description: "Préfère toujours parler que tirer.",
        gagne: "relationnel",
        perd: "exploration",
        montant: 15,
      },
      {
        label: "Un pilote qui connaît chaque raccourci",
        description: "Préfère toujours fuir que négocier.",
        gagne: "exploration",
        perd: "relationnel",
        montant: 15,
      },
    ],
  },
  {
    id: "face-au-danger",
    question: "Face au danger, quel est votre réflexe ?",
    options: [
      {
        label: "On ne recule devant rien",
        description: "La force avant tout.",
        gagne: "combat",
        perd: "relationnel",
        montant: 15,
      },
      {
        label: "Tout se négocie",
        description: "Même avec un canon braqué dessus.",
        gagne: "relationnel",
        perd: "combat",
        montant: 15,
      },
    ],
  },
  {
    id: "priorite-vaisseau",
    question: "Quelle est la priorité du vaisseau ?",
    options: [
      {
        label: "Un moteur increvable",
        description: "Fiabilité avant tout, quitte à perdre en vitesse.",
        gagne: "mecanique",
        perd: "exploration",
        montant: 15,
      },
      {
        label: "Toujours en mouvement",
        description: "Vitesse et réactivité, quitte à négliger l'entretien.",
        gagne: "exploration",
        perd: "mecanique",
        montant: 15,
      },
    ],
  },
];
