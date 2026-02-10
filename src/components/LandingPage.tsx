"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useRecipe } from "@/context/RecipeContext";

/**
 * Page d'accueil : choisir entre créer une nouvelle recette ou importer une recette existante.
 */
export default function LandingPage() {
  const { importRecipe, setShowWizard, setCurrentStep } = useRecipe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const success = importRecipe(text);
      if (!success) {
        alert(
          "Le fichier JSON importé n'est pas au format attendu. Vérifiez qu'il s'agit bien d'une recette exportée depuis ConcepteurBière."
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleNewRecipe() {
    setCurrentStep(0);
    setShowWizard(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-2xl w-full"
      >
        {/* Logo & Titre */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 shadow-xl shadow-amber-200 mb-6">
            <span className="text-5xl">🍺</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-3">
            ConcepteurBière
          </h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            Créez votre recette de bière maison pas à pas, avec un guide complet de fabrication personnalisé.
          </p>
        </motion.div>

        {/* Cartes de choix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Créer une recette */}
          <motion.button
            type="button"
            onClick={handleNewRecipe}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl bg-white border-2 border-amber-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all text-left cursor-pointer overflow-visible"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl mb-4 shadow-md group-hover:shadow-lg transition-shadow">
                ✨
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Créer une recette
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Concevez votre bière de A à Z : choix du style, des ingrédients, du matériel, et obtenez un guide de fabrication complet.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Commencer</span>
                <span className="text-lg">→</span>
              </div>
            </div>
          </motion.button>

          {/* Importer une recette */}
          <motion.button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="group relative p-8 rounded-2xl bg-white border-2 border-gray-200 hover:border-amber-400 shadow-lg hover:shadow-xl transition-all text-left cursor-pointer overflow-visible"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-gray-100 to-transparent rounded-bl-full opacity-60 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-3xl mb-4 shadow-md group-hover:shadow-lg group-hover:from-amber-400 group-hover:to-amber-600 transition-all">
                📂
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                Importer une recette
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Chargez une recette précédemment exportée (fichier JSON) pour la consulter, la modifier ou la re-brasser.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-gray-500 group-hover:text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
                <span>Choisir un fichier</span>
                <span className="text-lg">↑</span>
              </div>
            </div>
          </motion.button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-gray-400 mt-10"
        >
          Aucune inscription requise. Vos données restent sur votre appareil.
          <br />
          Exportez votre recette en JSON pour la sauvegarder ou la partager.
        </motion.p>
      </motion.div>
    </div>
  );
}
