"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";
import { hygieneChecklist, ChecklistItem } from "@/data/hygieneChecklist";
import { isBeginner } from "@/lib/uiMode";

/**
 * Checklist d'hygiène affichée à chaque étape du wizard.
 * - En mode Débutant : ouverte par défaut, "Pourquoi/Comment" visibles
 * - En mode Expert : repliée par défaut, "Pourquoi/Comment" en accordéon
 */
export default function HygieneChecklist({ stepId }: { stepId: string }) {
  const { uiMode, assistant, toggleHygieneCheck, recipe, equipmentData } = useRecipe();
  const beginner = isBeginner(uiMode);
  const [isOpen, setIsOpen] = useState(beginner);

  // Trouver la checklist pour cette étape
  const stepChecklist = hygieneChecklist.find((s) => s.stepId === stepId);
  if (!stepChecklist) return null;

  // Filtrer les items selon l'état de la recette
  const hasChiller = recipe.profile.selectedEquipment.some((id) => {
    const eq = equipmentData.find((e) => e.id === id);
    return eq?.category === "refroidissement";
  });
  const hasTempControl = recipe.profile.selectedEquipment.some((id) => {
    const eq = equipmentData.find((e) => e.id === id);
    return eq?.category === "température";
  });
  const packagingType = recipe.conditioning.mode;

  const filteredItems = stepChecklist.items.filter((item) => {
    if (!item.appliesWhen) return true;
    const aw = item.appliesWhen;
    if (aw.packagingType && aw.packagingType !== packagingType) return false;
    if (aw.hasChiller !== undefined && aw.hasChiller !== hasChiller) return false;
    if (aw.hasTempControl !== undefined && aw.hasTempControl !== hasTempControl) return false;
    return true;
  });

  if (filteredItems.length === 0) return null;

  const checkedCount = filteredItems.filter((item) => assistant.hygieneChecks[item.id]).length;
  const allChecked = checkedCount === filteredItems.length;

  return (
    <div className="mt-4 border border-teal-200 rounded-lg overflow-hidden bg-teal-50/50">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-teal-100/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-teal-700 text-lg">🧹</span>
          <span className="text-sm font-semibold text-teal-800">
            {stepChecklist.title}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            allChecked
              ? "bg-teal-200 text-teal-800"
              : "bg-teal-100 text-teal-600"
          }`}>
            {checkedCount}/{filteredItems.length}
          </span>
        </div>
        <span className="text-teal-400 text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Introduction pédagogique (toujours visible en mode débutant) */}
              {beginner && (
                <p className="text-sm text-teal-700 italic">
                  {stepChecklist.intro}
                </p>
              )}

              {filteredItems.map((item) => (
                <ChecklistItemRow
                  key={item.id}
                  item={item}
                  checked={!!assistant.hygieneChecks[item.id]}
                  onToggle={() => toggleHygieneCheck(item.id)}
                  beginner={beginner}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChecklistItemRow({
  item,
  checked,
  onToggle,
  beginner,
}: {
  item: ChecklistItem;
  checked: boolean;
  onToggle: () => void;
  beginner: boolean;
}) {
  const [showDetails, setShowDetails] = useState(beginner);

  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        checked
          ? "bg-teal-100 border-teal-300"
          : item.severity === "warn"
          ? "bg-white border-orange-200"
          : "bg-white border-gray-200"
      }`}
    >
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          className="mt-0.5 accent-teal-600 w-4 h-4"
        />
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium ${checked ? "text-teal-700 line-through" : "text-gray-800"}`}>
            {item.label}
            {item.severity === "warn" && !checked && (
              <span className="ml-1 text-orange-500 text-xs font-bold">●</span>
            )}
          </span>
        </div>
      </label>

      {/* Détails : Pourquoi + Comment */}
      {beginner ? (
        <div className="mt-2 pl-7 space-y-1">
          <p className="text-xs text-gray-600">
            <strong className="text-gray-700">Pourquoi :</strong> {item.why}
          </p>
          <p className="text-xs text-gray-600">
            <strong className="text-gray-700">Comment :</strong> {item.how}
          </p>
        </div>
      ) : (
        <div className="mt-1 pl-7">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-teal-600 hover:text-teal-800 transition-colors"
          >
            {showDetails ? "Masquer les détails ▲" : "Voir pourquoi / comment ▼"}
          </button>
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="mt-1 space-y-1">
                  <p className="text-xs text-gray-600">
                    <strong className="text-gray-700">Pourquoi :</strong> {item.why}
                  </p>
                  <p className="text-xs text-gray-600">
                    <strong className="text-gray-700">Comment :</strong> {item.how}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
