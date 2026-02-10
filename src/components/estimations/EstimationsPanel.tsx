"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ibuToLabel, ebcToColorLabel } from "@/lib/calculations";
import { isBeginner } from "@/lib/uiMode";

/**
 * Panneau d'estimations pédagogique.
 * Affiche ABV, IBU, EBC, OG, FG, CO₂ avec explications adaptées au mode.
 * Chaque métrique a un bouton "?" ouvrant un encart de définition.
 */
export default function EstimationsPanel() {
  const { calculated, recipe, uiMode, stylesData } = useRecipe();
  const beginner = isBeginner(uiMode);
  const { og, ogPlato, fg, abv, ibu, ebc, colorLabel, co2Volumes } = calculated;

  const style = stylesData.find((s) => s.id === recipe.params.styleId);
  const hasData = og > 1.001;

  if (!hasData) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
        Ajoutez des ingrédients pour voir les estimations.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
          Estimations de votre bière
        </h3>
      </div>

      {beginner && (
        <p className="text-xs text-gray-500 italic">
          Ces valeurs sont des estimations basées sur vos ingrédients et paramètres.
          Elles peuvent varier selon votre équipement et votre processus réel.
        </p>
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
          visualBar={
            <IbuBar value={ibu} />
          }
          beginner={beginner}
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
          visualBar={
            <ColorBar ebc={ebc} />
          }
          beginner={beginner}
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
        />
        <MetricCard
          label="FG"
          fullName="Densité finale"
          value={fg.toFixed(3)}
          interpretation={fgInterpretation(fg)}
          definition="La densité de la bière après fermentation. Les sucres non consommés par la levure restent et donnent du corps et de la douceur."
          formula={beginner ? undefined : "FG = 1 + (OG - 1) × (1 - atténuation%)"}
          beginner={beginner}
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
          />
        )}
      </div>

      <p className="text-[10px] text-gray-400 text-center mt-2">
        ⚠ Ce sont des estimations simplifiées. Le résultat réel dépend du rendement,
        de la fraîcheur des ingrédients, et des conditions de brassage.
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
}) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="p-3 bg-white/80 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-amber-800 uppercase">{label}</span>
          <span className="text-xs text-gray-400">({fullName})</span>
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-4 h-4 rounded-full bg-amber-200 text-amber-800 text-[10px] font-bold inline-flex items-center justify-center hover:bg-amber-300 transition-colors cursor-help"
            aria-label={`Aide sur ${label}`}
          >
            ?
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">{value}</span>
          {styleRange && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              inRange ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
            }`}>
              {inRange ? "✓" : "⚠"} Style: {styleRange}
            </span>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-1">
        → {interpretation}
      </p>

      {visualBar}

      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 p-2 bg-amber-50 rounded text-xs text-gray-600 space-y-1">
              <p><strong>Définition :</strong> {definition}</p>
              {formula && <p><strong>Formule :</strong> <code className="bg-gray-100 px-1 rounded">{formula}</code></p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Barre visuelle d'amertume */
function IbuBar({ value }: { value: number }) {
  const percent = Math.min((value / 80) * 100, 100);
  return (
    <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
    <div className="mt-1 flex items-center gap-2">
      <div className="flex-1 h-3 rounded-full overflow-hidden bg-gradient-to-r from-[#FFE699] via-[#BF8129] to-[#1A0F0A]">
        <motion.div
          className="h-full w-1 bg-white border border-gray-400 rounded-full"
          initial={{ marginLeft: 0 }}
          animate={{ marginLeft: `${Math.min((ebc / 120) * 100, 98)}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <div
        className="w-5 h-5 rounded-full border border-gray-300"
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
