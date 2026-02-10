/**
 * Vérifications automatiques de cohérence pour la recette.
 *
 * Chaque check évalue l'état de la recette et retourne un message
 * avec un niveau de sévérité (ok, info, warn, danger).
 */

import { Recipe, ConsistencyCheck, Equipment } from "./types";
import { calculateWaterPlan, totalGrainKg } from "./waterCalc";

interface CheckContext {
  recipe: Recipe;
  kettleCapacityL: number;
  hasChiller: boolean;
  hasHydrometer: boolean;
  hasTempControl: boolean;
}

/**
 * Construit le contexte à partir de la recette et de l'équipement.
 */
export function buildCheckContext(
  recipe: Recipe,
  equipmentData: Equipment[]
): CheckContext {
  const selected = recipe.profile.selectedEquipment
    .map((id) => equipmentData.find((e) => e.id === id))
    .filter(Boolean) as Equipment[];

  // Extraire la capacité de la plus grande cuve
  let kettleCapacityL = recipe.equipmentInfo.kettleCapacityL || 0;
  if (!kettleCapacityL) {
    const kettles = selected.filter((e) => e.category === "cuve");
    for (const k of kettles) {
      const match = k.name.match(/(\d+)\s*[Ll]/);
      if (match) {
        const cap = parseInt(match[1]);
        if (cap > kettleCapacityL) kettleCapacityL = cap;
      }
    }
  }

  const hasChiller = recipe.equipmentInfo.hasChiller ||
    selected.some((e) => e.category === "refroidissement");
  const hasTempControl = recipe.equipmentInfo.hasTempControl ||
    selected.some((e) => e.category === "température");
  const hasHydrometer = recipe.equipmentInfo.hasHydrometer ||
    recipe.profile.selectedEquipment.includes("hydrometer");

  return {
    recipe,
    kettleCapacityL,
    hasChiller,
    hasHydrometer,
    hasTempControl,
  };
}

/**
 * Exécute toutes les vérifications de cohérence et retourne les résultats.
 */
export function runConsistencyChecks(ctx: CheckContext): ConsistencyCheck[] {
  const checks: ConsistencyCheck[] = [];
  const waterPlan = calculateWaterPlan(ctx.recipe);

  // 1) Cuve trop petite
  if (ctx.kettleCapacityL > 0) {
    if (ctx.kettleCapacityL < waterPlan.preBoilVolumeL * 1.05) {
      checks.push({
        id: "kettle_too_small_danger",
        level: "danger",
        title: "Cuve trop petite !",
        message: `Votre cuve (${ctx.kettleCapacityL} L) est dangereusement petite pour ${waterPlan.preBoilVolumeL} L de moût pré-ébullition. Risque de débordement certain.`,
      });
    } else if (ctx.kettleCapacityL < waterPlan.preBoilVolumeL * 1.15) {
      checks.push({
        id: "kettle_too_small_warn",
        level: "warn",
        title: "Marge de cuve très juste",
        message: `Votre cuve (${ctx.kettleCapacityL} L) laisse peu de marge pour ${waterPlan.preBoilVolumeL} L de moût. Surveillez l'ébullition attentivement.`,
      });
    }
  }

  // 2) Pas de refroidisseur + gros volume
  if (!ctx.hasChiller && ctx.recipe.params.volume >= 15) {
    checks.push({
      id: "no_chiller_volume",
      level: "warn",
      title: "Pas de refroidisseur pour ce volume",
      message: `Refroidir ${ctx.recipe.params.volume} L sans refroidisseur sera long. Prévoyez un bain de glace conséquent ou investissez dans un serpentin.`,
    });
  }

  // 3) Quantités de grains incohérentes (tout-grain)
  if (ctx.recipe.params.method === "tout_grain") {
    const grainKg = totalGrainKg(ctx.recipe.malts);
    const vol = ctx.recipe.params.volume;

    if (grainKg > 0 && grainKg < 2 && vol >= 15) {
      checks.push({
        id: "low_grain",
        level: "warn",
        title: "Très peu de grain pour le volume",
        message: `${grainKg.toFixed(1)} kg de grain pour ${vol} L : la bière sera très légère. Visez au moins ${(vol * 0.2).toFixed(1)} kg.`,
      });
    }

    if (grainKg > 0 && ctx.kettleCapacityL > 0) {
      // Volume d'empâtage approximatif : grain * 2.7 + grain * 0.7 (volume du grain)
      const mashVolume = grainKg * 3.4;
      if (mashVolume > ctx.kettleCapacityL * 0.9) {
        checks.push({
          id: "grain_too_much_for_kettle",
          level: "danger",
          title: "Trop de grain pour votre cuve",
          message: `${grainKg.toFixed(1)} kg de grain + eau d'empâtage ≈ ${mashVolume.toFixed(0)} L. Votre cuve de ${ctx.kettleCapacityL} L ne suffira pas.`,
        });
      }
    }
  }

  // 4) Temps d'ébullition trop court
  if (ctx.recipe.mashing.boilDuration > 0 && ctx.recipe.mashing.boilDuration < 45) {
    checks.push({
      id: "boil_too_short",
      level: "warn",
      title: "Ébullition courte",
      message: `${ctx.recipe.mashing.boilDuration} min d'ébullition : l'extraction d'amertume et l'évaporation du DMS peuvent être insuffisantes. 60 min est recommandé.`,
    });
  }

  // 5) Eau totale très élevée
  if (waterPlan.totalWaterL > 50) {
    checks.push({
      id: "high_water_volume",
      level: "info",
      title: "Grand volume d'eau",
      message: `${waterPlan.totalWaterL} L d'eau au total. Assurez-vous d'avoir la logistique pour chauffer et manipuler ce volume.`,
    });
  }

  // 6) Pas de densimètre
  if (!ctx.hasHydrometer) {
    checks.push({
      id: "no_hydrometer",
      level: "info",
      title: "Pas de densimètre",
      message: "Sans densimètre, vous ne pourrez pas vérifier la fin de fermentation. Attendez au minimum 3 semaines avant d'embouteiller.",
    });
  }

  return checks;
}
