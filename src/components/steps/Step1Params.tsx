"use client";

import { useRecipe } from "@/context/RecipeContext";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 1 : Paramètres de base du brassin (nom, volume, style).
 */
export default function Step1Params() {
  const { recipe, setRecipe, stylesData, tipsData } = useRecipe();
  const { params } = recipe;

  function updateParams(partial: Partial<typeof params>) {
    setRecipe((prev) => ({
      ...prev,
      params: { ...prev.params, ...partial },
    }));
  }

  const selectedStyle = stylesData.find((s) => s.id === params.styleId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">⚙️</span>Paramètres de base
        </h2>
        <p className="text-gray-600">
          Définissez les paramètres généraux de votre brassin : le nom de votre recette,
          le volume souhaité et éventuellement un style cible pour vous guider.
        </p>
      </div>

      {/* Nom de la recette */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Nom de la recette (optionnel)
        </label>
        <input
          type="text"
          value={params.recipeName}
          onChange={(e) => updateParams({ recipeName: e.target.value })}
          placeholder="Ex : Ma Blonde d'Été"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
        />
      </div>

      {/* Volume */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          📐 Volume du brassin (litres)
          <Tooltip text={tipsData.volume} />
        </label>
        <input
          type="number"
          min={5}
          max={200}
          step={1}
          value={params.volume || ""}
          onChange={(e) =>
            updateParams({ volume: Number(e.target.value) })
          }
          className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          Volume typique pour un amateur : 10–25 L. Pour un pro : 50–200 L.
        </p>
      </div>

      {/* Style cible */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Style cible (optionnel)
          <Tooltip text={tipsData.style_target} />
        </label>
        <SearchableSelect
          value={params.styleId}
          onChange={(val) => updateParams({ styleId: val })}
          placeholder="— Aucun style particulier —"
          options={stylesData.map((style) => ({
            value: style.id,
            label: style.name,
          }))}
        />
        {selectedStyle && (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
            <p className="font-medium">{selectedStyle.name}</p>
            <p className="text-gray-500 mt-1">{selectedStyle.description}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
              <span>OG : {selectedStyle.og_min}–{selectedStyle.og_max}</span>
              <span>IBU : {selectedStyle.ibu_min}–{selectedStyle.ibu_max}</span>
              <span>ABV : {selectedStyle.abv_min}–{selectedStyle.abv_max}%</span>
              <span>EBC : {selectedStyle.ebc_min}–{selectedStyle.ebc_max}</span>
            </div>
          </div>
        )}
      </div>

      <Tip>
        Le volume correspond au volume final souhaité en fermenteur. Prévoyez environ
        10–15% de plus en cuve pour compenser les pertes (grains, évaporation, trub).
        Si vous choisissez un style cible, les étapes suivantes pourront comparer vos
        choix aux paramètres du style.
      </Tip>
    </div>
  );
}
