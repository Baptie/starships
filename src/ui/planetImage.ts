import type { CaracteristiquesPlanete, TypePlanete } from "../data/planets";

const BASE = "/assets/planets/";

const IMAGES = {
  lave: `${BASE}planet_lave.png`,
  glace: `${BASE}planete_glace.png`,
  jungle: `${BASE}planet_jungle.png`,
  verte: `${BASE}planete_verte.png`,
  morte: `${BASE}planete_morte.png`,
  anomalie: `${BASE}planet_anomalie.png`,
} as const;

const TERRAINS_LUXURIANTS = new Set(["Eau", "Jungle"]);

/**
 * Choisit l'illustration. Une Anomalie a son propre visuel dédié (prioritaire
 * sur climat/terrain). Sinon, choix selon climat + terrain uniquement (pas
 * atmosphère/écosystème, cf. demande) : les climats extrêmes (Infernal,
 * Glacial/Froid) priment et fixent le visuel ; pour Chaud/Tempéré, le
 * terrain départage monde luxuriant (Eau/Jungle) vs aride.
 *
 * `type` n'est à passer que lorsque le type de la planète est révélé au
 * joueur (écran de résultat d'exploration, galerie des Anomalies) — la
 * détection et le scan à distance ne le connaissent pas encore et ne
 * doivent pas montrer le visuel Anomalie en avance.
 */
export function imagePlanete(c: CaracteristiquesPlanete, type?: TypePlanete): string {
  if (type === "anomalie") return IMAGES.anomalie;
  if (c.climat === "Infernal") return IMAGES.lave;
  if (c.climat === "Glacial" || c.climat === "Froid") return IMAGES.glace;

  const luxuriant = TERRAINS_LUXURIANTS.has(c.terrain);
  if (c.climat === "Chaud") return luxuriant ? IMAGES.jungle : IMAGES.lave;
  return luxuriant ? IMAGES.verte : IMAGES.morte; // Tempéré
}

export function rendreIllustrationPlanete(c: CaracteristiquesPlanete, taille = 96, type?: TypePlanete): string {
  return `<img class="illustration-planete" src="${imagePlanete(c, type)}" width="${taille}" height="${taille}" alt="" />`;
}
