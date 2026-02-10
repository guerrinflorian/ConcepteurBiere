"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ibuToLabel, ebcToColorLabel } from "@/lib/calculations";
import { isBeginner } from "@/lib/uiMode";

/** Icons et infos pour chaque métrique */
const METRIC_META: Record<string, { icon: string; color: string; gradientFrom: string; gradientTo: string; howUp: string; howDown: string }> = {
  ABV: {
    icon: "🍷",
    color: "text-purple-700",
    gradientFrom: "from-purple-50",
    gradientTo: "to-purple-100/50",
    howUp: "Ajoutez plus de malt pour augmenter la quantité de sucres fermentescibles.",
    howDown: "Réduisez le malt ou augmentez le volume d'eau de brassage.",
  },
  IBU: {
    icon: "🌿",
    color: "text-green-700",
    gradientFrom: "from-green-50",
    gradientTo: "to-green-100/50",
    howUp: "Ajoutez plus de houblon, augmentez le temps d'ébullition, ou utilisez un houblon à haut taux d'alpha acide.",
    howDown: "Réduisez la quantité de houblon, ajoutez-le plus tard dans l'ébullition, ou choisissez un houblon doux.",
  },
  EBC: {
    icon: "🎨",
    color: "text-amber-700",
    gradientFrom: "from-amber-50",
    gradientTo: "to-amber-100/50",
    howUp: "Ajoutez des malts foncés : Crystal, Chocolate, Roasted Barley, Black Malt.",
    howDown: "Utilisez principalement des malts pâles (Pilsner, Pale Ale). Retirez les malts torréfiés.",
  },
  OG: {
    icon: "📏",
    color: "text-blue-700",
    gradientFrom: "from-blue-50",
    gradientTo: "to-blue-100/50",
    howUp: "Augmentez la quantité de grains ou ajoutez des adjuncts sucrés (miel, sucre candi).",
    howDown: "Réduisez le malt ou augmentez le volume d'eau. Vérifiez votre rendement d'empâtage.",
  },
  FG: {
    icon: "📉",
    color: "text-teal-700",
    gradientFrom: "from-teal-50",
    gradientTo: "to-teal-100/50",
    howUp: "Empâtez à plus haute température (68-72°C) ou choisissez une levure à faible atténuation.",
    howDown: "Empâtez à plus basse température (62-65°C) ou choisissez une levure à haute atténuation.",
  },
  "CO₂": {
    icon: "🫧",
    color: "text-sky-700",
    gradientFrom: "from-sky-50",
    gradientTo: "to-sky-100/50",
    howUp: "Augmentez le sucre de refermentation (attention : max 9 g/L pour éviter les bouteilles-bombes !).",
    howDown: "Réduisez le sucre de refermentation. Minimum recommandé : 4-5 g/L.",
  },
};

