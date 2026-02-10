"use client";

import { useRecipe } from "@/context/RecipeContext";
import { ConditioningMode } from "@/lib/types";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 7 : Conditionnement (sucrage & embouteillage ou mise en fût).
 */
export default function Step7Conditioning() {
  const { recipe, setRecipe, equipmentData, calculated, tipsData } = useRecipe();
  const { conditioning } = recipe;
  const volume = recipe.params.volume;

  const hasCapper = recipe.profile.selectedEquipment.includes("capper");
  const hasSwingTop = recipe.profile.selectedEquipment.includes("bottles_swing");
  const hasBottles33 = recipe.profile.selectedEquipment.includes("bottles_33");
  const hasBottles75 = recipe.profile.selectedEquipment.includes("bottles_75");
  const hasKeg = recipe.profile.selectedEquipment.includes("keg_19");
  const hasCo2 = recipe.profile.selectedEquipment.includes("co2_system");

  function updateConditioning(partial: Partial<typeof conditioning>) {
    setRecipe((prev) => ({
      ...prev,
      conditioning: { ...prev.conditioning, ...partial },
    }));
  }

  const totalSugar = conditioning.sugarPerLiter * volume;
  const sugarPer33cl = (conditioning.sugarPerLiter * 0.33).toFixed(1);
  const sugarPer75cl = (conditioning.sugarPerLiter * 0.75).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Conditionnement
        </h2>
        <p className="text-gray-600">
          Choisissez comment carbonater et conditionner votre bière : embouteillage
          avec sucre de refermentation ou mise en fût avec carbonatation forcée.
        </p>
      </div>

      {/* Mode de conditionnement */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mode de conditionnement :
          <Tooltip text={tipsData.conditioning_mode} />
        </label>
        <div className="flex gap-3">
          {(
            [
              ["bottles", "Embouteillage (bouteilles)"],
              ["keg", "Fût (carbonatation forcée)"],
            ] as [ConditioningMode, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => updateConditioning({ mode: value })}
              className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                conditioning.mode === value
                  ? "border-amber-500 bg-amber-50 text-amber-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Embouteillage */}
      {conditioning.mode === "bottles" && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sucre de refermentation (g/L)
              <Tooltip text={tipsData.sugar_per_liter} />
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={4}
                max={10}
                step={0.5}
                value={conditioning.sugarPerLiter}
                onChange={(e) =>
                  updateConditioning({
                    sugarPerLiter: Number(e.target.value),
                  })
                }
                className="flex-1 accent-amber-600"
              />
              <span className="text-lg font-bold text-amber-900 w-20 text-center">
                {conditioning.sugarPerLiter} g/L
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>4 g/L (peu pétillante)</span>
              <span>7 g/L (standard)</span>
              <span>10 g/L (très pétillante)</span>
            </div>
          </div>

          {/* Résultats calculés */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm space-y-1">
            <p>
              <strong>Sucre total :</strong> {totalSugar.toFixed(0)} g pour{" "}
              {volume} L
            </p>
            {hasBottles33 && (
              <p>
                Soit environ <strong>{sugarPer33cl} g par bouteille de 33 cL</strong>
                {" "}(ou dissoudre les {totalSugar.toFixed(0)} g dans le lot entier).
              </p>
            )}
            {hasBottles75 && (
              <p>
                Soit environ <strong>{sugarPer75cl} g par bouteille de 75 cL</strong>.
              </p>
            )}
            <p className="text-gray-600 mt-1">
              Cela augmentera le taux d&apos;alcool d&apos;environ +0,3 à 0,5%.
            </p>
          </div>

          {/* Conseils adaptés au matériel */}
          {!hasCapper && !hasSwingTop && (
            <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg text-sm text-orange-800">
              <strong>Attention :</strong> Vous n&apos;avez pas de capsuleuse ni de bouteilles
              à bouchon mécanique. Vous aurez besoin de l&apos;un ou l&apos;autre pour fermer
              vos bouteilles.
            </div>
          )}

          <Tip>
            Dissolvez le sucre dans un peu d&apos;eau bouillante, laissez refroidir,
            puis mélangez doucement dans le moût avant mise en bouteilles.
            {hasCapper
              ? " Utilisez votre capsuleuse pour fermer les bouteilles nettoyées et désinfectées."
              : hasSwingTop
              ? " Vos bouteilles swing-top se referment facilement sans capsuleuse."
              : " Procurez-vous une capsuleuse ou des bouteilles à bouchon mécanique."}
            {" "}Attendez 2 à 3 semaines à température ambiante pour la prise de mousse.
          </Tip>
        </div>
      )}

      {/* Fût */}
      {conditioning.mode === "keg" && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm space-y-2">
            <p>
              Vous avez choisi la <strong>carbonatation forcée en fût</strong>.
              Pas de sucre ajouté — vous carbonaterez avec du CO₂ externe.
            </p>
            <p>
              Assurez-vous que la fermentation soit complètement terminée avant
              de transférer en fût.
            </p>
            <div className="mt-3 p-3 bg-white rounded-lg">
              <p className="font-medium">Paramètres suggérés :</p>
              <ul className="list-disc list-inside mt-1 text-gray-700 space-y-1">
                <li>Carbonatez à ~2,5 volumes de CO₂</li>
                <li>Pression de service : ~1 bar à 4°C</li>
                <li>Durée : 5 à 7 jours pour une carbonatation complète</li>
              </ul>
            </div>
          </div>
          {!hasKeg && (
            <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg text-sm text-orange-800">
              <strong>Attention :</strong> Vous n&apos;avez pas indiqué posséder de fût
              Cornelius. Assurez-vous d&apos;avoir le matériel nécessaire.
            </div>
          )}
          {!hasCo2 && (
            <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-r-lg text-sm text-orange-800">
              <strong>Attention :</strong> Pas de système CO₂ sélectionné.
              La carbonatation forcée nécessite une bouteille de CO₂ et un détendeur.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
