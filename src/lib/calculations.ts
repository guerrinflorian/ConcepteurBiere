import { Malt, Hop, Yeast, MaltAddition, HopAddition, CalculatedValues, AdjunctAddition, Adjunct } from "./types";

// Rendement d'empâtage supposé (homebrew typique ~72%)
const MASH_EFFICIENCY = 0.72;

// Conversion kg → lbs
const KG_TO_LBS = 2.20462;
// Conversion L → gallons US
const L_TO_GAL = 0.264172;

/**
 * Calcule la densité initiale (OG) à partir des malts, adjuvants et du volume.
 * Méthode PPG : OG = 1 + somme(masse_lbs * PPG * efficacité) / volume_gal / 1000
 */
export function calculateOG(
  maltAdditions: MaltAddition[],
  maltsData: Malt[],
  volumeL: number,
  adjunctAdditions: AdjunctAddition[] = [],
  adjunctsData: Adjunct[] = []
): number {
  if (volumeL <= 0) return 1.0;

  const volumeGal = volumeL * L_TO_GAL;
  let totalGravityPoints = 0;

  for (const addition of maltAdditions) {
    const malt = maltsData.find((m) => m.id === addition.maltId);
    if (!malt || addition.amount <= 0) continue;

    const masseLbs = addition.amount * KG_TO_LBS;
    // PPG = (potential_gravity - 1) * 1000  (ex: 1.037 → 37 PPG)
    const ppg = (malt.potential_gravity - 1) * 1000;
    totalGravityPoints += masseLbs * ppg * MASH_EFFICIENCY;
  }

  // Adjuvants avec contribution de gravité (efficacité 100% pour sucres)
  for (const addition of adjunctAdditions) {
    const adjunct = adjunctsData.find((a) => a.id === addition.adjunctId);
    if (!adjunct || addition.amount <= 0) continue;
    if (adjunct.gravity_contribution > 1.0) {
      const masseLbs = addition.amount * KG_TO_LBS;
      const ppg = (adjunct.gravity_contribution - 1) * 1000;
      totalGravityPoints += masseLbs * ppg; // 100% efficiency for sugars
    }
  }

  const og = 1 + totalGravityPoints / (volumeGal * 1000);
  return Math.round(og * 1000) / 1000;
}

/**
 * Convertit OG en degrés Plato.
 */
export function ogToPlato(og: number): number {
  // Approximation : °P ≈ (-1 + 1 / (1.00001 - (og - 1) / 0.004)) ...
  // Plus simple : °P ≈ (og - 1) * 1000 / 4
  // Formule plus précise :
  const plato = -616.868 + 1111.14 * og - 630.272 * og * og + 135.997 * og * og * og;
  return Math.round(plato * 10) / 10;
}

/**
 * Calcule la densité finale (FG) à partir de l'OG et de l'atténuation de la levure.
 */
export function calculateFG(og: number, attenuationPercent: number): number {
  // Atténuation apparente
  const gravityPoints = (og - 1) * 1000;
  const fgPoints = gravityPoints * (1 - attenuationPercent / 100);
  return Math.round((1 + fgPoints / 1000) * 1000) / 1000;
}

/**
 * Calcule le taux d'alcool (ABV) à partir de OG et FG.
 * Formule classique : ABV = (OG - FG) × 131.25
 */
export function calculateABV(og: number, fg: number): number {
  const abv = (og - fg) * 131.25;
  return Math.round(abv * 10) / 10;
}

/**
 * Calcule l'IBU d'un ajout de houblon individuel (formule Tinseth).
 * IBU = (alpha * utilisation * masse_g * 1000) / (volume_L * 10)
 */
function tinsethUtilization(og: number, boilTimeMin: number): number {
  // Facteur de gravité
  const bignessFactor = 1.65 * Math.pow(0.000125, og - 1);
  // Facteur de temps d'ébullition
  const boilTimeFactor = (1 - Math.exp(-0.04 * boilTimeMin)) / 4.15;
  return bignessFactor * boilTimeFactor;
}

export function calculateIBU(
  hopAdditions: HopAddition[],
  hopsData: Hop[],
  og: number,
  volumeL: number
): number {
  if (volumeL <= 0) return 0;

  let totalIBU = 0;
  for (const addition of hopAdditions) {
    const hop = hopsData.find((h) => h.id === addition.hopId);
    if (!hop || addition.amount <= 0) continue;

    const utilization = tinsethUtilization(og, addition.timing);
    const ibu =
      (hop.alpha_acid / 100) * utilization * addition.amount * 1000 / (volumeL);
    totalIBU += ibu;
  }

  return Math.round(totalIBU * 10) / 10;
}

