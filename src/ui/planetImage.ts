import type { TypePlanete } from "../data/planets";
import type { Planete } from "../engine/planetGenerator";
import { genererImagesPlanete, imageEnDataUrl } from "../engine/planetArt";

/**
 * `type` n'est à passer que lorsque le type de la planète est révélé au
 * joueur (écran de résultat d'exploration) — la détection et le scan à
 * distance ne le connaissent pas encore et ne doivent pas montrer l'effet
 * visuel Anomalie en avance. Sans lui, le rendu reste celui d'une Classique
 * (mêmes traits, sans le halo néon).
 *
 * Présentée comme un hologramme (coins de visée, scanlines, socle lumineux)
 * plutôt qu'une simple image.
 */
export function rendreIllustrationPlanete(planete: Planete, taille = 176, type?: TypePlanete): string {
  const { big } = genererImagesPlanete(planete.caracteristiques, type ?? "classique", planete.instanceSeed);
  const src = imageEnDataUrl(big, taille / 64);
  return `
    <div class="hologramme-planete">
      <span class="affichage-holo__coin affichage-holo__coin--haut-gauche"></span>
      <span class="affichage-holo__coin affichage-holo__coin--haut-droite"></span>
      <span class="affichage-holo__coin affichage-holo__coin--bas-gauche"></span>
      <span class="affichage-holo__coin affichage-holo__coin--bas-droite"></span>
      <img class="hologramme-planete__image" src="${src}" width="${taille}" height="${taille}" alt="" />
      <span class="affichage-holo__scanlines"></span>
      <span class="affichage-holo__socle"></span>
    </div>
  `;
}
