import type { TypePlanete } from "./planets";

/** Exploration d'une Infernale : le vaisseau survit, coque endommagée. */
export const MESSAGE_INFERNALE =
  "L'atmosphère est irrespirable, la chaleur insupportable. Une éruption surprend le vaisseau avant qu'il ne reprenne de l'altitude — la coque encaisse le choc.";

/** Exploration d'une Infernale : coque déjà à bout, le vaisseau explose. */
export const MESSAGE_INFERNALE_EXPLOSION =
  "La coque, déjà à bout, ne supporte pas cette nouvelle épreuve. Elle cède entièrement dans l'atmosphère brûlante.";

/** Exploration d'une Paradisiaque. */
export const MESSAGE_PARADISIAQUE =
  "L'air est respirable, l'eau coule à perte de vue, la vie prospère sous toutes ses formes — un monde rare, presque trop beau pour être vrai.";

/**
 * Scan à distance : le type réel n'est jamais révélé en détail, mais un
 * indice discret confirme après coup ce qui a été évité ou manqué.
 */
export const MESSAGES_SCAN_EVITE: Partial<Record<TypePlanete, string>> = {
  infernale:
    "Les capteurs longue portée détectent une activité volcanique extrême. En scannant à distance, vous avez peut-être évité le pire.",
  paradisiaque:
    "Les relevés suggèrent un monde exceptionnellement hospitalier... resté hors de portée, faute d'avoir posé le pied dessus.",
  anomalie:
    "Une signature étrange brouille un instant les capteurs avant de disparaître des relevés — quelque chose d'inhabituel, jamais percé à jour.",
};
