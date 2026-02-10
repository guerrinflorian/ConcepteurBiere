"use client";

import { useRecipe } from "@/context/RecipeContext";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 5 : Empâtage & Ébullition.
 */
export default function Step5Mashing() {
  const { recipe, setRecipe, tipsData } = useRecipe();
  const { mashing } = recipe;

  function updateMashing(partial: Partial<typeof mashing>) {
    setRecipe((prev) => ({
      ...prev,
      mashing: { ...prev.mashing, ...partial },
    }));
  }

  // Description de la température d'empâtage
  function mashTempDescription(temp: number): string {
    if (temp < 63) return "Très fermentescible — bière très sèche et alcoolisée";
    if (temp < 65) return "Fermentescible — bière sèche et légère en corps";
    if (temp < 67) return "Équilibre — corps moyen, bonne fermentescibilité";
    if (temp < 69) return "Corps prononcé — bière plus ronde et moelleuse";
    return "Peu fermentescible — bière très ronde, sucrée résiduelle";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">🔥</span>Empâtage & Ébullition
        </h2>
        <p className="text-gray-600">
          Définissez la température d&apos;empâtage et la durée d&apos;ébullition. La température
          d&apos;empâtage influence la fermentescibilité du moût et donc le corps de la bière finale.
        </p>
      </div>

      {/* Température d'empâtage */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Température d&apos;empâtage (°C)
          <Tooltip text={tipsData.mash_temp} />
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={60}
            max={72}
            step={1}
            value={mashing.mashTemp}
            onChange={(e) =>
              updateMashing({ mashTemp: Number(e.target.value) })
            }
            className="flex-1 accent-amber-600"
          />
          <span className="text-2xl font-bold text-amber-900 w-16 text-center">
            {mashing.mashTemp}°C
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {mashTempDescription(mashing.mashTemp)}
        </p>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>60°C (sec)</span>
          <span>66°C (équilibre)</span>
          <span>72°C (moelleux)</span>
        </div>
      </div>

      {/* Durée d'ébullition */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Durée d&apos;ébullition (minutes)
          <Tooltip text={tipsData.boil_duration} />
        </label>
        <input
          type="number"
          min={30}
          max={120}
          step={5}
          value={mashing.boilDuration || ""}
          onChange={(e) =>
            updateMashing({
              boilDuration: Number(e.target.value),
            })
          }
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          60 min est la durée standard. 90 min pour les Pilsners (réduction du DMS)
          ou les bières fortes.
        </p>
      </div>

      <Tip>
        Un empâtage à 64°C donne une bière plus sèche et plus alcoolisée, tandis
        qu&apos;à 68°C elle sera plus moelleuse mais légèrement moins forte. 66°C est un
        bon compromis pour la plupart des styles. L&apos;ébullition de 60 min est standard ;
        une durée plus longue peut intensifier la couleur et réduire le volume final.
      </Tip>
    </div>
  );
}
