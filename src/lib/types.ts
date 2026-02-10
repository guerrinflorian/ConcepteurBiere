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
  version: 1,
  profile: {
    userType: "homebrew",
    selectedEquipment: [],
  },
  params: {
    recipeName: "",
    volume: 20,
    styleId: "",
  },
  malts: [{ maltId: "", amount: 0 }],
  hops: [{ hopId: "", amount: 0, timing: 60 }],
  adjuncts: [],
  yeastId: "",
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