export default function EstimationsPanel() {
  const { calculated, recipe, uiMode, stylesData } = useRecipe();
  const beginner = isBeginner(uiMode);
  const { og, ogPlato, fg, abv, ibu, ebc, colorLabel, co2Volumes } = calculated;

  const style = stylesData.find((s) => s.id === recipe.params.styleId);
  const hasData = og > 1.001;

  if (!hasData) {
    return (
      <div className="glass-card rounded-2xl p-5 text-center">
        <div className="text-3xl mb-2 opacity-40">🍺</div>
        <p className="text-sm text-gray-400">
          Ajoutez des ingrédients pour voir les estimations de votre bière.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔬</span>
        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
          Estimations de votre bière
        </h3>
      </div>

      {beginner && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xs text-gray-500 italic bg-amber-50/50 rounded-lg p-2 border border-amber-100"
        >
          Survolez les termes pour comprendre chaque valeur et comment l'ajuster.
        </motion.p>
      )}

      <div className="grid grid-cols-1 gap-2">
        <MetricCard
          label="ABV"
          fullName="Taux d'alcool"
          value={`${abv.toFixed(1)}%`}
          interpretation={abvInterpretation(abv)}
          styleRange={style ? `${style.abv_min}–${style.abv_max}%` : undefined}
          inRange={style ? abv >= style.abv_min && abv <= style.abv_max : undefined}
          definition="Le pourcentage d'alcool de votre bière. Calculé à partir de la différence entre la densité initiale (OG) et la densité finale (FG)."
          formula={beginner ? undefined : "ABV = (OG - FG) × 131.25"}
          beginner={beginner}
          metaKey="ABV"
        />
        <MetricCard
          label="IBU"
          fullName="Amertume"
          value={ibu.toFixed(0)}
          interpretation={ibuToLabel(ibu)}
          styleRange={style ? `${style.ibu_min}–${style.ibu_max}` : undefined}
          inRange={style ? ibu >= style.ibu_min && ibu <= style.ibu_max : undefined}
          definition="L'amertume de votre bière, mesurée en International Bitterness Units. Plus le nombre est élevé, plus la bière est amère."
          formula={beginner ? undefined : "Formule Tinseth : utilisation × alpha × masse / volume"}
          visualBar={<IbuBar value={ibu} />}
          beginner={beginner}
          metaKey="IBU"
        />
        <MetricCard
          label="EBC"
          fullName="Couleur"
          value={`${ebc.toFixed(0)} — ${colorLabel}`}
          interpretation={ebcToColorLabel(ebc)}
          styleRange={style ? `${style.ebc_min}–${style.ebc_max}` : undefined}
          inRange={style ? ebc >= style.ebc_min && ebc <= style.ebc_max : undefined}
          definition="La couleur de votre bière, mesurée en European Brewery Convention. Calculée à partir de la couleur et la quantité de chaque malt."
          formula={beginner ? undefined : "Méthode Morey : SRM = 1.49 × MCU^0.69 ; EBC = SRM × 1.97"}
          visualBar={<ColorBar ebc={ebc} />}
          beginner={beginner}
          metaKey="EBC"
        />
        <MetricCard
          label="OG"
          fullName="Densité initiale"
          value={`${og.toFixed(3)} (${ogPlato}°P)`}
          interpretation={ogInterpretation(og)}
          styleRange={style ? `${style.og_min}–${style.og_max}` : undefined}
          inRange={style ? og >= style.og_min && og <= style.og_max : undefined}
          definition="La densité du moût avant fermentation. Indique la quantité de sucres disponibles pour la levure. Plus l'OG est élevée, plus la bière sera alcoolisée."
          formula={beginner ? undefined : "PPG : OG = 1 + Σ(masse_lbs × PPG × eff) / vol_gal / 1000"}
          beginner={beginner}
          metaKey="OG"
        />
        <MetricCard
          label="FG"
          fullName="Densité finale"
          value={fg.toFixed(3)}
          interpretation={fgInterpretation(fg)}
          definition="La densité de la bière après fermentation. Les sucres non consommés par la levure restent et donnent du corps et de la douceur."
          formula={beginner ? undefined : "FG = 1 + (OG - 1) × (1 - atténuation%)"}
          beginner={beginner}
          metaKey="FG"
        />
        {recipe.conditioning.mode === "bottles" && (
          <MetricCard
            label="CO₂"
            fullName="Carbonatation"
            value={`${co2Volumes} volumes`}
            interpretation={co2Interpretation(co2Volumes)}
            definition="La quantité de gaz dissous dans la bière (pétillance). Calculée à partir du sucre de refermentation ajouté à l'embouteillage."
            formula={beginner ? undefined : `CO₂ vol ≈ sucre_g/L ÷ 4 + 0.85 (résiduel). Ici : ${recipe.conditioning.sugarPerLiter} g/L`}
            beginner={beginner}
            metaKey="CO₂"
          />
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-2 italic">
        Ces valeurs sont des estimations simplifiées. Le résultat réel dépend du rendement, de la fraîcheur des ingrédients, et des conditions de brassage.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  fullName,
  value,
  interpretation,
  styleRange,
  inRange,
  definition,
  formula,
  visualBar,
  beginner,
  metaKey,
}: {
  label: string;
  fullName: string;
  value: string;
  interpretation: string;
  styleRange?: string;
  inRange?: boolean;
  definition: string;
  formula?: string;
  visualBar?: React.ReactNode;
  beginner: boolean;
  metaKey: string;
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const meta = METRIC_META[metaKey];

  return (
    <motion.div
      className={`metric-card p-3 bg-gradient-to-br ${meta.gradientFrom} ${meta.gradientTo} border border-gray-200/60 rounded-xl`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">{meta.icon}</span>
          <span className={`text-xs font-bold uppercase ${meta.color}`}>{label}</span>
          <span className="text-[10px] text-gray-400">({fullName})</span>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold inline-flex items-center justify-center hover:bg-gray-300 transition-colors cursor-help"
            aria-label={`Aide sur ${label}`}
          >
            ?
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{value}</span>
          {styleRange && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                inRange
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-orange-100 text-orange-700 border border-orange-200"
              }`}
            >
              {inRange ? "✓" : "⚠"} {styleRange}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
        <span className="text-gray-400">→</span> {interpretation}
      </p>

      {visualBar}

      {/* How to adjust - visible on hover/click */}
      <div className="mt-1.5">
        <button
          type="button"
          onClick={() => setShowHowTo(!showHowTo)}
          className={`text-[10px] font-medium transition-colors ${meta.color} opacity-60 hover:opacity-100`}
        >
          {showHowTo ? "Masquer les conseils ▲" : "Comment ajuster ? ▼"}
        </button>
        <AnimatePresence>
          {showHowTo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="mt-1.5 p-2.5 bg-white/80 rounded-lg border border-gray-100 space-y-1.5">
                <div className="flex items-start gap-1.5">
                  <span className="text-green-500 text-xs mt-0.5">▲</span>
                  <p className="text-[11px] text-gray-600">
                    <span className="font-semibold text-green-700">Augmenter :</span> {meta.howUp}
                  </p>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-red-400 text-xs mt-0.5">▼</span>
                  <p className="text-[11px] text-gray-600">
                    <span className="font-semibold text-red-600">Diminuer :</span> {meta.howDown}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help panel: definition + formula */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-2.5 bg-white/80 rounded-lg border border-gray-100 text-xs text-gray-600 space-y-1">
              <p>
                <strong className="text-gray-700">Définition :</strong> {definition}
              </p>
              {formula && (
                <p>
                  <strong className="text-gray-700">Formule :</strong>{" "}
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-mono">
                    {formula}
                  </code>
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** Barre visuelle d'amertume */
function IbuBar({ value }: { value: number }) {
  const percent = Math.min((value / 80) * 100, 100);
  return (
    <div className="mt-1.5 h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

/** Barre visuelle de couleur */
function ColorBar({ ebc }: { ebc: number }) {
  const color = ebcToColor(ebc);
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-gradient-to-r from-[#FFE699] via-[#BF8129] to-[#1A0F0A]">
        <motion.div
          className="h-full w-1.5 bg-white border border-gray-400 rounded-full shadow-sm"
          initial={{ marginLeft: 0 }}
          animate={{ marginLeft: `${Math.min((ebc / 120) * 100, 98)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div
        className="w-6 h-6 rounded-full border-2 border-gray-200 shadow-inner"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

// === Fonctions d'interprétation ===

function abvInterpretation(abv: number): string {
  if (abv < 3) return "Bière très légère (session)";
  if (abv < 5) return "Bière légère à modérée";
  if (abv < 6.5) return "Bière standard";
  if (abv < 8) return "Bière forte";
  if (abv < 10) return "Bière très forte";
  return "Bière extrêmement forte (barley wine, imperial)";
}

function ogInterpretation(og: number): string {
  if (og < 1.035) return "Moût léger — bière de faible densité";
  if (og < 1.050) return "Moût standard — bonne base pour la plupart des styles";
  if (og < 1.065) return "Moût moyennement dense — bière de bonne densité";
  if (og < 1.080) return "Moût dense — bière forte en perspective";
  return "Moût très dense — bière à haut potentiel alcoolique";
}

function fgInterpretation(fg: number): string {
  if (fg < 1.005) return "Bière très sèche";
  if (fg < 1.010) return "Bière sèche à moyenne";
  if (fg < 1.015) return "Corps moyen — bon équilibre";
  if (fg < 1.020) return "Bière ronde et douce";
  return "Bière très ronde et sucrée";
}

function co2Interpretation(volumes: number): string {
  if (volumes < 1.8) return "Peu pétillante (style cask ale)";
  if (volumes < 2.3) return "Pétillance légère";
  if (volumes < 2.8) return "Pétillance standard";
  if (volumes < 3.3) return "Bien pétillante (Blanche, Saison)";
  return "Très pétillante (style belge)";
}
