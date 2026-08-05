/**
 * Cartes de collection — Anomalies uniquement (les Classique/Paradisiaque/
 * Infernale n'ont pas de trophée, donc pas de carte).
 *
 * Deux formats :
 *  - Vignette   : grille du portefeuille, nom + icône 16×16.
 *  - Carte détail : format portrait, exportable en PNG pour le partage.
 *
 * Palette : reste la palette holographique verte du reste de l'app (voir
 * style.css) — seul le contour (et son halo) prend la couleur de la
 * rareté, posée par `--rarity-tier` en style inline sur chaque carte.
 */

import type { AnomalyKind } from "../data/anomalyKinds";
import { libelleTerrain, type CaracteristiquesPlanete } from "../data/planets";
import { genererDescription } from "../engine/planetGenerator";
import { genererImagesPlanete, type PlanetImage } from "../engine/planetArt";
import type { RarityTier } from "../engine/planetRarity";
import type { Trophee } from "../engine/persistence";

export const LABELS_RARETE: Record<RarityTier, string> = {
  commune: "Commune",
  rare: "Rare",
  legendaire: "Légendaire",
};

export interface AnomalyCardData {
  name: string;
  description: string;
  anomalyKind: AnomalyKind;
  traits: CaracteristiquesPlanete;
  rarity: RarityTier;
  planet64: PlanetImage;
  planet16: PlanetImage;
}

/** Reconstitue les données d'affichage d'une carte à partir d'un trophée stocké. */
export function donneesCarte(trophee: Trophee): AnomalyCardData {
  const { big, icon } = genererImagesPlanete(trophee.caracteristiques, "anomalie", trophee.instanceSeed);
  return {
    name: trophee.nom,
    description: genererDescription(trophee.caracteristiques),
    anomalyKind: trophee.anomalyKind,
    traits: trophee.caracteristiques,
    rarity: trophee.rarity,
    planet64: big,
    planet16: icon,
  };
}

// ---------------------------------------------------------------- utilitaires

function imageDataToCanvas({ data, size }: PlanetImage): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  c.getContext("2d")!.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, size, size), 0, 0);
  return c;
}

function pixelatedImg(planet: PlanetImage, className: string): HTMLImageElement {
  const img = document.createElement("img");
  img.src = imageDataToCanvas(planet).toDataURL();
  img.className = className;
  img.alt = "";
  return img;
}

/** Lit une couleur déclarée dans :root (voir style.css), pour que l'export
 *  Canvas reste toujours synchronisé avec le thème affiché. */
function couleurRacine(nomVariable: string, repli: string): string {
  const valeur = getComputedStyle(document.documentElement).getPropertyValue(nomVariable).trim();
  return valeur || repli;
}

function couleurRarete(rarity: RarityTier): string {
  return couleurRacine(`--rarete-${rarity}`, "#6e93a0");
}

// ---------------------------------------------------------------- vignette

/** Grille du portefeuille : nom + icône 16×16 uniquement. */
export function creerVignetteCarte(data: AnomalyCardData, onOpen?: (d: AnomalyCardData) => void): HTMLElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "carte-vignette";
  el.style.setProperty("--rarity-tier", couleurRarete(data.rarity));
  el.setAttribute("aria-label", `${data.name} — ${LABELS_RARETE[data.rarity]}`);

  const cadre = document.createElement("div");
  cadre.className = "carte-vignette__cadre";
  cadre.appendChild(pixelatedImg(data.planet16, "carte-vignette__icone"));

  const point = document.createElement("span");
  point.className = "carte-vignette__point";

  const nom = document.createElement("div");
  nom.className = "carte-vignette__nom";
  nom.textContent = data.name;

  el.append(cadre, point, nom);
  if (onOpen) el.addEventListener("click", () => onOpen(data));
  return el;
}

// ---------------------------------------------------------------- carte détail

const ORDRE_TRAITS: Array<keyof AnomalyCardData["traits"]> = ["climat", "terrain", "atmosphere", "systeme", "ecosysteme"];

