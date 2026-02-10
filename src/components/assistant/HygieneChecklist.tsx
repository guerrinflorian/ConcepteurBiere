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
 * - Clic sur toute la ligne pour cocher/décocher
 */
export default function HygieneChecklist({ stepId }: { stepId: string }) {
  const { uiMode, assistant, recipe, equipmentData } = useRecipe();
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

  return (
    <div className="mt-4 rounded-xl border-2 border-teal-200/60 bg-gradient-to-br from-teal-50/50 to-white">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-teal-100/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">🧹</span>
          <span className="text-sm font-semibold text-teal-800">
            {stepChecklist.title}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-100 text-teal-700">
            Conseils d'hygiène
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-teal-400"
        >
          ▼
        </motion.span>
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
            <div className="px-4 pb-4 pt-3 space-y-2">
              {/* Introduction pédagogique (toujours visible en mode débutant) */}
              {beginner && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-teal-700 italic bg-teal-50 rounded-lg p-2.5 border border-teal-100"
                >
                  {stepChecklist.intro}
                </motion.p>
              )}

              {filteredItems.map((item, index) => (
                <ChecklistItemRow key={item.id} item={item} beginner={beginner} index={index} />
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
  beginner,
  index,
}: {
  item: ChecklistItem;
  beginner: boolean;
  index: number;
}) {
  const [showDetails, setShowDetails] = useState(beginner);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-xl border-2 transition-all select-none ${
        item.severity === "warn" ? "bg-white border-orange-200" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1 min-w-0">
          <span className={`text-sm font-medium leading-snug text-gray-800`}>
            {item.label}
            {item.severity === "warn" && (
              <span className="ml-1.5 inline-flex items-center gap-0.5 text-orange-500 text-[10px] font-bold bg-orange-50 px-1.5 py-0.5 rounded-full">
                Important
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Détails : Pourquoi + Comment */}
      <div>
        {beginner ? (
          <div className="px-3 pb-3 pl-12 space-y-1">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-teal-700">Pourquoi :</strong> {item.why}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong className="text-teal-700">Comment :</strong> {item.how}
            </p>
          </div>
        ) : (
          <div className="px-3 pb-2 pl-12">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-teal-600 hover:text-teal-800 transition-colors font-medium"
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
                  <div className="mt-1.5 space-y-1">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-teal-700">Pourquoi :</strong> {item.why}
                    </p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-teal-700">Comment :</strong> {item.how}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
}
