"use client";

import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ibuToLabel } from "@/lib/calculations";
import { motion, useSpring, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

/** Tooltips pédagogiques pour chaque métrique */
const STAT_TOOLTIPS: Record<string, { title: string; desc: string; up: string; down: string }> = {
  OG: {
    title: "Densité Initiale (Original Gravity)",
    desc: "Concentration en sucres du moût avant fermentation. Plus elle est haute, plus la bière sera alcoolisée.",
    up: "Augmenter la quantité de malt ou ajouter des adjuncts sucrés.",
    down: "Réduire le malt ou augmenter le volume d'eau.",
  },
  FG: {
    title: "Densité Finale (Final Gravity)",
    desc: "Densité après fermentation. Indique les sucres résiduels : plus la FG est haute, plus la bière est ronde et sucrée.",
    up: "Choisir une levure à faible atténuation ou empâter à haute température (68°C+).",
    down: "Choisir une levure à haute atténuation ou empâter à basse température (62-64°C).",
  },
  ABV: {
    title: "Taux d'Alcool (Alcohol By Volume)",
    desc: "Le pourcentage d'alcool de votre bière, calculé à partir de la différence OG - FG.",
    up: "Ajouter plus de malt pour augmenter l'OG.",
    down: "Réduire le malt ou augmenter le volume.",
  },
  IBU: {
    title: "Amertume (International Bitterness Units)",
    desc: "L'amertume apportée par le houblon. Dépend de la quantité, du taux d'alpha et du temps d'ébullition.",
    up: "Ajouter plus de houblon ou augmenter le temps d'ébullition. Utiliser un houblon à haut alpha.",
    down: "Réduire le houblon, raccourcir l'ébullition ou ajouter le houblon en fin de cuisson (arôme, pas amertume).",
  },
  EBC: {
    title: "Couleur (European Brewery Convention)",
    desc: "La couleur de votre bière, du jaune paille au noir opaque. Dépend du type et de la quantité de malt.",
    up: "Ajouter des malts foncés (Crystal, Chocolate, Black).",
    down: "Utiliser principalement des malts pâles (Pilsner, Pale Ale).",
  },
};

export default function LiveStats() {
  const { calculated, recipe } = useRecipe();
  const { og, ogPlato, fg, abv, ibu, ebc, colorLabel } = calculated;

  if (recipe.params.volume <= 0) return null;

  const beerColor = ebcToColor(ebc);
  const hasData = og > 1.001;

  return (
    <div className="glass-card-amber rounded-2xl p-5 relative overflow-hidden">
      {/* Decorative shimmer */}
      <div className="absolute inset-0 shimmer rounded-2xl pointer-events-none opacity-50" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">📊</span>
          <h3 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
            Estimations en direct
          </h3>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-3 text-center">
          <AnimatedStatBox
            label="OG"
            value={hasData ? og : 0}
            format={(v) => (v > 0 ? v.toFixed(3) : "—")}
            sub={hasData ? `${ogPlato}°P` : ""}
            tooltip={STAT_TOOLTIPS.OG}
          />
          <AnimatedStatBox
            label="FG"
            value={hasData ? fg : 0}
            format={(v) => (v > 0 ? v.toFixed(3) : "—")}
            tooltip={STAT_TOOLTIPS.FG}
          />
          <AnimatedStatBox
            label="ABV"
            value={hasData ? abv : 0}
            format={(v) => (v > 0 ? `${v.toFixed(1)}%` : "—")}
            tooltip={STAT_TOOLTIPS.ABV}
          />
          <AnimatedStatBox
            label="IBU"
            value={ibu}
            format={(v) => (v > 0 ? v.toFixed(0) : "—")}
            sub={ibu > 0 ? ibuToLabel(ibu) : ""}
            tooltip={STAT_TOOLTIPS.IBU}
          />
          <AnimatedStatBox
            label="EBC"
            value={ebc}
            format={(v) => (v > 0 ? v.toFixed(0) : "—")}
            sub={ebc > 0 ? colorLabel : ""}
            tooltip={STAT_TOOLTIPS.EBC}
          />
          <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] text-amber-600/70 uppercase font-semibold tracking-wider">
              Couleur
            </span>
            <motion.div
              className="w-11 h-11 rounded-full border-2 border-amber-300/50 shadow-lg"
              animate={{ backgroundColor: hasData && ebc > 0 ? beerColor : "#e5e7eb" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              style={{
                boxShadow: hasData && ebc > 0
                  ? `0 4px 14px ${beerColor}66, inset 0 -2px 4px rgba(0,0,0,0.1)`
                  : "0 2px 8px rgba(0,0,0,0.08)",
              }}
            />
          </div>
        </div>

        {/* Compact mobile bar */}
        <div className="mt-3 lg:hidden">
          <div className="flex items-center justify-center gap-2 text-[10px] text-amber-700/60">
            <span>Vol: {recipe.params.volume}L</span>
            {recipe.conditioning.mode === "bottles" && (
              <span>| CO₂: {calculated.co2Volumes}v</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AnimatedStatBox({
  label,
  value,
  format,
  sub,
  tooltip,
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  sub?: string;
  tooltip: { title: string; desc: string; up: string; down: string };
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => format(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <div
      className="relative flex flex-col items-center group cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="text-[10px] text-amber-600/70 uppercase font-semibold tracking-wider">
        {label}
      </span>
      <motion.span className="text-lg font-bold text-amber-900 tabular-nums">
        {display}
      </motion.span>
      {sub && (
        <span className="text-[10px] text-amber-600/60 font-medium">{sub}</span>
      )}

      {/* Underline indicator for hover */}
      <div className="mt-0.5 h-0.5 w-0 group-hover:w-full bg-amber-400 rounded-full transition-all duration-300" />

      {/* Rich tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-2xl pointer-events-none"
          >
            <p className="font-bold text-amber-300 mb-1">{tooltip.title}</p>
            <p className="text-gray-300 mb-2 leading-relaxed">{tooltip.desc}</p>
            <div className="space-y-1.5 border-t border-gray-700 pt-2">
              <div className="flex items-start gap-1.5">
                <span className="text-green-400 mt-0.5 flex-shrink-0">▲</span>
                <p className="text-gray-300"><span className="text-green-400 font-semibold">Augmenter :</span> {tooltip.up}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5 flex-shrink-0">▼</span>
                <p className="text-gray-300"><span className="text-red-400 font-semibold">Diminuer :</span> {tooltip.down}</p>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
