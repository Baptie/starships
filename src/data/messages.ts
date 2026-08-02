/**
 * Variantes de messages de fin de run. Placeholders : {galaxie}, {evenement},
 * {skill}, {planetes}. Le récapitulatif de fin est le principal vecteur
 * viral du jeu (cf. CLAUDE.md) : contexte enrichi à chaque variante.
 */

export const MESSAGES_DEFAITE_CARBURANT: readonly string[] = [
  "Les réservoirs sont à sec au-dessus de {galaxie}. Le vaisseau dérive en silence, porté par son élan, après {evenement}. L'équipage regarde les étoiles s'éloigner sans jamais les atteindre.",
  "Plus une goutte de carburant dans {galaxie}. Après {evenement}, le vaisseau devient une épave parmi d'autres, dérivant pour toujours, son talent en {skill} désormais inutile.",
  "La dernière étincelle des moteurs s'éteint dans {galaxie}. {evenement} aura eu raison des réserves. Dérive silencieuse — {planetes} planète(s) découverte(s), et puis plus rien.",
  "Dans {galaxie}, le compte à rebours atteint zéro : plus de carburant. Le vaisseau, guidé jusque-là par son point fort en {skill}, s'immobilise pour l'éternité après {evenement}.",
];

export const MESSAGES_DEFAITE_COQUE: readonly string[] = [
  "La coque cède au-dessus de {galaxie}. {evenement} aura été de trop. Dislocation en vol — {planetes} planète(s) auront vu passer ce vaisseau.",
  "Dans {galaxie}, la coque se disloque après {evenement}. Malgré un équipage taillé pour le {skill}, rien n'aura pu tenir la coque assemblée.",
  "Le vaisseau se brise en silence quelque part dans {galaxie}. {evenement} porte le coup de trop à une coque déjà éprouvée.",
  "Dislocation en vol dans {galaxie}. Après {evenement}, il ne reste plus rien du vaisseau — seulement {planetes} planète(s) inscrites au registre.",
];

export const MESSAGES_VICTOIRE: readonly string[] = [
  "L'équipage pose le pied sur {galaxie} et choisit d'y rester. Une vie nouvelle commence, après {planetes} planète(s) explorées et un talent certain en {skill}.",
  "Voyage terminé : {galaxie} accueille son nouvel équipage. {planetes} planète(s) découvertes, et enfin un monde où s'installer.",
  "Dans {galaxie}, le vaisseau se pose pour la dernière fois. L'équipage s'installe, laissant {planetes} planète(s) derrière lui comme autant de souvenirs.",
];
