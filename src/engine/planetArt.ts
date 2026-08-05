/**
 * Générateur procédural de planètes en pixel art.
 *
 * Deux seeds indépendants :
 *  - traitSeed    : dérivé des 5 caractéristiques. Pilote l'atmosphère, l'écosystème,
 *                   le système stellaire et la nature d'Anomalie. C'est lui qui garantit
 *                   qu'une combinaison donnée reste identifiable (identité du trophée).
 *  - instanceSeed : aléatoire, propre à CETTE découverte. Pilote la taille, la teinte
 *                   et la disposition des continents. Tiré une seule fois puis stocké
 *                   sur la Planète, sinon son apparence changerait à chaque réaffichage.
 *
 * Sortie : une image 64×64 (grand format) et une icône 16×16, l'icône étant une
 * réduction du grand format, pas une génération séparée.
 *
 * Inspiration d'éclairage et de dithering : Deep-Fold/PixelPlanets (MIT).
 */

import { ANOMALY_KINDS, type AnomalyKind } from "../data/anomalyKinds";
import { varianteDesert, type Atmosphere, type CaracteristiquesPlanete, type Climat, type TypePlanete } from "../data/planets";

// ---------------------------------------------------------------- constantes

export const CANVAS = 64;
export const ICON = 16;
const BASE_R = 22;

const LIGHT_OFFSET: readonly [number, number] = [-0.55, -0.6];
const LIGHT_MAG = Math.hypot(LIGHT_OFFSET[0], LIGHT_OFFSET[1]);
const BORDERS = [0.28, 0.42, 0.56, 0.72] as const; // 5 bandes de lumière
const DITHER_AMOUNT = 0.05;

/** Opacité des nuages. */
const CLOUD_OPACITY = 0.35;

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
] as const;
const BAYER_N = 16;

/**
 * Palette interne au rendu pixel art (matériaux visuels : fond spatial,
 * roche, glace/métal clair, lave). Sans rapport avec les couleurs de thème
 * de l'UI (voir style.css) ni les monnaies Slag/Irridium du jeu.
 */
const VOID = "#0A0D14";
const ROCK = "#545A66";
const PALE_METAL = "#D6DEE8";
const MOLTEN = "#FF8A3D";

// --- Anomalie : une caractéristique spécifique, toujours en violet néon ---
const NEON_VIVID = "#B026FF";
const NEON_LIGHT = "#E3B8FF";
const NEON_WHITE = "#FFFFFF";

type Ramp = readonly [string, string, string];

const CLIMAT_PAL: Record<Climat, Ramp> = {
  Infernal: ["#3B0A0A", "#B33418", "#FFB347"],
  Chaud: ["#4A2E17", "#C97A3D", "#F2C879"],
  Tempéré: ["#0E2A1E", "#2E7D5B", "#8FD9B6"],
  Froid: ["#0F2038", "#3A6EA5", "#AEDFF7"],
  Glacial: ["#2C363D", "#8FA6B2", "#F2FBFD"],
};

/** Référence de saturation/luminosité pour l'eau. La teinte est imposée ailleurs. */
const OCEAN_TEMPLATE: Ramp = ["#0B2233", "#1F6E8C", "#7FD6E0"];

const ATMO_COLORS: Partial<Record<Atmosphere, readonly [string, string]>> = {
  Toxique: ["#7CFC6A", "#2E5A22"],
  Irrespirable: [ROCK, "#2B2E36"],
  Respirable: ["#8FD1FF", "#2E4E63"],
  Dense: ["#C9B7E8", "#4B3E63"],
};

/** (nombre de nuages, rayon min, rayon max) */
const CLOUD_PARAMS: Partial<Record<Atmosphere, readonly [number, number, number]>> = {
  Toxique: [5, 3, 6],
  Irrespirable: [3, 2, 4],
  Respirable: [6, 3, 6],
  Dense: [10, 4, 8],
};

// ---------------------------------------------------------------- utilitaires

type RGB = readonly [number, number, number];

function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function rgbToHsl([r, g, b]: RGB): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      default:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return [h, s, l];
}

function hslToRgb([h, s, l]: [number, number, number]): RGB {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
}

/** PRNG déterministe. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function rand() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
    t = (t + (Math.imul(t ^ (t >>> 7), t | 61) >>> 0)) >>> 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash FNV-1a des 5 traits -> seed stable, sans dépendance crypto. */
