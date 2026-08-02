import { capitaliser, tirerRacine } from "./planetGenerator";

/**
 * Le calibrage ne définit un schéma de nom que pour les planètes. Schéma
 * provisoire pour les galaxies, réutilisant la même banque de racines.
 */
export function genererNomGalaxie(): string {
  return `${capitaliser(tirerRacine())} ${capitaliser(tirerRacine())}`;
}
