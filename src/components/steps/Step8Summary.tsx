"use client";

import { useRef } from "react";
import { useRecipe } from "@/context/RecipeContext";
import { ebcToColor, ebcToColorLabel, ibuToLabel } from "@/lib/calculations";
import { calculateWaterPlan } from "@/lib/waterCalc";
import { buildCheckContext, runConsistencyChecks } from "@/lib/consistencyChecks";
import { buildProcedureContext, generateProcedure } from "@/lib/recipeProcedure";
import BeerGlass from "@/components/ui/BeerGlass";
import StyleComparison from "@/components/ui/StyleComparison";
import ProcedureSection from "@/components/ProcedureSection";

/**
 * Étape 9 (anciennement 8) : Résumé complet de la recette + procédure A→Z.
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
  const waterPlan = calculateWaterPlan(recipe);
  const isAllGrain = recipe.params.method === "tout_grain";

  // Checks de cohérence
  const checkCtx = buildCheckContext(recipe, equipmentData);
  const checks = runConsistencyChecks(checkCtx);

  // Procédure de fabrication
  const procedureCtx = buildProcedureContext(
    recipe, maltsData, hopsData, yeastsData, adjunctsData, equipmentData
  );
  const procedure = generateProcedure(procedureCtx);

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
    e.target.value = "";
  }

  const selectedEquipment = recipe.profile.selectedEquipment
    .map((id) => equipmentData.find((e) => e.id === id))
    .filter(Boolean);

  const methodLabel = recipe.params.method === "tout_grain"
    ? "Tout-grain"
    : recipe.params.method === "extrait"
    ? "Extrait"
    : "Kit";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          Résumé de la recette
        </h2>
        <p className="text-gray-600">
          Voici la fiche récapitulative complète de votre recette avec le guide de fabrication personnalisé.
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
            {methodLabel} — {recipe.params.volume} L —{" "}
            {recipe.profile.userType === "pro" ? "professionnel" : "amateur"}
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

      {/* Vérifications de cohérence */}
      {checks.length > 0 && (
        <Section title="Vérifications de cohérence">
          <div className="space-y-2">
            {checks.map((check) => (
              <div
                key={check.id}
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
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Comparaison avec le style */}
      {style && (
        <StyleComparison style={style} calculated={calculated} />
      )}

      {/* Plan d'eau */}
      <Section title="Plan d'eau">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {isAllGrain && (
            <>
              <ResultItem label="Eau d'empâtage" value={`${waterPlan.mashWaterL} L`} />
              <ResultItem label="Eau de rinçage" value={`${waterPlan.spargeWaterL} L`} />
            </>
          )}
          <ResultItem label="Volume pré-ébullition" value={`${waterPlan.preBoilVolumeL} L`} />
          <ResultItem label="Volume final" value={`${waterPlan.postBoilVolumeL} L`} />
          <ResultItem label="Eau totale" value={`${waterPlan.totalWaterL} L`} />
          <ResultItem label="Pertes estimées" value={`${waterPlan.lossesL} L`} />
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Source d&apos;eau : {recipe.water.sourceType === "robinet" ? "Robinet" : recipe.water.sourceType === "bouteille" ? "Bouteille" : recipe.water.sourceType === "osmosee" ? "Osmosée" : "Non précisé"}
          {recipe.water.notes && ` — ${recipe.water.notes}`}
        </p>
      </Section>

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
            <strong>Méthode :</strong> {methodLabel}
          </div>
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

      {/* Procédure de fabrication A→Z */}
      <div className="p-4 bg-white border border-gray-200 rounded-lg">
        <ProcedureSection steps={procedure} />
      </div>

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
