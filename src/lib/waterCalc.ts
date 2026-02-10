/**
 * Calculs d'eau et de volumes pour le brassage.
 *
 * Hypothèses par défaut (mode débutant) :
 * - Absorption grains : 0.8 L/kg
 * - Pertes fond de cuve / transfert : 1.0 L
 * - Évaporation : 2.0 L/heure (défaut)
 * - Ratio empâtage : 2.7 L/kg de grain
 *
 * Ces valeurs sont des estimations conservatrices pour un brasseur amateur.
 * Voir docs/estimations.md pour plus de détails.
 */

import { Recipe, WaterPlan, BrewingMethod, MaltAddition } from "./types";

// === Constantes par défaut ===

/** Absorption d'eau par les grains (L par kg de grain) */
const GRAIN_ABSORPTION_L_PER_KG = 0.8;

/** Pertes fixes : fond de cuve, transferts (L) */
const FIXED_LOSSES_L = 1.0;

/** Ratio eau d'empâtage : litres d'eau par kg de grain */
const MASH_RATIO_L_PER_KG = 2.7;

/** Pertes de trub (résidus de houblon/protéines) en fin d'ébullition (L) */
const TRUB_LOSS_L = 0.5;

/**
 * Calcule la masse totale des grains (kg) à partir des additions de malts.
 */
export function totalGrainKg(malts: MaltAddition[]): number {
  return malts
    .filter((m) => m.maltId && m.amount > 0)
    .reduce((sum, m) => sum + m.amount, 0);
}

/**
 * Calcule le plan d'eau complet en fonction de l'état de la recette.
 *
 * @param recipe - État complet de la recette
 * @returns WaterPlan avec tous les volumes calculés
 */
export function calculateWaterPlan(recipe: Recipe): WaterPlan {
  const method = recipe.params.method;
  const batchVolumeL = recipe.params.volume;
  const boilTimeMin = recipe.mashing.boilDuration || recipe.process.boilTimeMin || 60;
  const boilOffRate = recipe.process.boilOffRateLPerHour || 2.0;

  if (method === "kit" || method === "extrait") {
    return calculateExtractWater(batchVolumeL, boilTimeMin, boilOffRate);
  }

  return calculateAllGrainWater(
    batchVolumeL,
    recipe.malts,
    boilTimeMin,
    boilOffRate
  );
}

/**
 * Calcul pour méthode Kit / Extrait.
 * Pas d'empâtage ni de rinçage — on chauffe simplement l'eau pour diluer l'extrait.
 */
function calculateExtractWater(
  batchVolumeL: number,
  boilTimeMin: number,
  boilOffRate: number
): WaterPlan {
  const boilOffL = boilOffRate * (boilTimeMin / 60);
  const lossesL = FIXED_LOSSES_L + TRUB_LOSS_L;
  const preBoilVolumeL = batchVolumeL + boilOffL + TRUB_LOSS_L;
  const totalWaterL = preBoilVolumeL + FIXED_LOSSES_L;

  return {
    mashWaterL: 0,
    spargeWaterL: 0,
    totalWaterL: round(totalWaterL),
    preBoilVolumeL: round(preBoilVolumeL),
    postBoilVolumeL: round(batchVolumeL),
    lossesL: round(lossesL + boilOffL),
    grainAbsorptionL: 0,
    boilOffL: round(boilOffL),
    trubLossL: TRUB_LOSS_L,
    fixedLossesL: FIXED_LOSSES_L,
  };
}

/**
 * Calcul pour méthode Tout-grain.
 */
function calculateAllGrainWater(
  batchVolumeL: number,
  malts: MaltAddition[],
  boilTimeMin: number,
  boilOffRate: number
): WaterPlan {
  const grainKg = totalGrainKg(malts);

  // Eau absorbée par les grains
  const grainAbsorptionL = grainKg * GRAIN_ABSORPTION_L_PER_KG;

  // Évaporation pendant l'ébullition
  const boilOffL = boilOffRate * (boilTimeMin / 60);

  // Volume avant ébullition nécessaire
  const preBoilVolumeL = batchVolumeL + boilOffL + TRUB_LOSS_L;

  // Eau d'empâtage
  const mashWaterL = grainKg * MASH_RATIO_L_PER_KG;

  // Eau de rinçage (sparge)
  // = Volume pré-ébullition - (eau empâtage - absorption grains)
  const spargeWaterL = Math.max(0, preBoilVolumeL - mashWaterL + grainAbsorptionL);

  // Eau totale
  const totalWaterL = mashWaterL + spargeWaterL;

  // Pertes totales
  const lossesL = grainAbsorptionL + FIXED_LOSSES_L + TRUB_LOSS_L + boilOffL;

  return {
    mashWaterL: round(mashWaterL),
    spargeWaterL: round(spargeWaterL),
    totalWaterL: round(totalWaterL),
    preBoilVolumeL: round(preBoilVolumeL),
    postBoilVolumeL: round(batchVolumeL),
    lossesL: round(lossesL),
    grainAbsorptionL: round(grainAbsorptionL),
    boilOffL: round(boilOffL),
    trubLossL: TRUB_LOSS_L,
    fixedLossesL: FIXED_LOSSES_L,
  };
}

/**
 * Arrondi à 1 décimale.
 */
function round(n: number): number {
  return Math.round(n * 10) / 10;
}

// === Export des constantes pour affichage/docs ===
export const WATER_DEFAULTS = {
  grainAbsorption: GRAIN_ABSORPTION_L_PER_KG,
  fixedLosses: FIXED_LOSSES_L,
  mashRatio: MASH_RATIO_L_PER_KG,
  trubLoss: TRUB_LOSS_L,
} as const;
