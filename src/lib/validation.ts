import { Recipe, Equipment } from "./types";

export interface StepValidation {
  valid: boolean;
  errors: string[];
}

export function validateStep(
  step: number,
  recipe: Recipe,
  equipmentData: Equipment[]
): StepValidation {
  const errors: string[] = [];

  switch (step) {
    case 0: {
      const hasKettle = recipe.profile.selectedEquipment.some((id) =>
        equipmentData.find((e) => e.id === id && e.category === "cuve")
      );
      const hasFermenter = recipe.profile.selectedEquipment.some((id) =>
        equipmentData.find((e) => e.id === id && e.category === "fermenteur")
      );
      if (!hasKettle) errors.push("Sélectionnez au moins une cuve de brassage.");
      if (!hasFermenter) errors.push("Sélectionnez au moins un fermenteur.");
      break;
    }
    case 1: {
      if (recipe.params.volume <= 0) errors.push("Le volume doit être supérieur à 0.");
      break;
    }
    case 2: {
      const hasValidMalt = recipe.malts.some((m) => m.maltId && m.amount > 0);
      if (!hasValidMalt) errors.push("Ajoutez au moins un malt avec une quantité supérieure à 0.");
      break;
    }
    case 3: {
      const hasValidHop = recipe.hops.some((h) => h.hopId && h.amount > 0);
      if (!hasValidHop) errors.push("Ajoutez au moins un houblon avec une quantité supérieure à 0.");
      break;
    }
    case 4: {
      if (!recipe.yeastId) errors.push("Sélectionnez une levure.");
      break;
    }
    case 5: {
      if (recipe.mashing.mashTemp < 60 || recipe.mashing.mashTemp > 72)
        errors.push("La température d'empâtage doit être entre 60 et 72°C.");
      if (recipe.mashing.boilDuration <= 0)
        errors.push("La durée d'ébullition doit être supérieure à 0.");
      break;
    }
    case 6: {
      if (recipe.fermentation.fermentationTemp < 4 || recipe.fermentation.fermentationTemp > 35)
        errors.push("La température de fermentation doit être entre 4 et 35°C.");
      if (recipe.fermentation.primaryDays <= 0)
        errors.push("La durée de fermentation doit être supérieure à 0 jours.");
      break;
    }
    case 7: {
      if (
        recipe.conditioning.mode === "bottles" &&
        (recipe.conditioning.sugarPerLiter < 4 || recipe.conditioning.sugarPerLiter > 10)
      ) {
        errors.push("Le sucre de refermentation doit être entre 4 et 10 g/L.");
      }
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAllSteps(
  recipe: Recipe,
  equipmentData: Equipment[]
): StepValidation[] {
  return Array.from({ length: 9 }, (_, i) => validateStep(i, recipe, equipmentData));
}

export function isStepAccessible(
  step: number,
  validations: StepValidation[]
): boolean {
  // Step 0 is always accessible
  if (step === 0) return true;
  // A step is accessible if all previous steps are valid
  for (let i = 0; i < step; i++) {
    if (!validations[i].valid) return false;
  }
  return true;
}
