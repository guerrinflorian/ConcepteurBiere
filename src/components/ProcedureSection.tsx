"use client";

import { ProcedureStep } from "@/lib/types";

/**
 * Affichage complet de la procédure de fabrication A→Z.
 * Toutes les étapes sont visibles sans accordéon pour faciliter l'export/impression.
 */
export default function ProcedureSection({
  steps,
}: {
  steps: ProcedureStep[];
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-amber-900">
        Procédure de fabrication A → Z
      </h3>

      <p className="text-sm text-gray-500">
        Guide personnalisé selon vos ingrédients, votre matériel et vos paramètres.
      </p>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="border border-gray-200 rounded-xl overflow-visible bg-white"
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm">
                  {step.title}
                </h4>
                {step.durationMin !== undefined && step.durationMin < 10000 && (
                  <span className="text-xs text-gray-400">
                    ~{formatDuration(step.durationMin)}
                  </span>
                )}
              </div>
            </div>

            {/* Content - toujours visible */}
            <div className="px-4 pb-4 pt-3 space-y-3">
              {/* Détails */}
              <div className="pl-3 border-l-2 border-amber-300">
                <h5 className="text-xs font-semibold text-amber-700 mb-1.5 uppercase tracking-wide">
                  Quoi faire
                </h5>
                <ul className="space-y-1.5">
                  {step.details.map((detail, i) => (
                    <li
                      key={i}
                      className={`text-sm text-gray-700 ${
                        detail.startsWith("---")
                          ? "font-semibold text-amber-800 mt-2 border-t border-amber-100 pt-2"
                          : detail === ""
                          ? "h-1"
                          : ""
                      }`}
                    >
                      {!detail.startsWith("---") && detail !== "" && (
                        <span className="text-amber-500 mr-1.5">•</span>
                      )}
                      {detail.startsWith("---") ? detail.replace(/---/g, "").trim() : detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Conseils */}
              {step.tips && step.tips.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <h5 className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                    Pourquoi & conseils
                  </h5>
                  <ul className="space-y-1">
                    {step.tips.map((tip, i) => (
                      <li key={i} className="text-xs text-blue-700">
                        <span className="text-blue-400 mr-1">💡</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Avertissements */}
              {step.warnings && step.warnings.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                  <h5 className="text-xs font-semibold text-red-700 mb-1 uppercase tracking-wide">
                    Erreurs fréquentes
                  </h5>
                  <ul className="space-y-1">
                    {step.warnings.map((warning, i) => (
                      <li key={i} className="text-xs text-red-700">
                        <span className="text-red-400 mr-1">⚠️</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h${m.toString().padStart(2, "0")}`;
}
