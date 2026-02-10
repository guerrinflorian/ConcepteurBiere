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
import { useState, useRef } from "react";

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
  } = useRecipe();
  const [direction, setDirection] = useState(0);
  const prevStep = useRef(currentStep);
  const [showErrors, setShowErrors] = useState(false);
  const [showRiskPanel, setShowRiskPanel] = useState(false);

  if (!dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-3"
        >
          <div className="w-12 h-12 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Chargement des données...</p>
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
  }

  function handleNext() {
    if (!isCurrentStepValid) {
      setShowErrors(true);
      return;
    }
    goTo(currentStep + 1);
  }

  function handlePrev() {
    goTo(currentStep - 1);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* En-tête */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 no-print"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-amber-900">
          ConcepteurBiere
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Assistant de brassage de biere maison
        </p>
      </motion.header>

      {/* Barre d'outils : mode + risques + lexique */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-4 no-print">
        {/* Toggle Débutant / Expert */}
        <div className="flex items-center bg-white rounded-full border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setUiMode("beginner")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              uiMode === "beginner"
                ? "bg-amber-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Débutant
          </button>
          <button
            type="button"
            onClick={() => setUiMode("expert")}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${
              uiMode === "expert"
                ? "bg-amber-500 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Expert
          </button>
        </div>

        {/* Badge de risques */}
        <RiskBadge onClick={() => setShowRiskPanel(true)} />

        {/* Bouton Lexique */}
        <button
          type="button"
          onClick={() => setShowGlossary(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium hover:bg-amber-200 transition-colors"
        >
          <span>📖</span>
          <span>Lexique</span>
        </button>
      </div>

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
              className="bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-sm"
            >
              <StepComponent />

              {/* Checklist d'hygiène pour cette étape */}
              {hygieneStepId && <HygieneChecklist stepId={hygieneStepId} />}

              {showErrors && !isCurrentStepValid && (
                <ValidationErrors errors={currentValidation.errors} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6 no-print">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentStep === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Precedent
            </button>
            <span className="text-sm text-gray-400">
              Etape {currentStep + 1} / {totalSteps}
            </span>
            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentStep === totalSteps - 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : !isCurrentStepValid
                  ? "bg-amber-400 text-white cursor-pointer"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }`}
            >
              {currentStep === totalSteps - 2 ? "Voir le resume" : "Suivant"}
            </button>
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
