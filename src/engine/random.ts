import type { Montant } from "./types";

export function clamp(valeur: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valeur));
}

/** Jet de dé à 100 faces : entier entre 1 et 100 inclus. */
export function jetD100(): number {
  return 1 + Math.floor(Math.random() * 100);
}

/** Entier tiré uniformément entre min et max inclus. */
export function tirerEntier(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/**
 * Résout un montant fixe ou une fourchette. Sur critique, une fourchette
 * donne toujours sa borne haute (cf. règle d'effet du calibrage).
 */
export function resoudreMontant(montant: Montant, critique: boolean): number {
  if (typeof montant === "number") return montant;
  const [min, max] = montant;
  return critique ? max : tirerEntier(min, max);
}

export interface OptionPondereeMinimale<T> {
  readonly valeur: T;
  readonly poids: number;
}

/** Tirage pondéré parmi une liste de {valeur, poids}. */
export function tirerPondere<T>(options: readonly OptionPondereeMinimale<T>[]): T {
  const poidsTotal = options.reduce((somme, o) => somme + o.poids, 0);
  let tirage = Math.random() * poidsTotal;
  for (const option of options) {
    tirage -= option.poids;
    if (tirage <= 0) return option.valeur;
  }
  const derniere = options[options.length - 1];
  if (!derniere) throw new Error("tirerPondere: liste d'options vide");
  return derniere.valeur;
}
