/**
 * Icônes vectorielles façon pixel art : chaque icône est une grille 8x8
 * dessinée en <rect>, pour rester nette à toute taille sans dépendance
 * externe (cf. CLAUDE.md : direction artistique pixel art, pas de
 * dépendance lourde).
 */

type Bitmap = readonly string[];

function pixelIcon(bitmap: Bitmap, taille: number): string {
  const grille = bitmap.length;
  const cell = taille / grille;
  let rects = "";
  for (let y = 0; y < bitmap.length; y++) {
    const ligne = bitmap[y]!;
    for (let x = 0; x < ligne.length; x++) {
      if (ligne[x] === "#") {
        rects += `<rect x="${x * cell}" y="${y * cell}" width="${cell}" height="${cell}" />`;
      }
    }
  }
  return `<svg class="icone" viewBox="0 0 ${taille} ${taille}" width="${taille}" height="${taille}" fill="currentColor" aria-hidden="true">${rects}</svg>`;
}

/** Icône fournie en asset (public/assets/iconesEvenements), rendue à taille fixe et sans flou. */
function pixelImage(src: string, taille: number): string {
  return `<img class="icone icone--image" src="${src}" width="${taille}" height="${taille}" alt="" aria-hidden="true" />`;
}

const BITMAP_CARBURANT: Bitmap = [
  "...##...",
  "...##...",
  "..####..",
  ".######.",
  ".######.",
  ".######.",
  "..####..",
  "...##...",
];

const BITMAP_COQUE: Bitmap = [
  "########",
  "########",
  "########",
  ".######.",
  ".######.",
  "..####..",
  "..####..",
  "...##...",
];

const BITMAP_MORAL: Bitmap = [
  "..####..",
  ".#....#.",
  "#.#..#.#",
  "#......#",
  "#.####.#",
  ".#....#.",
  "..####..",
  "........",
];
const BITMAP_RELATIONNEL: Bitmap = [
  ".##..##.",
  "########",
  "########",
  "########",
  ".######.",
  "..####..",
  "...##...",
  "........",
];
const BITMAP_EXPLORATION: Bitmap = [
  "........",
  "..#..#..",
  ".#.##.#.",
  ".####.#.",
  ".#.####.",
  ".#.##.#.",
  "..#..#..",
  "........",
];
const BITMAP_SKILL_COMBAT: Bitmap = [
  "......##",
  ".....###",
  "....###.",
  "...###..",
  ".####...",
  "..##....",
  ".#.#....",
  "#.......",
];
const BITMAP_MECANIQUE: Bitmap = [
  "....##..",
  "...##...",
  "...#...#",
  "...##.##",
  "..#####.",
  ".###....",
  "###.....",
  "##......",
];


const BITMAP_REPUTATION: Bitmap = [
  "........",
  "...##...",
  ".##..##.",
  "##....##",
  "...##...",
  ".##..##.",
  "##....##",
  "........",
];

const BITMAP_EQUIPAGE: Bitmap = [
  "..####..",
  ".######.",
  ".######.",
  "..####..",
  ".######.",
  "########",
  "########",
  ".######.",
];

export function iconeCarburant(taille = 18): string {
  return pixelIcon(BITMAP_CARBURANT, taille);
}
export function iconeCoque(taille = 18): string {
  return pixelIcon(BITMAP_COQUE, taille);
}
export function iconeMoral(taille = 18): string {
  return pixelIcon(BITMAP_MORAL, taille);
}
export function iconeReputation(taille = 18): string {
  return pixelIcon(BITMAP_REPUTATION, taille);
}
export function iconeEquipage(taille = 20): string {
  return pixelIcon(BITMAP_EQUIPAGE, taille);
}

/**
 * Icônes de skill (Combat, Mécanique, Relationnel, Exploration) : préfixées
 * "Skill" pour ne jamais être confondues avec les icônes d'événement
 * (ex. iconeCombat = catégorie d'événement, image ; iconeSkillCombat =
 * statistique Combat, bitmap). Ne s'affichent que là où la VALEUR de la
 * statistique est montrée (récap de création, effets de résultat) —
 * jamais en en-tête d'événement.
 */
export function iconeSkillCombat(taille = 18): string {
  return pixelIcon(BITMAP_SKILL_COMBAT, taille);
}
export function iconeSkillMecanique(taille = 18): string {
  return pixelIcon(BITMAP_MECANIQUE, taille);
}
export function iconeSkillRelationnel(taille = 18): string {
  return pixelIcon(BITMAP_RELATIONNEL, taille);
}
export function iconeSkillExploration(taille = 18): string {
  return pixelIcon(BITMAP_EXPLORATION, taille);
}

/** Icônes d'événement fournies en asset (public/assets/iconesEvenements). */
export function iconeRessources(taille = 20): string {
  return pixelImage("/assets/iconesEvenements/ressource_icon.png", taille);
}
export function iconeCombat(taille = 20): string {
  return pixelImage("/assets/iconesEvenements/combat_icon.png", taille);
}
export function iconePlanete(taille = 20): string {
  return pixelImage("/assets/iconesEvenements/planet_icon.png", taille);
}
export function iconeAnomalie(taille = 18): string {
  return pixelImage("/assets/anomalie_icon.png", taille);
}

/**
 * Icônes de monnaie fournies en asset (public/assets/money). Version "nb"
 * (neutre) dans les écrans événement (coûts, effets), version "color" pour
 * les compteurs persistants (jauges, accueil, récap de fin).
 */
export function iconeSlag(taille = 18): string {
  return pixelImage("/assets/money/slag_nb.png", taille);
}
export function iconeSlagCompteur(taille = 18): string {
  return pixelImage("/assets/money/slag_color.png", taille);
}
export function iconeIrridium(taille = 18): string {
  return pixelImage("/assets/money/irridium_nb.png", taille);
}
export function iconeIrridiumCompteur(taille = 18): string {
  return pixelImage("/assets/money/irridium_color.png", taille);
}

const ICONES_CATEGORIE: Record<string, (taille?: number) => string> = {
  Ressources: iconeRessources,
  Combat: iconeCombat,
  Équipage: iconeEquipage,
  Réputation: iconeReputation,
};

export function iconeCategorie(categorie: string, taille = 20): string {
  const icone = ICONES_CATEGORIE[categorie];
  return icone ? icone(taille) : iconeRessources(taille);
}

const ICONES_STAT: Partial<Record<string, (taille?: number) => string>> = {
  carburant: iconeCarburant,
  coque: iconeCoque,
  moral: iconeMoral,
  reputation: iconeReputation,
  monnaieRun: iconeSlag,
  combat: iconeSkillCombat,
  mecanique: iconeSkillMecanique,
  relationnel: iconeSkillRelationnel,
  exploration: iconeSkillExploration,
};

/** Icône associée à une stat/jauge/monnaie/skill (uniquement quand sa valeur est affichée). */
export function iconeStat(stat: string, taille = 14): string {
  return ICONES_STAT[stat]?.(taille) ?? "";
}
