"use client";

import { useRecipe } from "@/context/RecipeContext";
import { UserType } from "@/lib/types";
import Tip from "@/components/ui/Tip";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Étape 0 : Sélection du profil utilisateur et du matériel.
 */
export default function Step0Profile() {
  const { recipe, setRecipe, equipmentData, tipsData } = useRecipe();
  const { profile } = recipe;

  // Grouper le matériel par catégorie
  const categories = equipmentData.reduce<Record<string, typeof equipmentData>>(
    (acc, eq) => {
      // Masquer le matériel "pro" si l'utilisateur est homebrew
      if (profile.userType === "homebrew" && eq.forPro) return acc;
      if (!acc[eq.category]) acc[eq.category] = [];
      acc[eq.category].push(eq);
      return acc;
    },
    {}
  );

  const categoryLabels: Record<string, string> = {
    cuve: "🍲 Cuves & systèmes de brassage",
    fermenteur: "🪣 Fermenteurs",
    mesure: "📏 Instruments de mesure",
    refroidissement: "❄️ Refroidissement",
    conditionnement: "🍾 Conditionnement",
    accessoire: "🔧 Accessoires",
    température: "🌡️ Contrôle de température",
  };

  const categoryTipKeys: Record<string, string> = {
    cuve: "equipment_cuve",
    fermenteur: "equipment_fermenteur",
    mesure: "equipment_mesure",
    refroidissement: "equipment_refroidissement",
    conditionnement: "equipment_conditionnement",
    accessoire: "",
    température: "equipment_temperature",
  };

  function handleUserType(type: UserType) {
    setRecipe((prev) => ({
      ...prev,
      profile: { ...prev.profile, userType: type },
    }));
  }

  const kettleVolumeMap: Record<string, number> = {
    kettle_10: 8,
    kettle_27: 20,
    kettle_50: 35,
    kettle_100: 70,
    stockpot_large: 12,
    brew_system: 20,
    brew_kettle_electric: 20,
  };

  function toggleEquipment(id: string) {
    setRecipe((prev) => {
      const selected = prev.profile.selectedEquipment;
      const isAdding = !selected.includes(id);
      const next = isAdding
        ? [...selected, id]
        : selected.filter((e) => e !== id);

      const updates: Partial<typeof prev> = {
        profile: { ...prev.profile, selectedEquipment: next },
      };

      // Auto-set volume when selecting a kettle (only if volume is still at default 20)
      if (isAdding && kettleVolumeMap[id] && prev.params.volume === 20) {
        updates.params = { ...prev.params, volume: kettleVolumeMap[id] };
      }

      return { ...prev, ...updates };
    });
  }

  // Vérification : fermenteur manquant ?
  const hasFermenter = profile.selectedEquipment.some((id) =>
    equipmentData.find((e) => e.id === id && e.category === "fermenteur")
  );
  const hasKettle = profile.selectedEquipment.some((id) =>
    equipmentData.find(
      (e) => e.id === id && (e.category === "cuve")
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900 mb-2">
          <span className="text-3xl mr-2">🛠️</span>Profil & Matériel
        </h2>
        <p className="text-gray-600">
          Commencez par indiquer votre profil de brasseur et le matériel dont vous disposez.
          Cela nous aidera à adapter les conseils et les quantités.
        </p>
      </div>

      {/* Type d'utilisateur */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Vous êtes :
          <Tooltip text={tipsData.user_type} />
        </label>
        <div className="flex gap-3">
          {(
            [
              ["homebrew", "Particulier / Brasseur amateur"],
              ["pro", "Entreprise / Brasseur professionnel"],
            ] as [UserType, string][]
          ).map(([value, label]) => (
            <button
              key={value}
              onClick={() => handleUserType(value)}
              className={`flex-1 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${
                profile.userType === value
                  ? "border-amber-500 bg-amber-50 text-amber-900"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Matériel */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Matériel disponible :
        </label>
        <div className="space-y-4">
          {Object.entries(categories).map(([cat, items]) => (
            <div key={cat}>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                {categoryLabels[cat] || cat}
                {categoryTipKeys[cat] && <Tooltip text={tipsData[categoryTipKeys[cat]]} />}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((eq) => (
                  <label
                    key={eq.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      profile.selectedEquipment.includes(eq.id)
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={profile.selectedEquipment.includes(eq.id)}
                      onChange={() => toggleEquipment(eq.id)}
                      className="mt-0.5 accent-amber-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800">
                        {eq.name}
                      </span>
                      <p className="text-xs text-gray-500">{eq.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avertissements */}
      {profile.selectedEquipment.length > 0 && !hasKettle && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-sm text-red-800">
          <strong>Attention :</strong> Aucune cuve de brassage sélectionnée. Vous aurez besoin
          d&apos;une cuve ou d&apos;un système tout-en-un pour brasser.
        </div>
      )}
      {profile.selectedEquipment.length > 0 && !hasFermenter && (
        <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded-r-lg text-sm text-red-800">
          <strong>Attention :</strong> Aucun fermenteur sélectionné. La fermentation nécessite
          un récipient adapté (seau, dame-jeanne ou fermenteur conique).
        </div>
      )}

      <Tip>
        Sélectionnez tout le matériel que vous possédez. Cela permettra de vous
        donner des conseils adaptés. Si vous débutez, un minimum est nécessaire :
        une cuve, un fermenteur, un thermomètre et un densimètre.
      </Tip>
    </div>
  );
}
