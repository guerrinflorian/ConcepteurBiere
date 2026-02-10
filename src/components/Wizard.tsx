"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";
import StepIndicator from "@/components/ui/StepIndicator";
import LiveStats from "@/components/ui/LiveStats";
import ValidationErrors from "@/components/ui/ValidationErrors";
import EstimationsPanel from "@/components/estimations/EstimationsPanel";
import RiskBadge from "@/components/assistant/RiskBadge";
import RiskPanel from "@/components/assistant/RiskPanel";
import GlossaryModal from "@/components/help/GlossaryModal";
import HygieneChecklist from "@/components/assistant/HygieneChecklist";
import Step0Profile from "@/components/steps/Step0Profile";
import Step1Params from "@/components/steps/Step1Params";
import Step2Malts from "@/components/steps/Step2Malts";
import Step3Hops from "@/components/steps/Step3Hops";
import Step4Yeast from "@/components/steps/Step4Yeast";
import Step5Mashing from "@/components/steps/Step5Mashing";
import Step6Fermentation from "@/components/steps/Step6Fermentation";
import Step7Conditioning from "@/components/steps/Step7Conditioning";
import Step8Summary from "@/components/steps/Step8Summary";
import { hygieneChecklist } from "@/data/hygieneChecklist";
import { useState, useRef, useMemo } from "react";

/** Mapping étape → stepId pour la checklist d'hygiène */
const stepIdMap: Record<number, string> = {
  0: "step0",
  2: "step2",
  5: "step5",
  6: "step6",
  7: "step7",
};

const steps = [
  Step0Profile,
  Step1Params,
  Step2Malts,
  Step3Hops,
  Step4Yeast,
  Step5Mashing,
  Step6Fermentation,
  Step7Conditioning,
  Step8Summary,
];

const STEP_NAMES = [
  "Profil & Équipement",
  "Paramètres",
  "Malts & Céréales",
  "Houblons",
  "Levure",
  "Empâtage & Ébullition",
  "Fermentation",
  "Conditionnement",
  "Résumé",
];

// Variantes d'animation pour les transitions entre étapes
const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 200 : -200,
    opacity: 0,
  }),
};

/**
 * Composant principal du wizard multi-étapes.
 * Intègre le toggle Débutant/Expert, le badge de risques, le lexique,
 * la checklist d'hygiène et le panneau d'estimations.
 * Bloque la progression si les checkboxes d'hygiène ne sont pas cochées.
 */
