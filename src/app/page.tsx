"use client";

import { RecipeProvider } from "@/context/RecipeContext";
import Wizard from "@/components/Wizard";

export default function Home() {
  return (
    <RecipeProvider>
      <main className="min-h-screen py-4">
        <Wizard />
      </main>
    </RecipeProvider>
  );
}
