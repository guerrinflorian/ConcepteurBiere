"use client";

import { useRecipe } from "@/context/RecipeContext";
import { getRisks, buildRiskContext } from "@/lib/riskRules";

/**
 * Badge compact affichant le nombre d'alertes de risques.
 * La couleur reflète le niveau le plus sévère.
 * Au clic, ouvre le RiskPanel (le parent gère l'état open/close).
 */
export default function RiskBadge({ onClick }: { onClick: () => void }) {
  const { recipe, yeastsData, equipmentData, assistant } = useRecipe();

  const yeast = yeastsData.find((y) => y.id === recipe.yeastId);
  const ctx = buildRiskContext(recipe, yeast, equipmentData);
  const risks = getRisks(ctx, assistant.dismissedRiskIds);

  if (risks.length === 0) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-medium hover:bg-green-200 transition-colors"
        title="Assistant anti-erreurs — Aucun problème détecté"
      >
        <span>✅</span>
        <span>OK</span>
      </button>
    );
  }

  const maxLevel = risks[0].level; // déjà trié danger > warn > info
  const colors = {
    danger: "bg-red-100 text-red-700 hover:bg-red-200",
    warn: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    info: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  };
  const icons = { danger: "🚨", warn: "⚠️", info: "ℹ️" };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${colors[maxLevel]}`}
      title={`Assistant anti-erreurs — ${risks.length} alerte${risks.length > 1 ? "s" : ""}`}
    >
      <span>{icons[maxLevel]}</span>
      <span>{risks.length} alerte{risks.length > 1 ? "s" : ""}</span>
    </button>
  );
}