export function seedFromTraits(c: CaracteristiquesPlanete): number {
  const key = [c.climat, c.terrain, c.atmosphere, c.systeme, c.ecosysteme].join("|");
  let h = 0x811c9dc5;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Nature d'Anomalie sans rendre l'image : c'est le tout premier tirage du
 * traitSeed (voir genererImagePlanete64), donc strictement équivalent au
 * `anomalyKind` renvoyé par un rendu complet, en beaucoup moins cher.
 */
export function determinerNatureAnomalie(c: CaracteristiquesPlanete): AnomalyKind {
  const traitRand = mulberry32(seedFromTraits(c));
  return ANOMALY_KINDS[Math.floor(traitRand() * ANOMALY_KINDS.length)]!;
}

/** Fait glisser une rampe dans sa famille de teinte, sans en sortir. */
function jitterRamp(ramp: Ramp, rand: () => number, hueRange = 0.06, satRange = 0.14, lightRange = 0.07): RGB[] {
  const dh = (rand() - 0.5) * 2 * hueRange;
  const ds = (rand() - 0.5) * 2 * satRange;
  const dl = (rand() - 0.5) * 2 * lightRange;
  return ramp.map((hx) => {
    let [h, s, l] = rgbToHsl(hexToRgb(hx));
    h = (h + dh + 1) % 1;
    s = Math.min(1, Math.max(0, s + ds));
    l = Math.min(1, Math.max(0, l + dl));
    return hslToRgb([h, s, l]);
  });
}

/** Rampe d'eau : toujours bleue, du bleu-vert léger au bleu-violet léger. */
function oceanRamp(rand: () => number): RGB[] {
  const hue = 0.44 + rand() * 0.28; // ~158° a ~259°
  return OCEAN_TEMPLATE.map((hx) => {
    const [, s, l] = rgbToHsl(hexToRgb(hx));
    return hslToRgb([hue, s, l]);
  });
}

/** 3 tons -> 5 tons, pour un dégradé plus doux. */
function expandRamp(tri: RGB[]): RGB[] {
  const o = tri[0]!;
  const b = tri[1]!;
  const l = tri[2]!;
  return [o, lerp(o, b, 0.5), b, lerp(b, l, 0.5), l];
}

function bandAt(dx: number, dy: number, R: number, x: number, y: number, extraJitter = 0, nbands = 5): number {
  const lx = LIGHT_OFFSET[0] * R;
  const ly = LIGHT_OFFSET[1] * R;
  const maxD = R * (1 + LIGHT_MAG);
  let d = Math.hypot(dx - lx, dy - ly) / maxD;
  const jitter = (BAYER4[((y % 4) + 4) % 4]![((x % 4) + 4) % 4]! / (BAYER_N - 1) - 0.5) * DITHER_AMOUNT;
  d += jitter + extraJitter;
  if (nbands === 5) {
    for (let i = 0; i < BORDERS.length; i++) {
      if (d < BORDERS[i]!) return 4 - i;
    }
    return 0;
  }
  if (d < 0.42) return 2;
  if (d < 0.7) return 1;
  return 0;
}

/** Bord dithéré : transition progressive au lieu d'une arête nette. */
function softEdgeRatio(ratio: number, x: number, y: number, margin = 0.22): boolean {
  if (ratio <= 1 - margin) return true;
  if (ratio >= 1 + margin * 0.4) return false;
  const t = (ratio - (1 - margin)) / (margin * 1.4);
  const threshold = BAYER4[((y % 4) + 4) % 4]![((x % 4) + 4) % 4]! / (BAYER_N - 1);
  return t < threshold;
}

function softEdge(dist: number, radius: number, x: number, y: number, margin = 0.22): boolean {
  return softEdgeRatio(dist / radius, x, y, margin);
}

/** Distance normalisée dans un repère elliptique tourné : nuages et traits gazeux. */
function elongatedRatio(dx: number, dy: number, theta: number, major: number, minor: number): number {
  const ct = Math.cos(theta);
  const st = Math.sin(theta);
  const u = dx * ct + dy * st;
  const v = -dx * st + dy * ct;
  return Math.hypot(u / major, v / minor);
}

type Point = readonly [number, number, number, number]; // x, y, dx, dy

function discPoints(cx: number, cy: number, r: number): Point[] {
  const pts: Point[] = [];
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) pts.push([x, y, dx, dy]);
    }
  }
  return pts;
}

// ---------------------------------------------------------------- rendu

export interface PlanetImage {
  data: Uint8ClampedArray;
  size: number;
}

export interface RenduPlanete extends PlanetImage {
  instanceSeed: number;
  anomalyKind: AnomalyKind | null;
}

