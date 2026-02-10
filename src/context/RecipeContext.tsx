"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  Recipe,
  emptyRecipe,
  Equipment,
  Malt,
  Hop,
  Yeast,
  BeerStyle,
  Adjunct,
  CalculatedValues,
  UiMode,
  AssistantState,
  emptyAssistant,
} from "@/lib/types";
import { calculateAll } from "@/lib/calculations";
import { StepValidation, validateAllSteps, isStepAccessible as checkStepAccessible } from "@/lib/validation";

interface RecipeContextType {
  recipe: Recipe;
  setRecipe: React.Dispatch<React.SetStateAction<Recipe>>;
  updateRecipe: (partial: Partial<Recipe>) => void;

  // Données de référence chargées depuis les API
  equipmentData: Equipment[];
  maltsData: Malt[];
  hopsData: Hop[];
  yeastsData: Yeast[];
  stylesData: BeerStyle[];
  adjunctsData: Adjunct[];
  tipsData: Record<string, string>;
  dataLoaded: boolean;

  // Valeurs calculées
  calculated: CalculatedValues;

  // Navigation du wizard
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;

  // Validation
  stepValidations: StepValidation[];
  isStepAccessible: (step: number) => boolean;

  // Import/Export
  exportRecipe: () => void;
  importRecipe: (json: string) => boolean;
  resetRecipe: () => void;

  // Mode UI (Débutant / Expert)
  uiMode: UiMode;
  setUiMode: (mode: UiMode) => void;

  // Assistant anti-erreurs
  assistant: AssistantState;
  toggleHygieneCheck: (checkId: string) => void;
  dismissRisk: (riskId: string) => void;
  resetAssistant: () => void;

  // Glossaire
  showGlossary: boolean;
  setShowGlossary: (show: boolean) => void;
}

const RecipeContext = createContext<RecipeContextType | null>(null);

export function useRecipe() {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipe doit être utilisé dans un RecipeProvider");
  return ctx;
}

const TOTAL_STEPS = 9;

export function RecipeProvider({ children }: { children: React.ReactNode }) {
  const [recipe, setRecipe] = useState<Recipe>(emptyRecipe);
  const [currentStep, setCurrentStep] = useState(0);
  const [uiMode, setUiMode] = useState<UiMode>("beginner");
  const [assistant, setAssistant] = useState<AssistantState>(emptyAssistant);
  const [showGlossary, setShowGlossary] = useState(false);

  // Données de référence
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const [maltsData, setMaltsData] = useState<Malt[]>([]);
  const [hopsData, setHopsData] = useState<Hop[]>([]);
  const [yeastsData, setYeastsData] = useState<Yeast[]>([]);
  const [stylesData, setStylesData] = useState<BeerStyle[]>([]);
  const [adjunctsData, setAdjunctsData] = useState<Adjunct[]>([]);
  const [tipsData, setTipsData] = useState<Record<string, string>>({});
  const [dataLoaded, setDataLoaded] = useState(false);

  // Charger les données depuis les API au montage
  useEffect(() => {
    async function loadData() {
      try {
        const [eqRes, maltRes, hopRes, yeastRes, styleRes, adjRes, tipsRes] = await Promise.all([
          fetch("/api/equipment"),
          fetch("/api/malts"),
          fetch("/api/hops"),
          fetch("/api/yeasts"),
          fetch("/api/styles"),
          fetch("/api/adjuncts"),
          fetch("/api/tips"),
        ]);
        setEquipmentData(await eqRes.json());
        setMaltsData(await maltRes.json());
        setHopsData(await hopRes.json());
        setYeastsData(await yeastRes.json());
        setStylesData(await styleRes.json());
        setAdjunctsData(await adjRes.json());
        setTipsData(await tipsRes.json());
        setDataLoaded(true);
      } catch (err) {
        console.error("Erreur de chargement des données:", err);
      }
    }
    loadData();
  }, []);

  const updateRecipe = useCallback((partial: Partial<Recipe>) => {
    setRecipe((prev) => ({ ...prev, ...partial }));
  }, []);

  // Calculer les valeurs en temps réel
  const yeast = yeastsData.find((y) => y.id === recipe.yeastId);
  const calculated = calculateAll(
    recipe.malts,
    recipe.hops,
    yeast,
    maltsData,
    hopsData,
    recipe.params.volume,
    recipe.conditioning.sugarPerLiter,
    recipe.conditioning.mode,
    recipe.adjuncts ?? [],
    adjunctsData
  );

  // Validation inter-étapes
  const stepValidations = validateAllSteps(recipe, equipmentData);
  const isStepAccessible = (step: number) => checkStepAccessible(step, stepValidations);

  // Export de la recette en JSON
  const exportRecipe = useCallback(() => {
    const data = JSON.stringify(recipe, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${recipe.params.recipeName || "recette"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recipe]);

  // Import d'une recette depuis un JSON
  const importRecipe = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json);
      // Vérification basique de la structure
      if (!parsed.version || !parsed.profile || !parsed.params) {
        return false;
      }
      // Fusionner avec les valeurs par défaut pour éviter les champs manquants
      const merged: Recipe = {
        ...emptyRecipe,
        ...parsed,
        profile: { ...emptyRecipe.profile, ...parsed.profile },
        params: { ...emptyRecipe.params, ...parsed.params },
        mashing: { ...emptyRecipe.mashing, ...parsed.mashing },
        fermentation: { ...emptyRecipe.fermentation, ...parsed.fermentation },
        conditioning: { ...emptyRecipe.conditioning, ...parsed.conditioning },
        adjuncts: parsed.adjuncts ?? [],
      };
      setRecipe(merged);
      setCurrentStep(8); // Aller au résumé
      return true;
    } catch {
      return false;
    }
  }, []);

  const resetRecipe = useCallback(() => {
    setRecipe(emptyRecipe);
    setCurrentStep(0);
    setAssistant(emptyAssistant);
  }, []);

  const toggleHygieneCheck = useCallback((checkId: string) => {
    setAssistant((prev) => ({
      ...prev,
      hygieneChecks: {
        ...prev.hygieneChecks,
        [checkId]: !prev.hygieneChecks[checkId],
      },
    }));
  }, []);

  const dismissRisk = useCallback((riskId: string) => {
    setAssistant((prev) => ({
      ...prev,
      dismissedRiskIds: [...prev.dismissedRiskIds, riskId],
    }));
  }, []);

  const resetAssistant = useCallback(() => {
    setAssistant(emptyAssistant);
  }, []);

  return (
    <RecipeContext.Provider
      value={{
        recipe,
        setRecipe,
        updateRecipe,
        equipmentData,
        maltsData,
        hopsData,
        yeastsData,
        stylesData,
        adjunctsData,
        tipsData,
        dataLoaded,
        calculated,
        currentStep,
        setCurrentStep,
        totalSteps: TOTAL_STEPS,
        stepValidations,
        isStepAccessible,
        exportRecipe,
        importRecipe,
        resetRecipe,
        uiMode,
        setUiMode,
        assistant,
        toggleHygieneCheck,
        dismissRisk,
        resetAssistant,
        showGlossary,
        setShowGlossary,
      }}
    >
      {children}
    </RecipeContext.Provider>
  );
}
