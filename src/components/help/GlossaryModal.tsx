"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { glossary, GlossaryEntry } from "@/data/glossary";

const categories = [
  { key: "all", label: "Tout" },
  { key: "mesure", label: "Mesures" },
  { key: "processus", label: "Processus" },
  { key: "ingredient", label: "Ingrédients" },
  { key: "defaut", label: "Défauts" },
  { key: "equipement", label: "Équipement" },
] as const;

/**
 * Modal de lexique / glossaire accessible partout dans l'application.
 * Affiche les termes brassicoles avec définitions, valeurs typiques et exemples.
 * Recherche + filtrage par catégorie.
 */
export default function GlossaryModal({ onClose }: { onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = glossary.filter((entry) => {
    const matchesSearch =
      !search ||
      entry.term.toLowerCase().includes(search.toLowerCase()) ||
      entry.fullName.toLowerCase().includes(search.toLowerCase()) ||
      entry.definition.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "all" || entry.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-gray-900">
              📖 Lexique du brasseur
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un terme (OG, IBU, DMS…)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none"
          />

          {/* Category filters */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  category === cat.key
                    ? "bg-amber-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun terme trouvé pour &ldquo;{search}&rdquo;
            </p>
          ) : (
            filtered.map((entry) => (
              <GlossaryCard key={entry.term} entry={entry} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 text-center text-xs text-gray-400 flex-shrink-0">
          {glossary.length} termes dans le lexique
        </div>
      </motion.div>
    </motion.div>
  );
}

function GlossaryCard({ entry }: { entry: GlossaryEntry }) {
  const [expanded, setExpanded] = useState(false);

  const catColors: Record<string, string> = {
    mesure: "bg-blue-100 text-blue-700",
    processus: "bg-green-100 text-green-700",
    ingredient: "bg-amber-100 text-amber-700",
    defaut: "bg-red-100 text-red-700",
    equipement: "bg-purple-100 text-purple-700",
  };

  return (
    <div
      className="p-3 bg-white border border-gray-200 rounded-lg hover:border-amber-200 transition-colors cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-amber-900">{entry.term}</span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${catColors[entry.category] || "bg-gray-100 text-gray-600"}`}>
          {entry.category}
        </span>
        <span className="text-xs text-gray-400 flex-1">{entry.fullName}</span>
        <span className="text-gray-400 text-xs">{expanded ? "▲" : "▼"}</span>
      </div>

      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
        {entry.definition}
      </p>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2 text-xs">
              <div>
                <strong className="text-gray-700">Pourquoi c&apos;est important :</strong>
                <p className="text-gray-600">{entry.whyItMatters}</p>
              </div>
              {entry.typicalValues && (
                <div>
                  <strong className="text-gray-700">Valeurs typiques :</strong>
                  <p className="text-gray-600">{entry.typicalValues}</p>
                </div>
              )}
              {entry.example && (
                <div>
                  <strong className="text-gray-700">Exemple :</strong>
                  <p className="text-gray-600">{entry.example}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
