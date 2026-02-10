"use client";

import { useRecipe } from "@/context/RecipeContext";

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

export default function StepIndicator() {
  const { currentStep, setCurrentStep, isStepAccessible } = useRecipe();

  return (
    <div className="w-full overflow-x-auto py-4 no-print">
      <div className="flex items-center justify-center gap-1 min-w-max px-4">
        {STEP_LABELS.map((label, i) => {
          const isActive = i === currentStep;
          const isDone = i < currentStep;
          const accessible = isStepAccessible(i);
          return (
            <button
              key={i}
              onClick={() => accessible && setCurrentStep(i)}
              disabled={!accessible}
              className={`flex items-center gap-1 text-xs sm:text-sm px-2 py-1 rounded-full transition-all ${
                !accessible
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                  : isActive
                  ? "bg-amber-600 text-white font-bold cursor-pointer"
                  : isDone
                  ? "bg-amber-200 text-amber-900 hover:bg-amber-300 cursor-pointer"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300 cursor-pointer"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  !accessible
                    ? "bg-gray-300 text-gray-100"
                    : isActive
                    ? "bg-white text-amber-600"
                    : isDone
                    ? "bg-amber-600 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {isDone && accessible ? "\u2713" : i + 1}
              </span>
              <span className="hidden md:inline">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
