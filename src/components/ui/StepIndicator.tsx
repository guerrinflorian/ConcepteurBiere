"use client";

import { useRecipe } from "@/context/RecipeContext";
import { motion } from "framer-motion";

const STEP_LABELS = [
  "Profil",
  "Paramètres",
  "Malts",
  "Houblons",
  "Levure",
  "Empâtage",
  "Fermentation",
  "Conditionnement",
  "Résumé",
];

const STEP_ICONS = [
  "👤", "⚙️", "🌾", "🌿", "🧫", "🔥", "🫧", "🍺", "📋",
];

export default function StepIndicator() {
  const { currentStep, setCurrentStep, isStepAccessible, totalSteps } = useRecipe();

  const progressPercent = (currentStep / (totalSteps - 1)) * 100;

  return (
    <div className="w-full py-4 no-print">
      {/* Progress bar global */}
      <div className="relative max-w-2xl mx-auto mb-2 px-8">
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step pills */}
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="flex items-center justify-center gap-1 min-w-max px-4 py-1">
          {STEP_LABELS.map((label, i) => {
            const isActive = i === currentStep;
            const isDone = i < currentStep;
            const accessible = isStepAccessible(i);
            return (
              <div key={i} className="flex items-center">
                <motion.button
                  onClick={() => accessible && setCurrentStep(i)}
                  disabled={!accessible}
                  whileHover={accessible ? { scale: 1.05 } : {}}
                  whileTap={accessible ? { scale: 0.95 } : {}}
                  className={`relative flex items-center gap-1.5 text-xs sm:text-sm px-2.5 py-1.5 rounded-full transition-all ${
                    !accessible
                      ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                      : isActive
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold cursor-pointer shadow-md shadow-amber-200"
                      : isDone
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200 cursor-pointer"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 cursor-pointer"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeStep"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                  )}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      !accessible
                        ? "bg-gray-200 text-gray-400"
                        : isActive
                        ? "bg-white/25 text-white"
                        : isDone
                        ? "bg-amber-500 text-white"
                        : "bg-gray-300 text-white"
                    }`}
                  >
                    {isDone && accessible ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        ✓
                      </motion.span>
                    ) : (
                      <span className="text-[10px]">{STEP_ICONS[i]}</span>
                    )}
                  </span>
                  <span className="hidden md:inline">{label}</span>
                </motion.button>

                {/* Connector line */}
                {i < STEP_LABELS.length - 1 && (
                  <div className="hidden sm:block w-3 h-0.5 mx-0.5">
                    <div className={`h-full rounded-full transition-colors duration-300 ${
                      i < currentStep ? "bg-amber-400" : "bg-gray-200"
                    }`} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
