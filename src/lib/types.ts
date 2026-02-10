// === Types pour les données JSON ===

export interface Equipment {
  id: string;
  name: string;
  category: string;
  description: string;
  forPro: boolean;
}

export interface Malt {
  id: string;
  name: string;
  type: string;
  color_ebc: number;
  potential_gravity: number;
  description: string;
  origin: string;
}

export interface Hop {
  id: string;
  name: string;
  alpha_acid: number;
  type: string;
  description: string;
  origin: string;
}

export interface Yeast {
  id: string;
  name: string;
  type: "ale" | "lager";
  attenuation: number;
  temp_min: number;
  temp_max: number;
  temp_ideal: number;
  alcohol_tolerance: number;
  flocculation: string;
  description: string;
}

export interface BeerStyle {
  id: string;
  name: string;
  color: string;
  og_min: number;
  og_max: number;
  ibu_min: number;
  ibu_max: number;
  abv_min: number;
  abv_max: number;
  ebc_min: number;
  ebc_max: number;
  description: string;
}

export interface Adjunct {
  id: string;
  name: string;
  category: string;
  gravity_contribution: number;
  description: string;
  usage: string;
}

export interface AdjunctAddition {
  adjunctId: string;
  amount: number; // en kg
}

// === Types pour l'eau et les volumes ===

export type WaterSourceType = "robinet" | "bouteille" | "osmosee" | "inconnu";
export type BrewingMethod = "kit" | "extrait" | "tout_grain";

export interface RecipeWater {
  sourceType: WaterSourceType;
  notes: string;
  mashWaterL: number;
  spargeWaterL: number;
  totalWaterL: number;
  preBoilVolumeL: number;
  postBoilVolumeL: number;
  lossesL: number;
}

export interface RecipeProcess {
  batchVolumeL: number;
  boilTimeMin: number;
  boilOffRateLPerHour: number;
}

export interface RecipeEquipmentInfo {
  kettleCapacityL: number;
  hasChiller: boolean;
  hasHydrometer: boolean;
  hasTempControl: boolean;
}

export interface WaterPlan {
  mashWaterL: number;
  spargeWaterL: number;
  totalWaterL: number;
  preBoilVolumeL: number;
  postBoilVolumeL: number;
  lossesL: number;
}

// === Types pour la procédure de fabrication ===

export interface ProcedureStep {
  id: string;
  title: string;
  durationMin?: number;
  details: string[];
  tips?: string[];
  warnings?: string[];
}

// === Types pour les vérifications de cohérence ===

export type CheckLevel = "ok" | "info" | "warn" | "danger";

export interface ConsistencyCheck {
  id: string;
  level: CheckLevel;
  title: string;
  message: string;
}

// === Types pour la recette (état du wizard) ===

export type UserType = "homebrew" | "pro";

export interface RecipeProfile {
  userType: UserType;
  selectedEquipment: string[]; // IDs du matériel sélectionné
}

export interface RecipeParams {
  recipeName: string;
  volume: number; // en litres
  styleId: string;
  method: BrewingMethod;
}

export interface MaltAddition {
  maltId: string;
  amount: number; // en kg
}

export interface HopAddition {
  hopId: string;
  amount: number; // en grammes
  timing: number; // minutes avant la fin de l'ébullition
}

export interface RecipeMashing {
  mashTemp: number; // °C
  boilDuration: number; // minutes
}

export interface RecipeFermentation {
  fermentationTemp: number; // °C
  primaryDays: number;
  hasSecondary: boolean;
  secondaryDays: number;
  secondaryTemp: number; // °C
}

export type ConditioningMode = "bottles" | "keg";

export interface RecipeConditioning {
  mode: ConditioningMode;
  sugarPerLiter: number; // g/L (pour embouteillage)
}

export interface Recipe {
  version: number;
  profile: RecipeProfile;
  params: RecipeParams;
  malts: MaltAddition[];
  hops: HopAddition[];
  adjuncts: AdjunctAddition[];
  yeastId: string;
  water: RecipeWater;
  process: RecipeProcess;
  equipmentInfo: RecipeEquipmentInfo;
  mashing: RecipeMashing;
  fermentation: RecipeFermentation;
  conditioning: RecipeConditioning;
}

// === Types pour le mode UI et l'assistant ===

export type UiMode = "beginner" | "expert";

/** État de l'assistant anti-erreurs (hygiène + risques masqués) */
export interface AssistantState {
  hygieneChecks: Record<string, boolean>;
  dismissedRiskIds: string[];
}

export const emptyAssistant: AssistantState = {
  hygieneChecks: {},
  dismissedRiskIds: [],
};

// === Types pour les résultats calculés ===

export interface CalculatedValues {
  og: number;        // densité initiale (ex: 1.050)
  ogPlato: number;   // en degrés Plato
  fg: number;        // densité finale
  abv: number;       // % alcool
  ibu: number;       // amertume
  ebc: number;       // couleur
  colorLabel: string; // "blonde", "ambrée", etc.
  co2Volumes: number; // volumes de CO2
  totalSugar: number; // sucre total pour carbonatation (g)
}

// État initial d'une recette vide
export const emptyRecipe: Recipe = {
  version: 2,
  profile: {
    userType: "homebrew",
    selectedEquipment: [],
  },
  params: {
    recipeName: "",
    volume: 20,
    styleId: "",
    method: "tout_grain",
  },
  malts: [{ maltId: "", amount: 0 }],
  hops: [{ hopId: "", amount: 0, timing: 60 }],
  adjuncts: [],
  yeastId: "",
  water: {
    sourceType: "robinet",
    notes: "",
    mashWaterL: 0,
    spargeWaterL: 0,
    totalWaterL: 0,
    preBoilVolumeL: 0,
    postBoilVolumeL: 0,
    lossesL: 0,
  },
  process: {
    batchVolumeL: 20,
    boilTimeMin: 60,
    boilOffRateLPerHour: 2.0,
  },
  equipmentInfo: {
    kettleCapacityL: 0,
    hasChiller: false,
    hasHydrometer: false,
    hasTempControl: false,
  },
  mashing: {
    mashTemp: 66,
    boilDuration: 60,
  },
  fermentation: {
    fermentationTemp: 20,
    primaryDays: 10,
    hasSecondary: false,
    secondaryDays: 14,
    secondaryTemp: 12,
  },
  conditioning: {
    mode: "bottles",
    sugarPerLiter: 7,
  },
};
