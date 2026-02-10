"use client";

import { useEffect } from "react";
import { useRecipe } from "@/context/RecipeContext";
import { calculateWaterPlan, WATER_DEFAULTS, totalGrainKg } from "@/lib/waterCalc";
import { buildCheckContext, runConsistencyChecks } from "@/lib/consistencyChecks";
import Tip from "@/components/ui/Tip";
import { motion } from "framer-motion";

const WATER_SOURCES = [
  {
    value: "robinet" as const,
    label: "Eau du robinet",
    icon: "🚰",
    desc: "Convient dans la plupart des cas. Laissez reposer 24h ou filtrez au charbon actif si goût de chlore.",
  },
  {
    value: "bouteille" as const,
    label: "Eau en bouteille",
    icon: "🧴",
    desc: "Choisissez une eau faiblement minéralisée (ex : Volvic, Cristalline). Évitez les eaux très minéralisées (Contrex, Hépar).",
  },
  {
    value: "osmosee" as const,
    label: "Eau osmosée",
    icon: "💧",
    desc: "Eau très pure, idéale pour un contrôle total. Nécessite d'ajouter des sels de brassage.",
  },
  {
    value: "inconnu" as const,
    label: "Je ne sais pas",
    icon: "❓",
    desc: "Pas de souci ! Utilisez l'eau du robinet en la laissant reposer 24h dans un récipient ouvert.",
  },
];

/**
 * Étape 5 : Eau & Volumes.
 * Calcule automatiquement le plan d'eau en fonction des grains et du volume cible.
 */