export default function Wizard() {
  const {
    currentStep,
    setCurrentStep,
    totalSteps,
    dataLoaded,
    stepValidations,
    uiMode,
    setUiMode,
    showGlossary,
    setShowGlossary,
    assistant,
    recipe,
    equipmentData,
  } = useRecipe();
  const [direction, setDirection] = useState(0);
  const prevStep = useRef(currentStep);
  const [showErrors, setShowErrors] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);
  const [hygieneError, setHygieneError] = useState<string | null>(null);

  /** Vérifie si tous les items d'hygiène de l'étape courante sont cochés */
  const hygieneStatus = useMemo(() => {
    const hygieneStepId = stepIdMap[currentStep];
    if (!hygieneStepId) return { required: false, allChecked: true, total: 0, checked: 0 };

    const stepChecklist = hygieneChecklist.find((s) => s.stepId === hygieneStepId);
    if (!stepChecklist) return { required: false, allChecked: true, total: 0, checked: 0 };

    // Filtrer les items selon l'état de la recette (même logique que HygieneChecklist)
    const hasChiller = recipe.profile.selectedEquipment.some((id) => {
      const eq = equipmentData.find((e) => e.id === id);
      return eq?.category === "refroidissement";
    });
    const hasTempControl = recipe.profile.selectedEquipment.some((id) => {
      const eq = equipmentData.find((e) => e.id === id);
      return eq?.category === "température";
    });
    const packagingType = recipe.conditioning.mode;

    const filteredItems = stepChecklist.items.filter((item) => {
      if (!item.appliesWhen) return true;
      const aw = item.appliesWhen;
      if (aw.packagingType && aw.packagingType !== packagingType) return false;
      if (aw.hasChiller !== undefined && aw.hasChiller !== hasChiller) return false;
      if (aw.hasTempControl !== undefined && aw.hasTempControl !== hasTempControl) return false;
      return true;
    });

    if (filteredItems.length === 0) return { required: false, allChecked: true, total: 0, checked: 0 };

    const checkedCount = filteredItems.filter((item) => assistant.hygieneChecks[item.id]).length;

    return {
      required: true,
      allChecked: checkedCount === filteredItems.length,
      total: filteredItems.length,
      checked: checkedCount,
    };
  }, [currentStep, assistant.hygieneChecks, recipe, equipmentData]);

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-16 h-16 mx-auto">
            <div className="w-16 h-16 border-4 border-amber-200 rounded-full" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-500 font-medium">Chargement des données...</p>
        </motion.div>
      </div>
    );
  }

  const StepComponent = steps[currentStep];
  const currentValidation = stepValidations[currentStep];
  const isCurrentStepValid = currentValidation?.valid ?? true;
  const hygieneStepId = stepIdMap[currentStep];

  function goTo(step: number) {
    if (step < 0 || step >= totalSteps) return;
    setDirection(step > currentStep ? 1 : -1);
    prevStep.current = currentStep;
    setCurrentStep(step);
    setShowErrors(false);
    setHygieneError(null);
  }

  function handleNext() {
    // Validation classique d'abord
    if (!isCurrentStepValid) {
      setShowErrors(true);
      setHygieneError(null);
      return;
    }
    // Validation hygiène ensuite
    if (hygieneStatus.required && !hygieneStatus.allChecked) {
      setHygieneError(
        `Veuillez cocher tous les points d'hygiène avant de continuer (${hygieneStatus.checked}/${hygieneStatus.total} cochés).`
      );
      setShowErrors(false);
      return;
    }
    setHygieneError(null);
    goTo(currentStep + 1);
  }

  function handlePrev() {
    setHygieneError(null);
    goTo(currentStep - 1);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* En-tête */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5 no-print"
      >
        <div className="inline-flex items-center gap-3 mb-1">
          <span className="text-4xl">🍺</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 bg-clip-text text-transparent">
            ConcepteurBière
          </h1>
        </div>
        <p className="text-gray-400 text-sm mt-1">
          Créez votre recette de bière maison, étape par étape
        </p>
      </motion.header>

      {/* Barre d'outils : mode + risques + lexique */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-2 mb-4 no-print"
      >
        {/* Toggle Débutant / Expert */}
        <div className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setUiMode("beginner")}
            className={`px-4 py-2 text-xs font-semibold transition-all ${
              uiMode === "beginner"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-inner"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            🎓 Débutant
          </button>
          <button
            type="button"
            onClick={() => setUiMode("expert")}
            className={`px-4 py-2 text-xs font-semibold transition-all ${
              uiMode === "expert"
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-inner"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            ⚡ Expert
          </button>
        </div>

        {/* Badge de risques */}
        <RiskBadge onClick={() => setShowRiskPanel(true)} />

        {/* Bouton Lexique */}
        <button
          type="button"
          onClick={() => setShowGlossary(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-600 text-xs font-semibold hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-all shadow-sm"
        >
          <span>📖</span>
          <span>Lexique</span>
        </button>
      </motion.div>

      {/* Indicateur d'étapes */}
      <StepIndicator />

      {/* Contenu principal : étape + stats latérales */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        {/* Zone de l'étape */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="glass-card rounded-2xl p-6"
            >
              {/* Step header */}
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {currentStep + 1}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {STEP_NAMES[currentStep]}
                  </h2>
                  <p className="text-xs text-gray-400">
                    Étape {currentStep + 1} sur {totalSteps}
                  </p>
                </div>
              </div>

              <StepComponent />

              {/* Checklist d'hygiène pour cette étape */}
              {hygieneStepId && <HygieneChecklist stepId={hygieneStepId} />}

              {/* Erreurs de validation */}
              {showErrors && !isCurrentStepValid && (
                <ValidationErrors errors={currentValidation.errors} />
              )}

              {/* Erreur hygiène */}
              <AnimatePresence>
                {hygieneError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-teal-50 border-2 border-teal-300 rounded-xl flex items-start gap-2"
                  >
                    <span className="text-teal-600 text-lg mt-0.5">🧹</span>
                    <div>
                      <p className="text-sm font-semibold text-teal-800">
                        Points d'hygiène incomplets
                      </p>
                      <p className="text-xs text-teal-700 mt-0.5">
                        {hygieneError}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 no-print">
            <motion.button
              onClick={handlePrev}
              disabled={currentStep === 0}
              whileHover={currentStep !== 0 ? { scale: 1.02 } : {}}
              whileTap={currentStep !== 0 ? { scale: 0.98 } : {}}
              className={`nav-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm"
              }`}
            >
              <span>←</span>
              <span>Précédent</span>
            </motion.button>

            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-400 font-medium">
                {currentStep + 1} / {totalSteps}
              </span>
              {hygieneStatus.required && (
                <span
                  className={`text-[10px] mt-0.5 font-medium ${
                    hygieneStatus.allChecked ? "text-teal-500" : "text-teal-400"
                  }`}
                >
                  🧹 {hygieneStatus.checked}/{hygieneStatus.total}
                </span>
              )}
            </div>

            <motion.button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              whileHover={currentStep !== totalSteps - 1 ? { scale: 1.02 } : {}}
              whileTap={currentStep !== totalSteps - 1 ? { scale: 0.98 } : {}}
              className={`nav-btn flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                currentStep === totalSteps - 1
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : !isCurrentStepValid || (hygieneStatus.required && !hygieneStatus.allChecked)
                  ? "bg-gradient-to-r from-amber-300 to-amber-400 text-white cursor-pointer shadow-sm"
                  : "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-200"
              }`}
            >
              <span>
                {currentStep === totalSteps - 2 ? "Voir le résumé" : "Suivant"}
              </span>
              <span>→</span>
            </motion.button>
          </div>
        </div>

        {/* Panel latéral : stats en direct + estimations */}
        <motion.aside
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:w-72 flex-shrink-0 no-print"
        >
          <div className="lg:sticky lg:top-6 space-y-4">
            <LiveStats />
            <EstimationsPanel />
          </div>
        </motion.aside>
      </div>

      {/* Modales */}
      <AnimatePresence>
        {showRiskPanel && (
          <RiskPanel onClose={() => setShowRiskPanel(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showGlossary && (
          <GlossaryModal onClose={() => setShowGlossary(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
