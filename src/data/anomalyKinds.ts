export interface AnomalyKind {
  id: string;
  label: string;
}

/**
 * Nature de l'Anomalie : dérivée des 5 caractéristiques (traitSeed), pas du
 * hasard d'instance — une combinaison donnée a donc toujours la même
 * nature, cohérent avec "un trophée par combinaison exacte".
 */
export const ANOMALY_KINDS: readonly AnomalyKind[] = [
  { id: "antimatiere", label: "Présence d'antimatière stable" },
  { id: "terre_creuse", label: "Terre creuse" },
  { id: "fracture", label: "Fracture dimensionnelle" },
  { id: "gravite_inversee", label: "Gravité inversée" },
  { id: "trou_de_ver", label: "Trou de ver" },
  { id: "temps_distordu", label: "Temps distordu" },
  { id: "faune_photobio", label: "Faune photobiologique" },
  { id: "energie_infinie", label: "Source d'énergie infinie" },
  { id: "planete_etre", label: "Planète-être" },
  { id: "megastructure", label: "Méga structure ancienne" },
  { id: "realite_instable", label: "Réalité instable" },
  { id: "matiere_inconnue", label: "Amas de matière inconnue" },
];