/** Rend une planète en 64×64. */
export function genererImagePlanete64(
  c: CaracteristiquesPlanete,
  planetType: TypePlanete = "classique",
  instanceSeedEntree: number | null = null,
): RenduPlanete {
  const { climat, terrain, atmosphere, systeme, ecosysteme } = c;
  const instanceSeed = instanceSeedEntree ?? (Math.random() * 0x100000000) >>> 0;
  const traitRand = mulberry32(seedFromTraits(c));
  const instRand = mulberry32(instanceSeed);

  // Tiré ici, systématiquement, pour que les tirages suivants restent à la même
  // position quel que soit planetType : la base reste identique à une Classique.
  const anomalyKind = ANOMALY_KINDS[Math.floor(traitRand() * ANOMALY_KINDS.length)]!;

  const size = CANVAS;
  const cx = size >> 1;
  const cy = size >> 1;

  const data = new Uint8ClampedArray(size * size * 4);
  const voidRgb = hexToRgb(VOID);
  for (let i = 0; i < size * size; i++) {
    data[i * 4] = voidRgb[0];
    data[i * 4 + 1] = voidRgb[1];
    data[i * 4 + 2] = voidRgb[2];
    data[i * 4 + 3] = 255;
  }
  const setPx = (x: number, y: number, rgb: RGB): void => {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const i = (y * size + x) * 4;
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = 255;
  };
  const getPx = (x: number, y: number): RGB => {
    const i = (y * size + x) * 4;
    return [data[i]!, data[i + 1]!, data[i + 2]!];
  };

  const scale = 0.8 + instRand() * 0.4;
  const R = Math.round(BASE_R * scale);
  const pts = discPoints(cx, cy, R);
  const pick = (rand: () => number): Point => pts[Math.floor(rand() * pts.length)]!;

  const ramp = expandRamp(jitterRamp(CLIMAT_PAL[climat], instRand));
  const wramp = expandRamp(oceanRamp(instRand));

  // Un Désert n'a qu'une seule variante possible pour un climat donné —
  // jamais de désert glacé sous un climat chaud, par exemple.
  const desertVariant = terrain === "Désert" ? varianteDesert(climat) : null;

  const nPatch = 3 + Math.floor(instRand() * 6);
  const patchR = Math.max(2, Math.round((3 + instRand() * 5) * scale));
  const nCraters = 3 + Math.floor(instRand() * 5);
  const craterR = Math.max(2, Math.round((3 + instRand() * 5) * scale));

  // Jungle : quelques poches d'eau
  const waterCenters: [number, number][] = [];
  if (terrain === "Jungle") {
    const n = Math.max(1, Math.floor(nPatch / 2));
    for (let i = 0; i < n; i++) {
      const p = pick(instRand);
      waterCenters.push([p[0], p[1]]);
    }
  }

  // Eau : mer par défaut, continents composés de blobs qui se chevauchent
  const continents: Array<Array<[number, number, number]>> = [];
  if (terrain === "Eau") {
    const nCont = 2 + Math.floor(instRand() * 4);
    for (let i = 0; i < nCont; i++) {
      const p = pick(instRand);
      const coreR = Math.max(3, Math.round((5 + instRand() * 7) * scale));
      const lobes: Array<[number, number, number]> = [[p[0], p[1], coreR]];
      const nLobes = 1 + Math.floor(instRand() * 3);
      for (let j = 0; j < nLobes; j++) {
        const ang = instRand() * 2 * Math.PI;
        const dist = coreR * (0.35 + instRand() * 0.35);
        const lr = Math.max(2, Math.round(coreR * (0.4 + instRand() * 0.4)));
        lobes.push([p[0] + dist * Math.cos(ang), p[1] + dist * Math.sin(ang), lr]);
      }
      continents.push(lobes);
    }
  }

  const patchCenters: [number, number][] = [];
  for (let i = 0; i < nPatch; i++) {
    const p = pick(instRand);
    patchCenters.push([p[0], p[1]]);
  }

  const craters: [number, number, number][] = [];
  if (desertVariant === "rocailleux") {
    for (let i = 0; i < nCraters; i++) {
      const p = pick(instRand);
      craters.push([p[0], p[1], craterR]);
    }
  }

  // Désert volcanique : failles de lave en fusion, mêmes positions qu'un cratère.
  const lavaCracks: [number, number, number][] = [];
  if (desertVariant === "volcanique") {
    for (let i = 0; i < nCraters; i++) {
      const p = pick(instRand);
      lavaCracks.push([p[0], p[1], craterR]);
    }
  }

  // Gaz : traits difformes quasi horizontaux + quelques taches. Jamais de continent.
  const gasStreaks: Array<[number, number, number, number, number, number]> = [];
  const gasSpots: [number, number, number][] = [];
  if (terrain === "Gaz") {
    const nStreaks = 6 + Math.floor(instRand() * 5);
    const shifts = [-2, -1, 1, 2];
    for (let i = 0; i < nStreaks; i++) {
      const p = pick(instRand);
      const minor = (1.6 + instRand() * 1.8) * scale;
      const major = minor * (4 + instRand() * 5);
      const theta = (instRand() - 0.5) * 0.5;
      const shift = shifts[Math.floor(instRand() * 4)]!;
      gasStreaks.push([p[0], p[1], theta, major, minor, shift]);
    }
    const nSpots = 1 + Math.floor(instRand() * 3);
    for (let i = 0; i < nSpots; i++) {
      const p = pick(instRand);
      const sr = Math.max(2, Math.round((3 + instRand() * 3) * scale));
      gasSpots.push([p[0], p[1], sr]);
    }
  }

  const lx = LIGHT_OFFSET[0] * R;
  const ly = LIGHT_OFFSET[1] * R;
  const moltenRgb = hexToRgb(MOLTEN);

  // --- surface ---
  for (const [x, y, dx, dy] of pts) {
    const band = bandAt(dx, dy, R, x, y);
    let isWater = false;

    if (terrain === "Eau") {
      isWater = true;
      for (const lobes of continents) {
        let hit = false;
        for (const [ccx, ccy, cr] of lobes) {
          if (softEdge(Math.hypot(x - ccx, y - ccy), cr, x, y, 0.3)) {
            hit = true;
            break;
          }
        }
        if (hit) {
          isWater = false;
          break;
        }
      }
    } else if (terrain === "Jungle") {
      for (const [wx, wy] of waterCenters) {
        if (softEdge(Math.hypot(x - wx, y - wy), patchR, x, y)) {
          isWater = true;
          break;
        }
      }
    }

    let color = (isWater ? wramp : ramp)[band]!;

    if (terrain === "Gaz") {
      for (const [scx, scy, theta, major, minor, shift] of gasStreaks) {
        if (softEdgeRatio(elongatedRatio(x - scx, y - scy, theta, major, minor), x, y, 0.5)) {
          color = ramp[Math.max(0, Math.min(4, band + shift))]!;
          break;
        }
      }
      for (const [spx, spy, sr] of gasSpots) {
        if (softEdge(Math.hypot(x - spx, y - spy), sr, x, y, 0.35)) {
          color = lerp(ramp[Math.max(0, Math.min(4, band))]!, moltenRgb, 0.22);
          break;
        }
      }
    }

    if (desertVariant === "glacé" || (terrain === "Jungle" && !isWater)) {
      for (const [pxc, pyc] of patchCenters) {
        if (softEdge(Math.hypot(x - pxc, y - pyc), patchR, x, y)) {
          const boost = desertVariant === "glacé" ? 1 : -1;
          color = ramp[Math.max(0, Math.min(4, band + boost))]!;
          break;
        }
      }
    }

    for (const [cxp, cyp, cr] of craters) {
      const dxc = x - cxp;
      const dyc = y - cyp;
      const distc = Math.hypot(dxc, dyc);
      if (softEdge(distc, cr, x, y, 0.18)) {
        let shift: number;
        if (distc >= cr * 0.72) {
          let vx = lx - (cxp - cx);
          let vy = ly - (cyp - cy);
          const norm = Math.hypot(vx, vy) || 1;
          vx /= norm;
          vy /= norm;
          const rx = dxc / (distc || 1);
          const ry = dyc / (distc || 1);
          const facing = vx * rx + vy * ry;
          shift = facing > 0.2 ? 1 : facing < -0.2 ? -1 : 0;
        } else {
          shift = -1;
        }
        color = ramp[Math.max(0, Math.min(4, band + shift))]!;
        break;
      }
    }

    for (const [lxc, lyc, lr] of lavaCracks) {
      const distl = Math.hypot(x - lxc, y - lyc);
      if (softEdge(distl, lr, x, y, 0.18)) {
        color = lerp(color, moltenRgb, distl < lr * 0.5 ? 0.85 : 0.45);
        break;
      }
    }

    setPx(x, y, color);
  }

  // --- nuages : allongés, tous alignés sur un même axe de vent ---
  if (atmosphere !== "Inexistante") {
    const atmoColors = ATMO_COLORS[atmosphere]!;
    const cloudCol = hexToRgb(atmoColors[0]);
    const [nc, rMin, rMax] = CLOUD_PARAMS[atmosphere]!;
    const nClouds = Math.max(1, Math.round(nc * scale));
    const windTheta = instRand() * Math.PI;
    const clouds: Array<[number, number, number, number, number]> = [];
    for (let i = 0; i < nClouds; i++) {
      const p = pick(instRand);
      const minor = (rMin + instRand() * (rMax - rMin)) * scale * 0.55;
      const major = minor * (2.4 + instRand() * 1.6);
      const theta = windTheta + (instRand() - 0.5) * 0.35;
      clouds.push([p[0], p[1], theta, major, minor]);
    }
    for (const [x, y] of pts) {
      for (const [ccx, ccy, theta, major, minor] of clouds) {
        if (softEdgeRatio(elongatedRatio(x - ccx, y - ccy, theta, major, minor), x, y, 0.45)) {
          setPx(x, y, lerp(getPx(x, y), cloudCol, CLOUD_OPACITY));
          break;
        }
      }
    }

    // halo, éclairé côté jour et sombre côté nuit
    const [lightHex, darkHex] = atmoColors;
    const lightRgb = hexToRgb(lightHex);
    const darkRgb = hexToRgb(darkHex);
    for (let y = cy - R - 2; y <= cy + R + 2; y++) {
      for (let x = cx - R - 2; x <= cx + R + 2; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 <= R * R || d2 > (R + 2) * (R + 2)) continue;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        if (atmosphere === "Irrespirable" && (x + y) % 2 === 0) continue;
        if (atmosphere === "Dense" && Math.hypot(dx, dy) > R + 1 && (x + y) % 3 === 0) continue;
        const band = bandAt(dx, dy, R, x, y, 0.05, 3);
        setPx(x, y, band === 2 ? lightRgb : darkRgb);
      }
    }
  }

  // --- écosystème : amas de lumières, côté jour uniquement ---
  const pickLit = (rand: () => number): Point | null => {
    for (let t = 0; t < 40; t++) {
      const p = pts[Math.floor(rand() * pts.length)]!;
      if (bandAt(p[2], p[3], R, p[0], p[1]) > 0) return p;
    }
    return null;
  };
  if (ecosysteme === "Vie intelligente" || ecosysteme === "Société complexe établie") {
    const dense = ecosysteme === "Société complexe établie";
    const nClusters = dense ? 7 + Math.floor(traitRand() * 4) : 3 + Math.floor(traitRand() * 2);
    const clusterR = dense ? 3 : 2;
    for (let i = 0; i < nClusters; i++) {
      const c2 = pickLit(traitRand);
      if (!c2) continue;
      const nLights = 3 + Math.floor(traitRand() * 4);
      for (let j = 0; j < nLights; j++) {
        const ox = c2[0] + Math.floor((traitRand() - 0.5) * 2 * clusterR);
        const oy = c2[1] + Math.floor((traitRand() - 0.5) * 2 * clusterR);
        const ddx = ox - cx;
        const ddy = oy - cy;
        if (ddx * ddx + ddy * ddy <= R * R && bandAt(ddx, ddy, R, ox, oy) > 0) {
          setPx(ox, oy, moltenRgb);
        }
      }
    }
  } else if (ecosysteme === "Vie primitive" || ecosysteme === "Vie animale") {
    const nClusters = ecosysteme === "Vie primitive" ? 2 : 4;
    const col = hexToRgb(ecosysteme === "Vie primitive" ? "#C6FF8A" : "#FFD97A");
    for (let i = 0; i < nClusters; i++) {
      const c2 = pickLit(traitRand);
      if (!c2) continue;
      const n = 2 + Math.floor(traitRand() * 3);
      for (let j = 0; j < n; j++) {
        const ox = c2[0] + Math.floor((traitRand() - 0.5) * 4);
        const oy = c2[1] + Math.floor((traitRand() - 0.5) * 4);
        const ddx = ox - cx;
        const ddy = oy - cy;
        if (ddx * ddx + ddy * ddy <= R * R) setPx(ox, oy, col);
      }
    }
  }

  // --- système stellaire, en fond ---
  const m = 4;
  const edge = m + 2;
  const corners: readonly [
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
  ] = [
    [edge, edge],
    [size - 1 - edge, edge],
    [edge, size - 1 - edge],
    [size - 1 - edge, size - 1 - edge],
  ];
  const disc = (cxs: number, cys: number, hex: string, r: number): void => {
    const rgb = hexToRgb(hex);
    for (let y = cys - r; y <= cys + r; y++) {
      for (let x = cxs - r; x <= cxs + r; x++) {
        if ((x - cxs) ** 2 + (y - cys) ** 2 <= r * r) setPx(x, y, rgb);
      }
    }
  };
  const sr = m;
  if (systeme === "Errante") {
    const pale = hexToRgb(PALE_METAL);
    for (let i = 0; i < 6; i++) {
      const x = Math.floor(traitRand() * size);
      const y = Math.floor(traitRand() * size);
      if ((x - cx) ** 2 + (y - cy) ** 2 > (R + 2 * m) ** 2) setPx(x, y, pale);
    }
  } else if (systeme === "1 soleil") {
    disc(corners[0][0], corners[0][1], "#FFE27A", sr);
  } else if (systeme === "2 soleils") {
    disc(corners[0][0], corners[0][1], "#FFE27A", sr);
    disc(corners[1][0], corners[1][1], "#FF9E5E", sr);
  } else if (systeme === "3 soleils") {
    disc(corners[0][0], corners[0][1], "#FFE27A", sr);
    disc(corners[1][0], corners[1][1], "#FF9E5E", sr);
    disc(corners[2][0], corners[2][1], "#FFD1D1", sr);
  } else if (systeme === "Trou noir") {
    const [bx, by] = corners[1];
    disc(bx, by, "#000000", sr + m);
    for (let y = by - sr - 2 * m; y <= by + sr + 2 * m; y++) {
      for (let x = bx - sr - 2 * m; x <= bx + sr + 2 * m; x++) {
        const dd = (x - bx) ** 2 + (y - by) ** 2;
        if (dd > (sr + m) ** 2 && dd <= (sr + 2 * m) ** 2) setPx(x, y, moltenRgb);
      }
    }
  } else if (systeme === "Étoile à neutrons") {
    const [nx, ny] = corners[0];
    const beam = hexToRgb("#CFF7FF");
    const d = 3 * m;
    for (let t = -d; t <= d; t++) {
      setPx(nx + t, ny, beam);
      setPx(nx, ny + t, beam);
    }
    setPx(nx, ny, hexToRgb(PALE_METAL));
  }

  // --- Anomalie : la caractéristique spécifique, par-dessus la base classique ---
  if (planetType === "anomalie") {
    const vivid = hexToRgb(NEON_VIVID);
    const light = hexToRgb(NEON_LIGHT);
    const white = hexToRgb(NEON_WHITE);

    // Cœur lumineux collecté par chaque effet, puis diffusé en halo à la fin :
    // c'est ce halo commun qui donne l'aspect "néon" à l'ensemble.
    const neonCore: [number, number][] = [];
    const mark = (x: number, y: number, col: RGB): void => {
      setPx(x, y, col);
      neonCore.push([x, y]);
    };

    const inDisc = (x: number, y: number): boolean => (x - cx) ** 2 + (y - cy) ** 2 <= R * R;

    switch (anomalyKind.id) {
      case "antimatiere": {
        const n = 2 + Math.floor(instRand() * 3);
        for (let i = 0; i < n; i++) {
          const p = pick(instRand);
          const r = Math.max(2, Math.round((3 + instRand() * 3) * scale));
          for (const [x, y] of pts) {
            const d = Math.hypot(x - p[0], y - p[1]);
            if (!softEdge(d, r, x, y, 0.3)) continue;
            if (d < r * 0.32) mark(x, y, white);
            else mark(x, y, vivid);
          }
        }
        break;
      }
      case "terre_creuse": {
        const coreR = Math.max(2, Math.round(R * 0.16));
        const shellR = R * 0.7;
        for (const [x, y, dx, dy] of pts) {
          const d = Math.hypot(dx, dy);
          if (d >= shellR) continue;
          if (d < coreR) mark(x, y, d < coreR * 0.4 ? white : vivid);
          else setPx(x, y, voidRgb);
        }
        break;
      }
      case "fracture": {
        // Chemin irrégulier plutôt qu'une ligne droite : marche aléatoire
        // le long de l'axe, avec une dérive latérale qui varie doucement.
        const theta = instRand() * Math.PI;
        const perp = theta + Math.PI / 2;
        const steps = Math.round(R * 2.6);
        let lateral = 0;
        const path: [number, number][] = [];
        for (let s = 0; s < steps; s++) {
          lateral += (instRand() - 0.5) * 1.6;
          lateral = Math.max(-R * 0.32, Math.min(R * 0.32, lateral));
          const t = s - steps / 2;
          path.push([cx + Math.cos(theta) * t + Math.cos(perp) * lateral, cy + Math.sin(theta) * t + Math.sin(perp) * lateral]);
        }
        const gapHalf = 1.5;
        const edgeHalf = 3.0;
        for (const [x, y] of pts) {
          let best = Infinity;
          for (const [px_, py_] of path) {
            const d = Math.hypot(x - px_, y - py_);
            if (d < best) best = d;
          }
          if (best < gapHalf) setPx(x, y, voidRgb);
          else if (best < edgeHalf) mark(x, y, vivid);
        }
        break;
      }
      case "gravite_inversee": {
        for (let y = cy - R - 2; y <= cy + R + 2; y++) {
          for (let x = cx - R - 2; x <= cx + R + 2; x++) {
            const dx = x - cx;
            const dy = y - cy;
            const d2 = dx * dx + dy * dy;
            if (d2 <= R * R || d2 > (R + 2) * (R + 2)) continue;
            if (x < 0 || y < 0 || x >= size || y >= size) continue;
            setPx(x, y, lerp(getPx(x, y), vivid, 0.35));
          }
        }
        break;
      }
      case "trou_de_ver": {
        const p = pick(instRand);
        const r = Math.max(3, Math.round(R * 0.28));
        for (const [x, y] of pts) {
          const d = Math.hypot(x - p[0], y - p[1]);
          if (d <= r) setPx(x, y, voidRgb);
          else if (softEdge(d, r, x, y, 0.15)) mark(x, y, vivid);
        }
        break;
      }
      case "temps_distordu": {
        for (const [x, y] of pts) setPx(x, y, lerp(getPx(x, y), light, 0.35));
        break;
      }
      case "faune_photobio": {
        const n = 8 + Math.floor(traitRand() * 6);
        for (let i = 0; i < n; i++) {
          const p = pts[Math.floor(traitRand() * pts.length)]!;
          const nightSide = bandAt(p[2], p[3], R, p[0], p[1]) === 0;
          mark(p[0], p[1], nightSide ? vivid : light);
        }
        break;
      }
      case "energie_infinie": {
        const nRivers = 4 + Math.floor(instRand() * 4);
        for (let i = 0; i < nRivers; i++) {
          const p = pick(instRand);
          let x = p[0];
          let y = p[1];
          let angle = instRand() * Math.PI * 2;
          const steps = Math.round(R * (1.2 + instRand() * 0.8));
          for (let s = 0; s < steps; s++) {
            angle += (instRand() - 0.5) * 0.5;
            x += Math.cos(angle);
            y += Math.sin(angle);
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy > R * R) break;
            mark(Math.round(x), Math.round(y), vivid);
          }
        }
        break;
      }
      case "planete_etre": {
        for (const [x, y] of pts) setPx(x, y, voidRgb);
        for (const [x, y, dx, dy] of pts) {
          if (Math.hypot(dx, dy) >= R - 1.4) mark(x, y, vivid);
        }
        const eyeR = Math.max(2, Math.round(R * 0.22));
        for (const [x, y, dx, dy] of pts) {
          const d = Math.hypot(dx, dy);
          if (d < eyeR) mark(x, y, d < eyeR * 0.4 ? white : vivid);
        }
        break;
      }
      case "megastructure": {
        // Aspect circuit imprimé : nœuds alignés sur une grille, reliés par
        // des traces à angle droit, avec un petit plot à chaque nœud.
        const gridStep = Math.max(2, Math.round(2 * scale));
        const nNodes = 5 + Math.floor(instRand() * 4);
        const nodes: [number, number][] = [];
        for (let i = 0; i < nNodes; i++) {
          const p = pick(instRand);
          const gx = cx + Math.round((p[0] - cx) / gridStep) * gridStep;
          const gy = cy + Math.round((p[1] - cy) / gridStep) * gridStep;
          if (inDisc(gx, gy)) nodes.push([gx, gy]);
        }
        const trace = (x0: number, y0: number, x1: number, y1: number): void => {
          let x = x0;
          const sx = x1 >= x0 ? 1 : -1;
          while (x !== x1) {
            if (inDisc(x, y0)) mark(x, y0, vivid);
            x += sx;
          }
          let y = y0;
          const sy = y1 >= y0 ? 1 : -1;
          while (y !== y1) {
            if (inDisc(x1, y)) mark(x1, y, vivid);
            y += sy;
          }
          if (inDisc(x1, y1)) mark(x1, y1, vivid);
        };
        for (let i = 0; i < nodes.length - 1; i++) {
          const a = nodes[i]!;
          const b = nodes[i + 1]!;
          trace(a[0], a[1], b[0], b[1]);
        }
        const extra = Math.floor(instRand() * 3);
        for (let i = 0; i < extra && nodes.length > 2; i++) {
          const a = nodes[Math.floor(instRand() * nodes.length)]!;
          const b = nodes[Math.floor(instRand() * nodes.length)]!;
          trace(a[0], a[1], b[0], b[1]);
        }
        for (const [nx, ny] of nodes) {
          for (const [ddx, ddy] of [
            [0, 0],
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
          ] as const) {
            const x = nx + ddx;
            const y = ny + ddy;
            if (inDisc(x, y)) mark(x, y, ddx === 0 && ddy === 0 ? white : vivid);
          }
        }
        break;
      }
      case "realite_instable": {
        // Volontairement sans halo : un glitch doit rester net, pas lumineux.
        const n = 25 + Math.floor(traitRand() * 25);
        const palette = [vivid, light, white];
        for (let i = 0; i < n; i++) {
          const p = pts[Math.floor(traitRand() * pts.length)]!;
          setPx(p[0], p[1], palette[Math.floor(traitRand() * 3)]!);
        }
        break;
      }
      case "matiere_inconnue": {
        const ringMajor = R * 1.7;
        const ringMinor = R * 0.42;
        const ry = Math.ceil(ringMinor) + 2;
        const rx = Math.ceil(ringMajor) + 2;
        for (let y = cy - ry; y <= cy + ry; y++) {
          for (let x = cx - rx; x <= cx + rx; x++) {
            if (x < 0 || y < 0 || x >= size || y >= size) continue;
            const dx = x - cx;
            const dy = y - cy;
            if (Math.hypot(dx, dy) <= R + 1) continue;
            const rr = Math.hypot(dx / ringMajor, dy / ringMinor);
            if (Math.abs(rr - 1) < 0.06) mark(x, y, dx > 0 ? light : vivid);
          }
        }
        break;
      }
    }

    // Halo néon : chaque pixel voisin d'un cœur lumineux se teinte de violet
    // clair, sans jamais écraser un autre pixel de cœur.
    if (neonCore.length) {
      const coreSet = new Set(neonCore.map(([x, y]) => x + "," + y));
      const neighbours = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ] as const;
      for (const [x, y] of neonCore) {
        for (const [ddx, ddy] of neighbours) {
          const nx = x + ddx;
          const ny = y + ddy;
          if (nx < 0 || ny < 0 || nx >= size || ny >= size) continue;
          if (coreSet.has(nx + "," + ny)) continue;
          setPx(nx, ny, lerp(getPx(nx, ny), light, 0.4));
        }
      }
    }
  }

  return { data, size, instanceSeed, anomalyKind: planetType === "anomalie" ? anomalyKind : null };
}

