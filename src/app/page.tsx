"use client";

import { RecipeProvider, useRecipe } from "@/context/RecipeContext";
import Wizard from "@/components/Wizard";
import LandingPage from "@/components/LandingPage";

function AppContent() {
  const { showWizard } = useRecipe();

  if (!showWizard) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen py-4">
      <Wizard />
    </main>
  );
}

export default function Home() {
  return (
    <RecipeProvider>
      <AppContent />
    </RecipeProvider>
  );
}