export default function WaterStep() {
  const {
    recipe,
    setWater,
    setProcess,
    uiMode,
    equipmentData,
  } = useRecipe();

  const waterPlan = calculateWaterPlan(recipe);
  const isAllGrain = recipe.params.method === "tout_grain";
  const isExpert = uiMode === "expert";
  const grainKg = totalGrainKg(recipe.malts);

  // Synchroniser le plan d'eau calculé dans l'état de la recette (pour l'export)
  useEffect(() => {
    setWater({
      mashWaterL: waterPlan.mashWaterL,
      spargeWaterL: waterPlan.spargeWaterL,
      totalWaterL: waterPlan.totalWaterL,
      preBoilVolumeL: waterPlan.preBoilVolumeL,
      postBoilVolumeL: waterPlan.postBoilVolumeL,
      lossesL: waterPlan.lossesL,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waterPlan.mashWaterL, waterPlan.spargeWaterL, waterPlan.totalWaterL, waterPlan.preBoilVolumeL, waterPlan.postBoilVolumeL, waterPlan.lossesL]);

  // Checks de cohérence
  const checkCtx = buildCheckContext(recipe, equipmentData);
  const checks = runConsistencyChecks(checkCtx);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">💧</span>Eau & Volumes
        </h2>
        <p className="text-gray-600">
          {isAllGrain
            ? "Le plan d'eau est calculé automatiquement à partir de vos grains et du volume souhaité."
            : "L'eau sert principalement à diluer l'extrait et atteindre le volume final."}
        </p>
      </div>

      {/* Alertes de cohérence */}
      {checks.length > 0 && (
        <div className="space-y-2">
          {checks.map((check) => (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border text-sm ${
                check.level === "danger"
                  ? "bg-red-50 border-red-300 text-red-800"
                  : check.level === "warn"
                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                  : "bg-blue-50 border-blue-300 text-blue-800"
              }`}
            >
              <span className="font-semibold">
                {check.level === "danger" ? "⛔" : check.level === "warn" ? "⚠️" : "ℹ️"}{" "}
                {check.title}
              </span>
              <p className="mt-0.5">{check.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Choix de la source d'eau */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Source d&apos;eau</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {WATER_SOURCES.map((src) => (
            <button
              key={src.value}
              type="button"
              onClick={() => setWater({ sourceType: src.value })}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                recipe.water.sourceType === src.value
                  ? "border-amber-500 bg-amber-50 shadow-sm"
                  : "border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{src.icon}</span>
                <span className="font-semibold text-sm text-gray-800">{src.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{src.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notes sur l'eau (optionnel) */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Notes sur votre eau (optionnel)
        </label>
        <input
          type="text"
          value={recipe.water.notes}
          onChange={(e) => setWater({ notes: e.target.value })}
          placeholder="Ex: eau dure, goût de chlore, eau de source..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
        />
      </div>

      {/* Paramètres expert : évaporation, pertes */}
      {isExpert && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Paramètres avancés (mode expert)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Évaporation (L/heure)
              </label>
              <input
                type="number"
                min={0.5}
                max={6}
                step={0.1}
                value={recipe.process.boilOffRateLPerHour}
                onChange={(e) =>
                  setProcess({ boilOffRateLPerHour: Number(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 outline-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-0.5">
                Défaut : {WATER_DEFAULTS.grainAbsorption} L/kg. Ajustez selon votre système.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Plan d'eau calculé */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Plan d&apos;eau calculé automatiquement
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {isAllGrain && (
            <>
              <WaterCard
                label="Eau d'empâtage"
                value={`${waterPlan.mashWaterL} L`}
                icon="🫗"
                subtitle={`${WATER_DEFAULTS.mashRatio} L/kg × ${grainKg.toFixed(1)} kg`}
              />
              <WaterCard
                label="Eau de rinçage"
                value={`${waterPlan.spargeWaterL} L`}
                icon="🚿"
                subtitle="À chauffer à 75-78°C"
              />
            </>
          )}
          <WaterCard
            label="Volume pré-ébullition"
            value={`${waterPlan.preBoilVolumeL} L`}
            icon="🔥"
            subtitle="Avant l'ébullition"
          />
          <WaterCard
            label="Volume final"
            value={`${waterPlan.postBoilVolumeL} L`}
            icon="🍺"
            subtitle="Dans le fermenteur"
          />
          <WaterCard
            label="Eau totale nécessaire"
            value={`${waterPlan.totalWaterL} L`}
            icon="💧"
            highlight
            subtitle="À préparer"
          />
          <WaterCard
            label="Pertes estimées"
            value={`${waterPlan.lossesL} L`}
            icon="📉"
            subtitle="Absorption + évaporation + transfert"
          />
        </div>
      </div>

      {/* Récapitulatif info */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Comment sont calculés ces volumes ?</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          {isAllGrain && (
            <>
              <li>Eau d&apos;empâtage = {WATER_DEFAULTS.mashRatio} L par kg de grain ({grainKg.toFixed(1)} kg)</li>
              <li>Absorption grains = {WATER_DEFAULTS.grainAbsorption} L par kg de grain</li>
            </>
          )}
          <li>Évaporation = {recipe.process.boilOffRateLPerHour} L/h pendant {recipe.mashing.boilDuration || 60} min</li>
          <li>Pertes fixes (transfert, fond de cuve) = {WATER_DEFAULTS.fixedLosses} L</li>
          <li>Pertes trub (résidus houblon) = {WATER_DEFAULTS.trubLoss} L</li>
        </ul>
        <p className="text-xs text-blue-600 mt-2 italic">
          Ces valeurs sont des estimations pour un brasseur amateur. Les volumes réels varient selon le matériel.
        </p>
      </div>

      <Tip>
        {isAllGrain
          ? "En tout-grain, préparez toujours un peu plus d'eau que calculé (1-2 L de marge). Mieux vaut trop d'eau que pas assez !"
          : "Pour un kit ou extrait, l'eau sert surtout à atteindre le volume final. Suivez les instructions du fabricant en priorité."}
      </Tip>
    </div>
  );
}

// === Sous-composant ===

function WaterCard({
  label,
  value,
  icon,
  subtitle,
  highlight,
}: {
  label: string;
  value: string;
  icon: string;
  subtitle?: string;
  highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 rounded-xl border ${
        highlight
          ? "bg-amber-50 border-amber-300 ring-1 ring-amber-200"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <p className={`text-lg font-bold ${highlight ? "text-amber-700" : "text-gray-800"}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-[10px] text-gray-400 mt-0.5">{subtitle}</p>
      )}
    </motion.div>
  );
}