export function creerCarteDetail(data: AnomalyCardData): HTMLElement {
  const el = document.createElement("div");
  el.className = "carte-detail";
  el.style.setProperty("--rarity-tier", couleurRarete(data.rarity));

  const cadreInterieur = document.createElement("div");
  cadreInterieur.className = "carte-detail__cadre-interieur";

  const entete = document.createElement("div");
  entete.className = "carte-detail__entete";
  entete.innerHTML = `<span>Anomalie</span><span class="carte-detail__rarete">${LABELS_RARETE[data.rarity]}</span>`;

  const scene = document.createElement("div");
  scene.className = "carte-detail__scene";
  scene.innerHTML = `
    <span class="affichage-holo__coin affichage-holo__coin--haut-gauche"></span>
    <span class="affichage-holo__coin affichage-holo__coin--haut-droite"></span>
    <span class="affichage-holo__coin affichage-holo__coin--bas-gauche"></span>
    <span class="affichage-holo__coin affichage-holo__coin--bas-droite"></span>
  `;
  scene.appendChild(pixelatedImg(data.planet64, "carte-detail__planete"));
  scene.insertAdjacentHTML(
    "beforeend",
    `<span class="affichage-holo__scanlines"></span><span class="affichage-holo__socle"></span>`,
  );

  const nom = document.createElement("div");
  nom.className = "carte-detail__nom";
  nom.textContent = data.name;

  const nature = document.createElement("div");
  nature.className = "carte-detail__nature";
  nature.textContent = data.anomalyKind.label;

  const description = document.createElement("div");
  description.className = "carte-detail__description";
  description.textContent = data.description;

  const traits = document.createElement("div");
  traits.className = "carte-detail__traits";
  for (const cle of ORDRE_TRAITS) {
    const tag = document.createElement("span");
    tag.className = "carte-detail__trait";
    tag.textContent = cle === "terrain" ? libelleTerrain(data.traits) : data.traits[cle];
    traits.appendChild(tag);
  }

  const pied = document.createElement("div");
  pied.className = "carte-detail__pied";
  pied.innerHTML = `<span>Starships</span><span>Vaisseau — Anomalie</span>`;

  el.append(cadreInterieur, entete, scene, nom, nature, description, traits, pied);
  return el;
}

// ---------------------------------------------------------------- export PNG

/**
 * Recompose la carte détail entièrement en Canvas (pas de dépendance type
 * html2canvas). Dimensions de référence 360×560, multipliées par `scale`.
 * Les couleurs sont lues depuis les variables CSS (voir couleurRacine) pour
 * rester synchronisées avec le rendu affiché.
 */