/**
 * Réduit le rendu 64×64 en icône 16×16 : moyennage par blocs 4×4, puis
 * réalignement de chaque pixel sur la couleur la plus proche présente dans
 * le rendu d'origine. Sans ce réalignement, l'icône serait floue et hors palette.
 */
export function reduireIcone16({ data, size }: PlanetImage): PlanetImage {
  const factor = size / ICON;
  const palette: RGB[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < size * size; i++) {
    const key = (data[i * 4]! << 16) | (data[i * 4 + 1]! << 8) | data[i * 4 + 2]!;
    if (!seen.has(key)) {
      seen.add(key);
      palette.push([data[i * 4]!, data[i * 4 + 1]!, data[i * 4 + 2]!]);
    }
  }
  const out = new Uint8ClampedArray(ICON * ICON * 4);
  for (let y = 0; y < ICON; y++) {
    for (let x = 0; x < ICON; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let n = 0;
      for (let sy = 0; sy < factor; sy++) {
        for (let sx = 0; sx < factor; sx++) {
          const i = ((y * factor + sy) * size + (x * factor + sx)) * 4;
          r += data[i]!;
          g += data[i + 1]!;
          b += data[i + 2]!;
          n++;
        }
      }
      const avg: RGB = [r / n, g / n, b / n];
      let best = palette[0]!;
      let bestD = Infinity;
      for (const p of palette) {
        const d = (p[0] - avg[0]) ** 2 + (p[1] - avg[1]) ** 2 + (p[2] - avg[2]) ** 2;
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      const o = (y * ICON + x) * 4;
      out[o] = best[0];
      out[o + 1] = best[1];
      out[o + 2] = best[2];
      out[o + 3] = 255;
    }
  }
  return { data: out, size: ICON };
}

export interface ImagesPlanete {
  big: RenduPlanete;
  icon: PlanetImage;
  instanceSeed: number;
  anomalyKind: AnomalyKind | null;
}

/**
 * Point d'entrée principal. `instanceSeed` est à passer pour un rendu stable
 * (planète déjà rencontrée) ; à omettre pour une toute nouvelle découverte
 * (un seed est alors tiré et renvoyé, à stocker par l'appelant).
 */
export function genererImagesPlanete(
  c: CaracteristiquesPlanete,
  planetType: TypePlanete = "classique",
  instanceSeed: number | null = null,
): ImagesPlanete {
  const big = genererImagePlanete64(c, planetType, instanceSeed);
  const icon = reduireIcone16(big);
  return { big, icon, instanceSeed: big.instanceSeed, anomalyKind: big.anomalyKind };
}

/** Peint un rendu dans un canvas, sans lissage (pixel art). */
export function peindreSurCanvas(canvas: HTMLCanvasElement, image: PlanetImage, displayScale = 1): void {
  const { data, size } = image;
  canvas.width = size * displayScale;
  canvas.height = size * displayScale;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  const off = document.createElement("canvas");
  off.width = size;
  off.height = size;
  off.getContext("2d")!.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, size, size), 0, 0);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

/** Convertit un rendu en data URL PNG, pour l'insérer dans un `<img src>`. */
export function imageEnDataUrl(image: PlanetImage, displayScale = 1): string {
  const canvas = document.createElement("canvas");
  peindreSurCanvas(canvas, image, displayScale);
  return canvas.toDataURL();
}
