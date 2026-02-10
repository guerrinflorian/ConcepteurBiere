"use client";

import { useRecipe } from "@/context/RecipeContext";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 6 : Fermentation.
 */
export default function Step6Fermentation() {
  const { recipe, setRecipe, yeastsData, equipmentData, tipsData } = useRecipe();
  const { fermentation } = recipe;

  const yeast = yeastsData.find((y) => y.id === recipe.yeastId);
  const hasFridge = recipe.profile.selectedEquipment.some(
    (id) => equipmentData.find((e) => e.id === id)?.category === "température"
  );
  const hasHydrometer = recipe.profile.selectedEquipment.includes("hydrometer");

  function updateFermentation(partial: Partial<typeof fermentation>) {
    setRecipe((prev) => ({
      ...prev,
      fermentation: { ...prev.fermentation, ...partial },
    }));
  }

  // Vérifier si la température est dans la plage de la levure
  const tempInRange =
    !yeast ||
    (fermentation.fermentationTemp >= yeast.temp_min &&
      fermentation.fermentationTemp <= yeast.temp_max);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">Fermentation</h2>
        <p className="text-gray-600">
          Configurez les paramètres de fermentation. La température et la durée
          influencent directement le profil aromatique de votre bière.
        </p>
      </div>

      {/* Température de fermentation */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Température de fermentation (°C)
          <Tooltip text={tipsData.ferm_temp} />
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={4}
            max={35}
            step={1}
            value={fermentation.fermentationTemp}
            onChange={(e) =>
              updateFermentation({
                fermentationTemp: Number(e.target.value),
              })
            }
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
          />
          {yeast && (
            <span className="text-sm text-gray-500">
              Plage recommandée pour {yeast.name.split("(")[0].trim()} :{" "}
              {yeast.temp_min}–{yeast.temp_max}°C
            </span>
          )}
        </div>
        {!tempInRange && (
          <p className="text-sm text-orange-700 mt-1 font-medium">
            La température est hors de la plage recommandée pour cette levure.
            Cela peut produire des saveurs indésirables.
          </p>
        )}
        {!hasFridge && yeast?.type === "lager" && (
          <p className="text-sm text-orange-700 mt-1">
            Vous n&apos;avez pas indiqué posséder un réfrigérateur. Une lager nécessite
            un contrôle strict de la température basse (~10–15°C).
          </p>
        )}
      </div>

      {/* Durée fermentation primaire */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Durée de fermentation primaire (jours)
          <Tooltip text={tipsData.ferm_duration} />
        </label>
        <input
          type="number"
          min={3}
          max={60}
          step={1}
          value={fermentation.primaryDays}
          onChange={(e) =>
            updateFermentation({
              primaryDays: Math.max(1, Number(e.target.value)),
            })
          }
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          {yeast?.type === "lager"
            ? "14–21 jours pour une lager, suivi d'un lagering (garde au froid)."
            : "7–14 jours pour une ale standard."}
        </p>
      </div>

      {/* Fermentation secondaire */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fermentation.hasSecondary}
            onChange={(e) =>
              updateFermentation({ hasSecondary: e.target.checked })
            }
            className="accent-amber-600"
          />
          <span className="text-sm font-medium text-gray-700">
            Ajouter une fermentation secondaire / maturation
            <Tooltip text={tipsData.ferm_secondary} />
          </span>
        </label>
        {fermentation.hasSecondary && (
          <div className="grid grid-cols-2 gap-4 pl-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Durée (jours)
              </label>
              <input
                type="number"
                min={3}
                max={90}
                value={fermentation.secondaryDays}
                onChange={(e) =>
                  updateFermentation({
                    secondaryDays: Math.max(1, Number(e.target.value)),
                  })
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Température (°C)
              </label>
              <input
                type="number"
                min={0}
                max={25}
                value={fermentation.secondaryTemp}
                onChange={(e) =>
                  updateFermentation({
                    secondaryTemp: Number(e.target.value),
                  })
                }
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <Tip>
        Maintenez la température à ±2°C près pendant toute la fermentation.
        Une fermentation trop chaude produit des esters (goût fruité/solvant).
        {hasHydrometer
          ? " Mesurez la densité finale deux jours de suite pour confirmer que la fermentation est terminée avant de conditionner."
          : " Un densimètre vous permettrait de vérifier la fin de la fermentation de manière fiable."}
      </Tip>
    </div>
  );
}
