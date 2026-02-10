"use client";

import { useRef } from "react";
import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ebcToColorLabel, ibuToLabel } from "@/lib/calculations";
import BeerGlass from "@/components/ui/BeerGlass";
import StyleComparison from "@/components/ui/StyleComparison";

/**
 * Étape 8 : Résumé de la recette avec export/import.
 */
export default function Step8Summary() {
  const {
    recipe,
    calculated,
    maltsData,
    hopsData,
    yeastsData,
    equipmentData,
    stylesData,
    adjunctsData,
    exportRecipe,
    importRecipe,
    resetRecipe,
  } = useRecipe();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const yeast = yeastsData.find((y) => y.id === recipe.yeastId);
  const style = stylesData.find((s) => s.id === recipe.params.styleId);
  const adjuncts = recipe.adjuncts ?? [];

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = importRecipe(text);
      if (!success) {
        alert(
          "Le fichier JSON importé n'est pas au format attendu. Vérifiez qu'il s'agit bien d'une recette exportée depuis cette application."
        );
      }
    };
    reader.readAsText(file);
    // Reset pour permettre de réimporter le même fichier
    e.target.value = "";
  }

  const selectedEquipment = recipe.profile.selectedEquipment
    .map((id) => equipmentData.find((e) => e.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Résumé de la recette
        </h2>
        <p className="text-gray-600">
          Voici la fiche récapitulative de votre recette. Vérifiez tous les
          paramètres avant d&apos;exporter.
        </p>
      </div>

      {/* En-tête avec verre */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
        <BeerGlass ebc={calculated.ebc} />
        <div className="text-center sm:text-left">
          <h3 className="text-2xl font-bold text-amber-900">
            {recipe.params.recipeName || "Ma recette"}
          </h3>
          {style && (
            <p className="text-sm text-amber-700">{style.name}</p>
          )}
          <p className="text-sm text-gray-600 mt-1">
            Brassage {recipe.profile.userType === "pro" ? "professionnel" : "amateur"}{" "}
            — {recipe.params.volume} L
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <StatBadge label="OG" value={calculated.og.toFixed(3)} />
            <StatBadge label="FG" value={calculated.fg.toFixed(3)} />
            <StatBadge label="ABV" value={`${calculated.abv.toFixed(1)}%`} />
            <StatBadge label="IBU" value={calculated.ibu.toFixed(0)} />
            <StatBadge label="EBC" value={calculated.ebc.toFixed(0)} />
          </div>
        </div>
      </div>

      {/* Comparaison avec le style */}
      {style && (
        <StyleComparison style={style} calculated={calculated} />
      )}

      {/* Ingrédients */}
      <Section title="Ingrédients">
        <SubSection title="Malts & Céréales">
          <ul className="space-y-1">
            {recipe.malts
              .filter((m) => m.maltId)
              .map((m, i) => {
                const malt = maltsData.find((md) => md.id === m.maltId);
                return (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{malt?.name || m.maltId}</span>
                    <span className="font-medium">{m.amount} kg</span>
                  </li>
                );
              })}
          </ul>
        </SubSection>

        {adjuncts.filter((a) => a.adjunctId).length > 0 && (
          <SubSection title="Additifs & Adjuvants">
            <ul className="space-y-1">
              {adjuncts
                .filter((a) => a.adjunctId)
                .map((a, i) => {
                  const adj = adjunctsData.find((ad) => ad.id === a.adjunctId);
                  return (
                    <li key={i} className="flex justify-between text-sm">
                      <span>{adj?.name || a.adjunctId} <span className="text-gray-400 text-xs">({adj?.usage})</span></span>
                      <span className="font-medium">{a.amount} kg</span>
                    </li>
                  );
                })}
            </ul>
          </SubSection>
        )}

        <SubSection title="Houblons">
          <ul className="space-y-1">
            {recipe.hops
              .filter((h) => h.hopId)
              .map((h, i) => {
                const hop = hopsData.find((hd) => hd.id === h.hopId);
                return (
                  <li key={i} className="flex justify-between text-sm">
                    <span>
                      {hop?.name || h.hopId} — {h.timing} min
                    </span>
                    <span className="font-medium">{h.amount} g</span>
                  </li>
                );
              })}
          </ul>
        </SubSection>

        <SubSection title="Levure">
          <p className="text-sm">
            {yeast?.name || "Non sélectionnée"}
            {yeast && (
              <span className="text-gray-500">
                {" "}
                — {yeast.type === "ale" ? "Ale" : "Lager"}, atténuation{" "}
                {yeast.attenuation}%
              </span>
            )}
          </p>
        </SubSection>
      </Section>

      {/* Processus */}
      <Section title="Processus">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Empâtage :</strong> {recipe.mashing.mashTemp}°C
          </div>
          <div>
            <strong>Ébullition :</strong> {recipe.mashing.boilDuration} min
          </div>
          <div>
            <strong>Fermentation :</strong> {recipe.fermentation.fermentationTemp}°C pendant{" "}
            {recipe.fermentation.primaryDays} jours
          </div>
          {recipe.fermentation.hasSecondary && (
            <div>
              <strong>Maturation :</strong> {recipe.fermentation.secondaryTemp}°C pendant{" "}
              {recipe.fermentation.secondaryDays} jours
            </div>
          )}
          <div>
            <strong>Conditionnement :</strong>{" "}
            {recipe.conditioning.mode === "bottles"
              ? `Embouteillage (${recipe.conditioning.sugarPerLiter} g/L = ${calculated.totalSugar} g total)`
              : "Fût (carbonatation forcée)"}
          </div>
        </div>
      </Section>

      {/* Résultats estimés */}
      <Section title="Résultats estimés">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <ResultItem label="Densité initiale (OG)" value={`${calculated.og.toFixed(3)} (${calculated.ogPlato}°P)`} />
          <ResultItem label="Densité finale (FG)" value={calculated.fg.toFixed(3)} />
          <ResultItem label="Alcool (ABV)" value={`${calculated.abv.toFixed(1)}%`} />
          <ResultItem label="Amertume (IBU)" value={`${calculated.ibu.toFixed(0)} — ${ibuToLabel(calculated.ibu)}`} />
          <ResultItem
            label="Couleur (EBC)"
            value={`${calculated.ebc.toFixed(0)} — ${ebcToColorLabel(calculated.ebc)}`}
            color={ebcToColor(calculated.ebc)}
          />
          <ResultItem label="CO₂" value={`${calculated.co2Volumes} vol`} />
        </div>
      </Section>

      {/* Matériel */}
      {selectedEquipment.length > 0 && (
        <Section title="Matériel sélectionné">
          <div className="flex flex-wrap gap-2">
            {selectedEquipment.map(
              (eq) =>
                eq && (
                  <span
                    key={eq.id}
                    className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                  >
                    {eq.name}
                  </span>
                )
            )}
          </div>
        </Section>
      )}

      {/* Conseils finaux */}
      <Section title="Conseils de brassage">
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
          <li>
            Nettoyez et désinfectez tout le matériel en contact avec le moût après
            ébullition. La propreté est la clé d&apos;une bière réussie.
          </li>
          <li>
            Pendant l&apos;ébullition, surveillez les débordements (mousse au démarrage).
            Réduisez le feu dès les premiers signes.
          </li>
          <li>
            Refroidissez le moût le plus rapidement possible après l&apos;ébullition
            pour limiter les infections et les composés indésirables.
          </li>
          <li>
            Oxygénez bien le moût avant d&apos;ensemencer la levure (agitez vigoureusement
            le fermenteur fermé).
          </li>
          <li>
            Après {recipe.fermentation.primaryDays} jours de fermentation, vérifiez
            la densité{" "}
            {recipe.profile.selectedEquipment.includes("hydrometer")
              ? "avec votre densimètre"
              : "(idéalement avec un densimètre)"}{" "}
            deux jours de suite pour confirmer la fin de la fermentation.
          </li>
          {recipe.conditioning.mode === "bottles" && (
            <li>
              Après embouteillage, attendez 2–3 semaines à température ambiante
              (~20°C) pour la prise de mousse, puis stockez au frais.
            </li>
          )}
        </ul>
      </Section>

      {/* Boutons d'action */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 no-print">
        <button
          onClick={exportRecipe}
          className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
        >
          Exporter la recette (JSON)
        </button>
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Imprimer la recette
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Importer une recette
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => {
            if (
              confirm(
                "Êtes-vous sûr de vouloir commencer une nouvelle recette ? Les données actuelles seront perdues."
              )
            ) {
              resetRecipe();
            }
          }}
          className="px-6 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
        >
          Nouvelle recette
        </button>
      </div>
    </div>
  );
}

// === Sous-composants ===

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="text-lg font-bold text-amber-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3">
      <h4 className="text-sm font-semibold text-gray-600 mb-1">{title}</h4>
      {children}
    </div>
  );
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="px-3 py-1 bg-white/80 rounded-full text-sm font-medium text-amber-900 border border-amber-300">
      {label}: {value}
    </span>
  );
}

function ResultItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="p-2 bg-gray-50 rounded">
      <span className="text-xs text-gray-500 block">{label}</span>
      <span className="font-medium flex items-center gap-2">
        {color && (
          <span
            className="inline-block w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: color }}
          />
        )}
        {value}
      </span>
    </div>
  );
}