/**
 * Calcule la couleur EBC de la bière (méthode Morey adaptée en EBC).
 * MCU = somme(color_lovibond * masse_lb / volume_gal)
 * SRM = 1.4922 * MCU^0.6859
 * EBC = SRM * 1.97
 */
export function calculateEBC(
  maltAdditions: MaltAddition[],
  maltsData: Malt[],
  volumeL: number
): number {
  if (volumeL <= 0) return 0;

  // Convertir volume en gallons
  const volumeGal = volumeL * 0.264172;

  let mcu = 0;
  for (const addition of maltAdditions) {
    const malt = maltsData.find((m) => m.id === addition.maltId);
    if (!malt || addition.amount <= 0) continue;

    // EBC -> Lovibond : L ≈ (EBC + 1.2) / 2.026 (approximation inverse Morey)
    const lovibond = (malt.color_ebc + 1.2) / 2.026;
    // Masse en livres
    const masseLb = addition.amount * 2.20462;
    mcu += (lovibond * masseLb) / volumeGal;
  }

  if (mcu <= 0) return 0;

  const srm = 1.4922 * Math.pow(mcu, 0.6859);
  const ebc = srm * 1.97;
  return Math.round(ebc * 10) / 10;
}

/**
 * Donne un label de couleur en français à partir de l'EBC.
 */
export function ebcToColorLabel(ebc: number): string {
  if (ebc < 8) return "très pâle";
  if (ebc < 15) return "blonde";
  if (ebc < 25) return "dorée";
  if (ebc < 35) return "ambrée";
  if (ebc < 50) return "cuivrée";
  if (ebc < 70) return "brune";
  if (ebc < 100) return "brun foncé";
  return "noire";
}

/**
 * Convertit EBC en couleur CSS approximative.
 */
export function ebcToColor(ebc: number): string {
  // Mapping simplifié EBC -> couleur hex
  if (ebc <= 4) return "#FFE699";
  if (ebc <= 8) return "#FFD73B";
  if (ebc <= 12) return "#ECBE22";
  if (ebc <= 16) return "#BF9229";
  if (ebc <= 20) return "#BF8129";
  if (ebc <= 25) return "#BF6B29";
  if (ebc <= 33) return "#A55729";
  if (ebc <= 40) return "#8D4829";
  if (ebc <= 50) return "#754029";
  if (ebc <= 60) return "#5E3529";
  if (ebc <= 80) return "#472A29";
  if (ebc <= 100) return "#361F29";
  return "#1A0F0A";
}

/**
 * Donne un label textuel pour l'amertume IBU.
 */
export function ibuToLabel(ibu: number): string {
  if (ibu < 15) return "très douce";
  if (ibu < 25) return "douce";
  if (ibu < 35) return "modérée";
  if (ibu < 50) return "prononcée";
  if (ibu < 70) return "forte (IPA)";
  return "très forte";
}

/**
 * Calcule toutes les valeurs à partir de l'état de la recette.
 */
export function calculateAll(
  maltAdditions: MaltAddition[],
  hopAdditions: HopAddition[],
  yeast: Yeast | undefined,
  maltsData: Malt[],
  hopsData: Hop[],
  volumeL: number,
  sugarPerLiter: number,
  conditioningMode: "bottles" | "keg" = "bottles",
  adjunctAdditions: AdjunctAddition[] = [],
  adjunctsData: Adjunct[] = []
): CalculatedValues {
  const og = calculateOG(maltAdditions, maltsData, volumeL, adjunctAdditions, adjunctsData);
  const ogPlato = ogToPlato(og);
  const attenuation = yeast?.attenuation ?? 75;
  const fg = calculateFG(og, attenuation);
  const abv = calculateABV(og, fg);
  const ibu = calculateIBU(hopAdditions, hopsData, og, volumeL);
  const ebc = calculateEBC(maltAdditions, maltsData, volumeL);
  const colorLabel = ebcToColorLabel(ebc);
  // CO2 volumes : en fût, 2.5 par défaut ; en bouteilles, calculé depuis le sucre
  const co2Volumes = conditioningMode === "keg"
    ? 2.5
    : Math.round((sugarPerLiter / 4 + 0.85) * 10) / 10;
  const totalSugar = Math.round(sugarPerLiter * volumeL);

  return { og, ogPlato, fg, abv, ibu, ebc, colorLabel, co2Volumes, totalSugar };
}
