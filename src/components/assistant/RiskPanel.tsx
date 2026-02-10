"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";
import { getRisks, buildRiskContext, Risk, RiskLevel } from "@/lib/riskRules";
import { isBeginner } from "@/lib/uiMode";

/**
 * Panneau d'alertes de risques en temps réel.
 * Affiche les risques détectés sous forme de cartes colorées.
 * S'ouvre dans un drawer/modal depuis le RiskBadge.
 */
export default function RiskPanel({ onClose }: { onClose: () => void }) {
  const { recipe, yeastsData, equipmentData, assistant, dismissRisk, uiMode } = useRecipe();
  const beginner = isBeginner(uiMode);

  const yeast = yeastsData.find((y) => y.id === recipe.yeastId);
  const ctx = buildRiskContext(recipe, yeast, equipmentData);
  const risks = getRisks(ctx, assistant.dismissedRiskIds);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel */}
      <motion.div
        initial={{ y: -20, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[70vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-gray-900">
            Assistant anti-erreurs
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="p-5 space-y-3">
          {risks.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <div className="text-4xl">✅</div>
              <p className="text-gray-700 font-medium">
                Aucun risque détecté !
              </p>
              <p className="text-sm text-gray-500">
                Votre recette semble bien configurée. Continuez comme ça !
              </p>
              {beginner && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg text-sm text-green-700 text-left">
                  <p className="font-medium mb-1">Conseils généraux :</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Désinfectez tout ce qui touche le moût après ébullition</li>
                    <li>Refroidissez le moût le plus vite possible</li>
                    <li>Maintenez une température stable pendant la fermentation</li>
                    <li>Ne vous précipitez pas : la patience est la clé</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {beginner && (
                <p className="text-sm text-gray-500 italic">
                  L&apos;assistant a détecté {risks.length} point{risks.length > 1 ? "s" : ""} d&apos;attention
                  dans votre recette. Corrigez les alertes rouges en priorité.
                </p>
              )}
              <AnimatePresence>
                {risks.map((risk, i) => (
                  <motion.div
                    key={risk.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <RiskCard risk={risk} beginner={beginner} onDismiss={() => dismissRisk(risk.id)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function RiskCard({
  risk,
  beginner,
  onDismiss,
}: {
  risk: Risk;
  beginner: boolean;
  onDismiss: () => void;
}) {
  const styles = riskStyles[risk.level];

  return (
    <div className={`p-4 rounded-lg border-l-4 ${styles.border} ${styles.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{styles.icon}</span>
          <h4 className={`text-sm font-bold ${styles.title}`}>{risk.title}</h4>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          title="Masquer cette alerte"
        >
          ✕
        </button>
      </div>
      <p className={`text-sm mt-1 ${styles.text}`}>{risk.message}</p>

      {/* Pourquoi c'est important */}
      <div className="mt-2">
        <p className="text-xs font-semibold text-gray-600">Pourquoi c&apos;est important :</p>
        <p className="text-xs text-gray-600 mt-0.5">{risk.whyItMatters}</p>
      </div>

      {/* Comment corriger */}
      <div className="mt-2">
        <p className="text-xs font-semibold text-gray-600">Comment corriger :</p>
        <ul className="mt-0.5 space-y-0.5">
          {risk.howToFix.map((fix, i) => (
            <li key={i} className="text-xs text-gray-600 flex items-start gap-1">
              <span className="text-gray-400 mt-0.5">•</span>
              <span>{fix}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const riskStyles: Record<RiskLevel, { bg: string; border: string; title: string; text: string; icon: string }> = {
  danger: {
    bg: "bg-red-50",
    border: "border-red-500",
    title: "text-red-800",
    text: "text-red-700",
    icon: "🚨",
  },
  warn: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    title: "text-orange-800",
    text: "text-orange-700",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    title: "text-blue-800",
    text: "text-blue-700",
    icon: "ℹ️",
  },
};
