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
      if (!recipe.params.volume || recipe.params.volume <= 0)
        errors.push("Veuillez indiquer un volume de brassin (en litres). Le champ est vide ou à 0.");
      break;
    }
    case 2: {
      if (recipe.malts.length === 0) {
        errors.push("Ajoutez au moins un malt.");
        break;
      }
      const maltsWithoutId = recipe.malts.filter((m) => !m.maltId);
      if (maltsWithoutId.length > 0)
        errors.push("Chaque malt ajouté doit avoir un malt sélectionné dans la liste.");
      const maltsWithoutAmount = recipe.malts.filter((m) => m.maltId && (!m.amount || m.amount <= 0));
      if (maltsWithoutAmount.length > 0)
        errors.push("Chaque malt sélectionné doit avoir une quantité supérieure à 0.");
      const hasValidMalt = recipe.malts.some((m) => m.maltId && m.amount > 0);
      if (!hasValidMalt) errors.push("Ajoutez au moins un malt avec une quantité supérieure à 0.");
      break;
    }
    case 3: {
      if (recipe.hops.length === 0) {
        errors.push("Ajoutez au moins un houblon.");
        break;
      }
      const hopsWithoutId = recipe.hops.filter((h) => !h.hopId);
      if (hopsWithoutId.length > 0)
        errors.push("Chaque houblon ajouté doit avoir un houblon sélectionné dans la liste.");
      const hopsWithoutAmount = recipe.hops.filter((h) => h.hopId && (!h.amount || h.amount <= 0));
      if (hopsWithoutAmount.length > 0)
        errors.push("Chaque houblon sélectionné doit avoir une quantité supérieure à 0.");
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
      if (!recipe.mashing.boilDuration || recipe.mashing.boilDuration <= 0)
        errors.push("Veuillez indiquer une durée d'ébullition (en minutes). Le champ est vide ou à 0.");
      break;
    }
    case 6: {
      const temp = recipe.fermentation.fermentationTemp;
      if (temp === undefined || temp === null || isNaN(temp) || temp < 4 || temp > 35)
        errors.push("La température de fermentation doit être comprise entre 4 et 35°C. Vérifiez la valeur saisie.");
      if (!recipe.fermentation.primaryDays || recipe.fermentation.primaryDays <= 0)
        errors.push("Veuillez indiquer la durée de fermentation primaire (en jours). Le champ est vide ou à 0.");
      if (recipe.fermentation.hasSecondary) {
        if (!recipe.fermentation.secondaryDays || recipe.fermentation.secondaryDays <= 0)
          errors.push("Veuillez indiquer la durée de fermentation secondaire (en jours).");
      }
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
