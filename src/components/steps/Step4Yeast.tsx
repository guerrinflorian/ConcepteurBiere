"use client";

import { useRecipe } from "@/context/RecipeContext";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 4 : Choix de la levure.
 */
export default function Step4Yeast() {
  const { recipe, setRecipe, yeastsData, calculated, tipsData } = useRecipe();

  const selectedYeast = yeastsData.find((y) => y.id === recipe.yeastId);

  function handleYeastChange(id: string) {
    const yeast = yeastsData.find((y) => y.id === id);
    setRecipe((prev) => ({
      ...prev,
      yeastId: id,
      // Ajuster automatiquement la température de fermentation
      fermentation: {
        ...prev.fermentation,
        fermentationTemp: yeast?.temp_ideal ?? prev.fermentation.fermentationTemp,
        primaryDays: yeast?.type === "lager" ? 21 : 10,
      },
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Ingrédients — Levure
        </h2>
        <p className="text-gray-600">
          Choisissez la levure pour votre fermentation. La levure détermine
          le profil aromatique, l&apos;atténuation (bière plus ou moins sèche) et
          le type de fermentation (ale ou lager).
        </p>
      </div>

      {/* Sélecteur de levure */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Levure :
        </label>
        <select
          value={recipe.yeastId}
          onChange={(e) => handleYeastChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-white"
        >
          <option value="">— Choisir une levure —</option>
          <optgroup label="Levures Ale (fermentation haute)">
            {yeastsData
              .filter((y) => y.type === "ale")
              .map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="Levures Lager (fermentation basse)">
            {yeastsData
              .filter((y) => y.type === "lager")
              .map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
          </optgroup>
        </select>
      </div>

      {/* Caractéristiques de la levure sélectionnée */}
      {selectedYeast && (
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg space-y-2">
          <h4 className="font-semibold text-purple-900">
            {selectedYeast.name}
          </h4>
          <p className="text-sm text-gray-700">{selectedYeast.description}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm mt-2">
            <div className="p-2 bg-white rounded">
              <span className="text-xs text-gray-500 block">Type</span>
              <span className="font-medium">
                {selectedYeast.type === "ale" ? "Ale (haute)" : "Lager (basse)"}
              </span>
            </div>
            <div className="p-2 bg-white rounded">
              <span className="text-xs text-gray-500 block">Température <Tooltip text={tipsData.yeast_temperature} /></span>
              <span className="font-medium">
                {selectedYeast.temp_min}–{selectedYeast.temp_max}°C (idéale :{" "}
                {selectedYeast.temp_ideal}°C)
              </span>
            </div>
            <div className="p-2 bg-white rounded">
              <span className="text-xs text-gray-500 block">Atténuation <Tooltip text={tipsData.yeast_attenuation} /></span>
              <span className="font-medium">{selectedYeast.attenuation}%</span>
            </div>
            <div className="p-2 bg-white rounded">
              <span className="text-xs text-gray-500 block">Floculation <Tooltip text={tipsData.yeast_flocculation} /></span>
              <span className="font-medium capitalize">
                {selectedYeast.flocculation}
              </span>
            </div>
            <div className="p-2 bg-white rounded">
              <span className="text-xs text-gray-500 block">
                Tolérance alcool
              </span>
              <span className="font-medium">
                {selectedYeast.alcohol_tolerance}%
              </span>
            </div>
          </div>

          {/* Résultats estimés avec cette levure */}
          {calculated.og > 1.001 && (
            <div className="mt-3 p-3 bg-white rounded-lg text-sm">
              <p>
                <strong>FG estimée :</strong> {calculated.fg.toFixed(3)}
              </p>
              <p>
                <strong>ABV estimé :</strong> ~{calculated.abv.toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      <Tip>
        Choisissez une levure adaptée au style de bière et à la température de
        fermentation que vous pouvez maintenir. Une ale fermentera typiquement à
        ~18–22°C (température ambiante), tandis qu&apos;une lager nécessite ~9–15°C
        (réfrigérateur ou chambre froide).
      </Tip>
    </div>
  );
}
