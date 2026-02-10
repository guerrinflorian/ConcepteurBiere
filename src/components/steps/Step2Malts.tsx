"use client";

import { useState } from "react";
import { useRecipe } from "@/context/RecipeContext";
import { MaltAddition, AdjunctAddition } from "@/lib/types";
import { ebcToColorLabel, ebcToColor } from "@/lib/calculations";
import SearchableSelect from "@/components/ui/SearchableSelect";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 2 : Choix des malts et céréales + adjuvants.
 */
export default function Step2Malts() {
  const { recipe, setRecipe, maltsData, adjunctsData, calculated, tipsData } = useRecipe();
  const { malts } = recipe;
  const adjuncts = recipe.adjuncts ?? [];
  const [showAdjuncts, setShowAdjuncts] = useState(adjuncts.length > 0);

  function updateMalt(index: number, partial: Partial<MaltAddition>) {
    setRecipe((prev) => {
      const next = [...prev.malts];
      next[index] = { ...next[index], ...partial };
      return { ...prev, malts: next };
    });
  }

  function addMalt() {
    setRecipe((prev) => ({
      ...prev,
      malts: [...prev.malts, { maltId: "", amount: 0 }],
    }));
  }

  function removeMalt(index: number) {
    setRecipe((prev) => ({
      ...prev,
      malts: prev.malts.filter((_, i) => i !== index),
    }));
  }

  // Adjuncts management
  function updateAdjunct(index: number, partial: Partial<AdjunctAddition>) {
    setRecipe((prev) => {
      const next = [...(prev.adjuncts ?? [])];
      next[index] = { ...next[index], ...partial };
      return { ...prev, adjuncts: next };
    });
  }

  function addAdjunct() {
    setRecipe((prev) => ({
      ...prev,
      adjuncts: [...(prev.adjuncts ?? []), { adjunctId: "", amount: 0 }],
    }));
    setShowAdjuncts(true);
  }

  function removeAdjunct(index: number) {
    setRecipe((prev) => ({
      ...prev,
      adjuncts: (prev.adjuncts ?? []).filter((_, i) => i !== index),
    }));
  }

  // Calcul du total de malt
  const totalMaltKg = malts.reduce((sum, m) => sum + (m.amount || 0), 0);

  // Vérifier si le malt de base représente au moins 60%
  const baseMalts = malts.filter((m) => {
    const malt = maltsData.find((md) => md.id === m.maltId);
    return malt?.type === "base";
  });
  const baseMaltKg = baseMalts.reduce((sum, m) => sum + (m.amount || 0), 0);
  const baseRatio = totalMaltKg > 0 ? (baseMaltKg / totalMaltKg) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">🌾</span>Ingrédients — Malts & Céréales
        </h2>
        <p className="text-gray-600">
          Ajoutez les malts et céréales de votre recette. Le malt de base constitue
          la majorité du grain et détermine la densité. Les malts spéciaux ajoutent
          couleur, corps et saveurs.
        </p>
      </div>

      {/* Liste des malts */}
      <div className="space-y-3">
        {malts.map((addition, index) => {
          const selectedMalt = maltsData.find((m) => m.id === addition.maltId);
          return (
            <div
              key={index}
              className="p-4 bg-white border border-gray-200 rounded-lg space-y-2"
            >
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                <div className="flex-1 min-w-0">
                  <label className="block text-xs text-gray-500 mb-1">
                    Malt #{index + 1}
                    {index === 0 && <Tooltip text={tipsData.malt_base} />}
                  </label>
                  <SearchableSelect
                    value={addition.maltId}
                    onChange={(val) => updateMalt(index, { maltId: val })}
                    placeholder="— Choisir un malt —"
                    options={maltsData.map((m) => ({
                      value: m.id,
                      label: `${m.name} (${m.color_ebc} EBC – ${m.type})`,
                    }))}
                  />
                </div>
                <div className="w-32 flex-shrink-0">
                  <label className="block text-xs text-gray-500 mb-1">
                    Quantité (kg)
                    {index === 0 && <Tooltip text={tipsData.malt_amount} />}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={addition.amount || ""}
                    onChange={(e) =>
                      updateMalt(index, {
                        amount: Number(e.target.value),
                      })
                    }
                    placeholder="kg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
                  />
                </div>
                {malts.length > 1 && (
                  <button
                    onClick={() => removeMalt(index)}
                    className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm flex-shrink-0"
                    title="Supprimer ce malt"
                  >
                    Supprimer
                  </button>
                )}
              </div>
              {selectedMalt && (
                <div className="flex items-center gap-2 pl-1">
                  <span
                    className="inline-block w-4 h-4 rounded-full border border-gray-300 flex-shrink-0"
                    style={{ backgroundColor: ebcToColor(selectedMalt.color_ebc) }}
                    title={`${selectedMalt.color_ebc} EBC`}
                  />
                  <p className="text-xs text-gray-500 italic">
                    {selectedMalt.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addMalt}
        className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-sm font-medium"
      >
        + Ajouter un malt
      </button>

      {/* Statistiques en direct */}
      {totalMaltKg > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-sm">
          <p>
            <strong>Total grain :</strong> {totalMaltKg.toFixed(1)} kg
          </p>
          <p>
            <strong>Densité initiale estimée :</strong> {calculated.og.toFixed(3)}{" "}
            ({calculated.ogPlato}°P)
          </p>
          <p>
            <strong>Couleur :</strong> {calculated.ebc.toFixed(0)} EBC (
            {ebcToColorLabel(calculated.ebc)})
          </p>
          {baseRatio > 0 && baseRatio < 60 && (
            <p className="text-orange-700 font-medium">
              Le malt de base ne représente que {baseRatio.toFixed(0)}% du total.
              Il devrait idéalement être d&apos;au moins 60%.
              <Tooltip text={tipsData.malt_ratio} />
            </p>
          )}
        </div>
      )}

      {/* Section Adjuvants */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowAdjuncts(!showAdjuncts)}
          className="w-full px-4 py-3 bg-gray-50 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-between"
        >
          <span>
            Additifs & Adjuvants
            <Tooltip text={tipsData.adjuncts} />
          </span>
          <span className="text-gray-400">{showAdjuncts ? "▲" : "▼"}</span>
        </button>
        {showAdjuncts && (
          <div className="p-4 space-y-3">
            {adjuncts.map((addition, index) => {
              const selectedAdj = adjunctsData.find((a) => a.id === addition.adjunctId);
              return (
                <div
                  key={index}
                  className="p-3 bg-white border border-gray-200 rounded-lg space-y-2"
                >
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs text-gray-500 mb-1">
                        Adjuvant #{index + 1}
                      </label>
                      <SearchableSelect
                        value={addition.adjunctId}
                        onChange={(val) => updateAdjunct(index, { adjunctId: val })}
                        placeholder="— Choisir un adjuvant —"
                        options={adjunctsData.map((a) => ({
                          value: a.id,
                          label: `${a.name} (${a.category})`,
                        }))}
                      />
                    </div>
                    <div className="w-32 flex-shrink-0">
                      <label className="block text-xs text-gray-500 mb-1">
                        Quantité (kg)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        value={addition.amount || ""}
                        onChange={(e) =>
                          updateAdjunct(index, {
                            amount: Number(e.target.value),
                          })
                        }
                        placeholder="kg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none text-sm"
                      />
                    </div>
                    <button
                      onClick={() => removeAdjunct(index)}
                      className="px-3 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors text-sm flex-shrink-0"
                      title="Supprimer cet adjuvant"
                    >
                      Supprimer
                    </button>
                  </div>
                  {selectedAdj && (
                    <p className="text-xs text-gray-500 italic pl-1">
                      {selectedAdj.description} — Ajout : {selectedAdj.usage}
                    </p>
                  )}
                </div>
              );
            })}
            <button
              onClick={addAdjunct}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
            >
              + Ajouter un adjuvant
            </button>
          </div>
        )}
      </div>

      <Tip>
        Le malt de base devrait représenter au moins 60% du total. Pour {recipe.params.volume} L,
        un total de {(recipe.params.volume * 0.25).toFixed(1)}–{(recipe.params.volume * 0.3).toFixed(1)} kg
        de grain est un bon point de départ. Les malts plus foncés (cristal, torréfiés)
        augmentent la couleur et apportent des saveurs de caramel, biscuit ou café.
      </Tip>
    </div>
  );
}
