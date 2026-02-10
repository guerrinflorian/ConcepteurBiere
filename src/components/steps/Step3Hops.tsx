"use client";

import { useRecipe } from "@/context/RecipeContext";
import { HopAddition } from "@/lib/types";
import { ibuToLabel } from "@/lib/calculations";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 3 : Choix des houblons.
 */
export default function Step3Hops() {
  const { recipe, setRecipe, hopsData, calculated, tipsData } = useRecipe();
  const { hops } = recipe;

  function updateHop(index: number, partial: Partial<HopAddition>) {
    setRecipe((prev) => {
      const next = [...prev.hops];
      next[index] = { ...next[index], ...partial };
      return { ...prev, hops: next };
    });
  }

  function addHop() {
    setRecipe((prev) => ({
      ...prev,
      hops: [...prev.hops, { hopId: "", amount: 0, timing: 60 }],
    }));
  }

  function removeHop(index: number) {
    setRecipe((prev) => ({
      ...prev,
      hops: prev.hops.filter((_, i) => i !== index),
    }));
  }

  // Timings prédéfinis pour le select
  const timingOptions = [
    { value: 60, label: "60 min (amérisant)" },
    { value: 30, label: "30 min (saveur)" },
    { value: 15, label: "15 min (saveur/arôme)" },
    { value: 10, label: "10 min (arôme)" },
    { value: 5, label: "5 min (arôme intense)" },
    { value: 0, label: "0 min (flame out / whirlpool)" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">🌿</span>Ingrédients — Houblons
        </h2>
        <p className="text-gray-600">
          Ajoutez les houblons de votre recette. Le moment d&apos;ajout pendant l&apos;ébullition
          détermine si le houblon apporte de l&apos;amertume (ajout tôt) ou de l&apos;arôme (ajout tardif).
        </p>
      </div>

      {/* Liste des houblons */}
      <div className="space-y-3">
        {hops.map((addition, index) => {
          const selectedHop = hopsData.find((h) => h.id === addition.hopId);
          return (
            <div
              key={index}
              className="p-4 bg-white border border-gray-200 rounded-lg space-y-2"
            >
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">
                    Houblon #{index + 1}
                  </label>
                  <SearchableSelect
                    value={addition.hopId}
                    onChange={(val) => updateHop(index, { hopId: val })}
                    placeholder="— Choisir un houblon —"
                    options={hopsData.map((h) => ({
                      value: h.id,
                      label: `${h.name} (${h.alpha_acid}% AA – ${h.type})`,
                    }))}
                  />
                </div>
                <div className="w-28 flex-shrink-0">
                  <label className="block text-xs text-gray-500 mb-1">
                    Quantité (g)
                    {index === 0 && <Tooltip text={tipsData.hop_amount} />}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={addition.amount || ""}
                    onChange={(e) =>
                      updateHop(index, {
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="g"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
                  />
                </div>
                <div className="w-52 flex-shrink-0">
                  <label className="block text-xs text-gray-500 mb-1">
                    Ajout à…
                    {index === 0 && <Tooltip text={tipsData.hop_timing} />}
                  </label>
                  <select
                    value={addition.timing}
                    onChange={(e) =>
                      updateHop(index, { timing: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none bg-white text-sm"
                  >
                    {timingOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                {hops.length > 1 && (
                  <button
                    onClick={() => removeHop(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm flex-shrink-0"
                    title="Supprimer ce houblon"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              {selectedHop && (
                <p className="text-xs text-gray-500 italic pl-1">
                  {selectedHop.description} — Origine : {selectedHop.origin}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addHop}
        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
      >
        + Ajouter un houblon
      </button>

      {/* IBU en direct */}
      {calculated.ibu > 0 && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p>
            <strong>IBU estimés :</strong> {calculated.ibu.toFixed(0)} —{" "}
            amertume {ibuToLabel(calculated.ibu)}
            <Tooltip text={tipsData.hop_ibu} />
          </p>
        </div>
      )}

      <Tip>
        IBU {calculated.ibu.toFixed(0)} — amertume {ibuToLabel(calculated.ibu)}.
        Pour référence : Lager ~15 IBU, Pale Ale ~30, IPA ~50+.
        Le houblon ajouté dans les 10 dernières minutes n&apos;influence presque pas
        l&apos;amertume mais apporte beaucoup d&apos;arôme (agrumes, fruits, floral…).
      </Tip>
    </div>
  );
}
