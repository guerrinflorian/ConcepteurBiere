"use client";

import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ibuToLabel } from "@/lib/calculations";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

/**
 * Panneau latéral / barre affichant les statistiques calculées en temps réel.
 */
export default function LiveStats() {
  const { calculated, recipe } = useRecipe();
  const { og, ogPlato, fg, abv, ibu, ebc, colorLabel } = calculated;

  // N'afficher que si on a un volume
  if (recipe.params.volume <= 0) return null;

  const beerColor = ebcToColor(ebc);
  const hasData = og > 1.001;

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-amber-200 rounded-xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-amber-800 mb-3 uppercase tracking-wide">
        Estimations en direct
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-3 text-center">
        <AnimatedStatBox
          label="OG"
          value={hasData ? og : 0}
          format={(v) => v > 0 ? v.toFixed(3) : "—"}
          sub={hasData ? `${ogPlato}°P` : ""}
        />
        <AnimatedStatBox
          label="FG"
          value={hasData ? fg : 0}
          format={(v) => v > 0 ? v.toFixed(3) : "—"}
        />
        <AnimatedStatBox
          label="ABV"
          value={hasData ? abv : 0}
          format={(v) => v > 0 ? `${v.toFixed(1)}%` : "—"}
        />
        <AnimatedStatBox
          label="IBU"
          value={ibu}
          format={(v) => v > 0 ? v.toFixed(0) : "—"}
          sub={ibu > 0 ? ibuToLabel(ibu) : ""}
        />
        <AnimatedStatBox
          label="EBC"
          value={ebc}
          format={(v) => v > 0 ? v.toFixed(0) : "—"}
          sub={ebc > 0 ? colorLabel : ""}
        />
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-gray-500 uppercase">Couleur</span>
          <motion.div
            className="w-10 h-10 rounded-full border-2 border-amber-300 shadow-inner"
            animate={{ backgroundColor: hasData && ebc > 0 ? beerColor : "#e5e7eb" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Compact mobile bar */}
      <div className="mt-3 lg:hidden">
        <div className="flex items-center justify-center gap-1 text-[10px] text-gray-500">
          <span>Vol: {recipe.params.volume}L</span>
          {recipe.conditioning.mode === "bottles" && (
            <span>| CO₂: {calculated.co2Volumes}v</span>
          )}
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
}: {
  label: string;
  value: number;
  format: (v: number) => string;
  sub?: string;
}) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => format(v));

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] text-gray-500 uppercase">{label}</span>
      <motion.span className="text-lg font-bold text-amber-900">{display}</motion.span>
      {sub && <span className="text-[10px] text-gray-500">{sub}</span>}
    </div>
  );
}