export async function exporterCarteEnPNG(data: AnomalyCardData, scale = 3): Promise<Blob> {
  const W = 360 * scale;
  const H = 560 * scale;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  let titleFont = `${20 * scale}px "Courier New", monospace`;
  let labelFont = `${9 * scale}px "Courier New", monospace`;
  try {
    await document.fonts.load(`${20 * scale}px Pixer`);
    if (document.fonts.check(`${20 * scale}px Pixer`)) {
      titleFont = `${20 * scale}px Pixer`;
      labelFont = `${9 * scale}px Pixer`;
    }
  } catch {
    /* police absente : on garde le repli */
  }

  const fond = couleurRacine("--fond", "#030c0d");
  const fondPanneau = couleurRacine("--fond-panneau-clair", "#144038");
  const texte = couleurRacine("--texte", "#d8fff2");
  const texteAttenue = couleurRacine("--texte-attenue", "#a8d9cb");
  const accent = couleurRacine("--accent", "#45f2c0");
  const bordure = couleurRacine("--bordure", "#3f6d63");
  const rarityColor = couleurRarete(data.rarity);

  // Fond
  const grad = ctx.createRadialGradient(W / 2, H * 0.32, 0, W / 2, H * 0.32, W * 0.7);
  grad.addColorStop(0, "rgba(69,242,192,0.12)");
  grad.addColorStop(1, fond);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Cadre de rareté
  ctx.strokeStyle = rarityColor;
  ctx.lineWidth = 2 * scale;
  roundRect(ctx, scale, scale, W - 2 * scale, H - 2 * scale, 10 * scale);
  ctx.stroke();
  ctx.strokeStyle = "rgba(214,222,232,0.08)";
  ctx.lineWidth = 1 * scale;
  roundRect(ctx, 6 * scale, 6 * scale, W - 12 * scale, H - 12 * scale, 7 * scale);
  ctx.stroke();

  const padX = 18 * scale;
  let y = 18 * scale;

  // Bandeau : type / rareté
  ctx.font = labelFont;
  ctx.textBaseline = "top";
  ctx.fillStyle = texteAttenue;
  ctx.textAlign = "left";
  ctx.fillText("ANOMALIE", padX, y);
  ctx.fillStyle = rarityColor;
  ctx.textAlign = "right";
  ctx.fillText(LABELS_RARETE[data.rarity].toUpperCase(), W - padX, y);
  y += 20 * scale;

  // Planète, avec halo
  const stageSize = W - 2 * padX;
  const stageY = y;
  const haloGrad = ctx.createRadialGradient(
    W / 2,
    stageY + stageSize / 2,
    0,
    W / 2,
    stageY + stageSize / 2,
    stageSize / 1.4,
  );
  haloGrad.addColorStop(0, "rgba(69,242,192,0.18)");
  haloGrad.addColorStop(1, "rgba(69,242,192,0)");
  ctx.fillStyle = haloGrad;
  ctx.fillRect(padX, stageY, stageSize, stageSize);

  const planetDraw = stageSize * 0.78;
  const planetOffset = (stageSize - planetDraw) / 2;
  ctx.imageSmoothingEnabled = false;
  const planetCanvas = imageDataToCanvas(data.planet64);
  ctx.drawImage(planetCanvas, padX + planetOffset, stageY + planetOffset, planetDraw, planetDraw);
  y = stageY + stageSize + 16 * scale;

  // Nom
  ctx.textAlign = "center";
  ctx.fillStyle = texte;
  ctx.font = titleFont;
  ctx.fillText(data.name, W / 2, y);
  y += 26 * scale;

  // Nature d'Anomalie
  ctx.font = labelFont;
  ctx.fillStyle = accent;
  ctx.fillText(data.anomalyKind.label, W / 2, y);
  y += 22 * scale;

  // Description (retour à la ligne manuel, largeur max = stageSize)
  ctx.font = `${11.5 * scale}px "Courier New", monospace`;
  ctx.fillStyle = texteAttenue;
  const lines = wrapText(ctx, data.description, stageSize - 12 * scale);
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += 16 * scale;
  }
  y += 8 * scale;

  // Traits (tags)
  const traitValues = ORDRE_TRAITS.map((k) => (k === "terrain" ? libelleTerrain(data.traits) : data.traits[k]));
  ctx.font = `${9.5 * scale}px "Courier New", monospace`;
  y = layoutTags(ctx, traitValues, W / 2, y, stageSize, scale, fondPanneau, bordure, texteAttenue);

  // Pied de carte
  const footerY = H - 28 * scale;
  ctx.strokeStyle = bordure;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, footerY - 10 * scale);
  ctx.lineTo(W - padX, footerY - 10 * scale);
  ctx.stroke();
  ctx.font = labelFont;
  ctx.fillStyle = texteAttenue;
  ctx.textAlign = "left";
  ctx.fillText("STARSHIPS", padX, footerY);
  ctx.textAlign = "right";
  ctx.fillText("VAISSEAU — ANOMALIE", W - padX, footerY);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("export échoué"))), "image/png");
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/** Centre une rangée de "tags" arrondis, retourne à la ligne si besoin. */
function layoutTags(
  ctx: CanvasRenderingContext2D,
  values: string[],
  cx: number,
  startY: number,
  maxWidth: number,
  scale: number,
  fondTag: string,
  bordureTag: string,
  texteTag: string,
): number {
  const padTag = 7 * scale;
  const gap = 5 * scale;
  const tagH = 18 * scale;
  const rows: string[][] = [[]];
  let rowWidth = 0;
  for (const v of values) {
    const w = ctx.measureText(v).width + padTag * 2;
    const ligneActuelle = rows[rows.length - 1]!;
    if (rowWidth + w + gap > maxWidth && ligneActuelle.length) {
      rows.push([]);
      rowWidth = 0;
    }
    rows[rows.length - 1]!.push(v);
    rowWidth += w + gap;
  }
  let y = startY;
  ctx.textAlign = "left";
  for (const row of rows) {
    const widths = row.map((v) => ctx.measureText(v).width + padTag * 2);
    const total = widths.reduce((a, b) => a + b, 0) + gap * (row.length - 1);
    let x = cx - total / 2;
    row.forEach((v, i) => {
      const w = widths[i]!;
      ctx.strokeStyle = bordureTag;
      ctx.fillStyle = fondTag;
      ctx.lineWidth = 1 * scale;
      roundRect(ctx, x, y, w, tagH, 3 * scale);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = texteTag;
      ctx.fillText(v, x + padTag, y + tagH / 2 - 4.5 * scale);
      x += w + gap;
    });
    y += tagH + gap;
  }
  return y + 6 * scale;
}

/** Déclenche le téléchargement du PNG exporté. */
export async function telechargerCartePNG(data: AnomalyCardData, filename = `${data.name}.png`): Promise<void> {
  const blob = await exporterCarteEnPNG(data);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
