import type { CaracteristiquesPlanete } from "../data/planets";
import type { StatutRun } from "./types";

/**
 * Persistance hors run : Irridium, portefeuille de trophées (Anomalies),
 * historique des runs et préférences locales (avertissement de stockage).
 */

const CLE_MONNAIE_PERSISTANTE = "starships:irridium";
const CLE_TROPHEES = "starships:trophees";
const CLE_HISTORIQUE = "starships:historique";
const CLE_AVERTISSEMENT_VU = "starships:avertissementStockageVu";

const HISTORIQUE_TAILLE_MAX = 50;

export interface Trophee {
  cle: string;
  nom: string;
  caracteristiques: CaracteristiquesPlanete;
}

export function chargerMonnaiePersistante(): number {
  const brut = localStorage.getItem(CLE_MONNAIE_PERSISTANTE);
  const valeur = brut ? Number(brut) : 0;
  return Number.isFinite(valeur) ? valeur : 0;
}

export function ajouterMonnaiePersistante(montant: number): number {
  const total = chargerMonnaiePersistante() + montant;
  localStorage.setItem(CLE_MONNAIE_PERSISTANTE, String(total));
  return total;
}

function estTrophee(valeur: unknown): valeur is Trophee {
  if (typeof valeur !== "object" || valeur === null) return false;
  const candidat = valeur as Record<string, unknown>;
  return typeof candidat["cle"] === "string" && typeof candidat["nom"] === "string";
}

export function chargerTrophees(): Trophee[] {
  const brut = localStorage.getItem(CLE_TROPHEES);
  if (!brut) return [];
  try {
    const valeur: unknown = JSON.parse(brut);
    return Array.isArray(valeur) ? valeur.filter(estTrophee) : [];
  } catch {
    return [];
  }
}

export function possedeTrophee(cle: string): boolean {
  return chargerTrophees().some((trophee) => trophee.cle === cle);
}

/** Ajoute le trophée s'il n'est pas déjà possédé. Retourne true si nouveau. */
export function ajouterTrophee(trophee: Trophee): boolean {
  const trophees = chargerTrophees();
  if (trophees.some((t) => t.cle === trophee.cle)) return false;
  trophees.push(trophee);
  localStorage.setItem(CLE_TROPHEES, JSON.stringify(trophees));
  return true;
}

export interface EntreeHistorique {
  date: string;
  statut: StatutRun;
  nomGalaxie: string;
  chapitre: number;
  planetesDecouvertes: number;
  slagFinal: number;
  irridiumGagne: number;
}

function estEntreeHistorique(valeur: unknown): valeur is EntreeHistorique {
  if (typeof valeur !== "object" || valeur === null) return false;
  const candidat = valeur as Record<string, unknown>;
  return typeof candidat["date"] === "string" && typeof candidat["statut"] === "string";
}

/** Historique des runs, du plus récent au plus ancien. */
export function chargerHistorique(): EntreeHistorique[] {
  const brut = localStorage.getItem(CLE_HISTORIQUE);
  if (!brut) return [];
  try {
    const valeur: unknown = JSON.parse(brut);
    return Array.isArray(valeur) ? valeur.filter(estEntreeHistorique) : [];
  } catch {
    return [];
  }
}

/** Enregistre un run terminé en tête d'historique, borné à HISTORIQUE_TAILLE_MAX entrées. */
export function ajouterHistorique(entree: EntreeHistorique): void {
  const historique = [entree, ...chargerHistorique()].slice(0, HISTORIQUE_TAILLE_MAX);
  localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(historique));
}

/** Avertissement de stockage local, affiché une seule fois au tout premier lancement. */
export function avertissementStockageVu(): boolean {
  return localStorage.getItem(CLE_AVERTISSEMENT_VU) === "1";
}

export function marquerAvertissementStockageVu(): void {
  localStorage.setItem(CLE_AVERTISSEMENT_VU, "1");
}
