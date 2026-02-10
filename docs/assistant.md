# Étendre l'Assistant Anti-Erreurs

Ce document explique comment ajouter de nouvelles règles de risques et de nouveaux items à la checklist d'hygiène.

---

## Architecture

L'assistant se compose de 3 éléments :

1. **Checklist d'hygiène** (`src/data/hygieneChecklist.ts`) — data-driven
2. **Moteur de risques** (`src/lib/riskRules.ts`) — règles évaluées en temps réel
3. **Composants UI** (`src/components/assistant/`) — affichage

L'état est centralisé dans `RecipeContext` :
- `assistant.hygieneChecks` : Record des cases cochées (id → boolean)
- `assistant.dismissedRiskIds` : IDs des risques masqués par l'utilisateur

---

## Ajouter un item à la checklist d'hygiène

### 1. Ouvrir `src/data/hygieneChecklist.ts`

### 2. Trouver l'étape concernée (ou en créer une)

Chaque étape est identifiée par un `stepId` (ex: `"step0"`, `"step5"`). Le mapping avec les étapes du wizard se fait dans `src/components/Wizard.tsx` :

```typescript
const stepIdMap: Record<number, string> = {
  0: "step0",   // Profil & Matériel
  2: "step2",   // Malts
  5: "step5",   // Ébullition
  6: "step6",   // Fermentation
  7: "step7",   // Conditionnement
};
```

### 3. Ajouter un item

```typescript
{
  id: "mon_nouvel_item",        // ID unique dans toute la checklist
  label: "Texte affiché",       // Le texte de la case à cocher
  why: "Pourquoi c'est important...",  // Explication pour les débutants
  how: "Comment faire concrètement...", // Instructions pratiques
  severity: "warn",             // "info" ou "warn" (warn = plus visible)
  appliesWhen: {                // Optionnel : conditions d'affichage
    packagingType: "bottles",   // Seulement si embouteillage
    hasChiller: true,           // Seulement si refroidisseur
    hasTempControl: false,      // Seulement si pas de contrôle température
  },
}
```

### 4. Ajouter une nouvelle étape (si nécessaire)

Ajoutez un objet dans le tableau `hygieneChecklist` :

```typescript
{
  stepId: "step3",  // Un nouveau stepId
  title: "Hygiène — Mon étape",
  intro: "Introduction pédagogique...",
  items: [/* ... */],
}
```

Puis ajoutez le mapping dans `Wizard.tsx` :
```typescript
const stepIdMap = {
  // ...
  3: "step3",
};
```

---

## Ajouter une règle de risque

### 1. Ouvrir `src/lib/riskRules.ts`

### 2. Comprendre le contexte disponible

Chaque règle reçoit un `RiskContext` :

```typescript
interface RiskContext {
  recipe: Recipe;           // La recette complète
  yeast: Yeast | undefined; // La levure sélectionnée (si applicable)
  kettleCapacityL: number | undefined; // Capacité de la cuve en litres
  hasChiller: boolean;       // A un refroidisseur ?
  hasTempControl: boolean;   // A un contrôle de température ?
  hasHydrometer: boolean;    // A un densimètre ?
}
```

### 3. Ajouter une règle

Dans le tableau `riskRules`, ajoutez un objet :

```typescript
{
  id: "ma_regle",  // ID unique de la règle
  evaluate(ctx) {
    // Logique de détection
    // Retourner null si pas de risque, un Risk sinon

    if (/* condition dangereuse */) {
      return {
        id: "ma_regle_danger",    // ID unique du risque
        level: "danger",           // "info" | "warn" | "danger"
        title: "Titre court",
        message: "Description du problème",
        whyItMatters: "Explication pédagogique pour les débutants",
        howToFix: [
          "Action concrète 1",
          "Action concrète 2",
        ],
      };
    }

    return null;
  },
},
```

### 4. Niveaux de risque

| Niveau | Couleur | Usage |
|---|---|---|
| `danger` | Rouge | Problème grave (sécurité, bière imbuvable) |
| `warn` | Orange | Problème modéré (qualité dégradée) |
| `info` | Bleu | Conseil d'amélioration |

### 5. Bonnes pratiques

- **Toujours inclure `whyItMatters`** : l'explication pédagogique est essentielle.
- **Donner des actions concrètes** dans `howToFix` (pas juste "corrigez le problème").
- **Utiliser des seuils progressifs** : warn d'abord, danger ensuite.
- **Tester avec différentes recettes** pour vérifier les faux positifs.

---

## Règles existantes

| ID | Risque détecté | Niveaux |
|---|---|---|
| `priming_high` | Sucre de refermentation trop élevé | warn (8-9 g/L), danger (>9 g/L) |
| `ferm_temp_hot` | Fermentation trop chaude | warn (+1-3°C), danger (+3°C+) |
| `ferm_temp_cold` | Fermentation trop froide | warn (-0-3°C), danger (-3°C+) |
| `no_chiller` | Pas de refroidisseur | warn (≥15L), danger (≥25L) |
| `kettle_overflow` | Cuve trop petite | warn (<35% marge), danger (<25% marge) |
| `no_hydrometer` | Pas de densimètre | info |
| `lager_no_temp_control` | Lager sans contrôle température | warn |
| `low_base_malt` | Quantité de grain insuffisante | warn |

---

## Structure des fichiers

```
src/
  data/
    hygieneChecklist.ts    ← Données de la checklist (items par étape)
  lib/
    riskRules.ts           ← Moteur de règles + toutes les règles
    uiMode.ts              ← Helpers isBeginner/isExpert
  components/
    assistant/
      HygieneChecklist.tsx ← UI de la checklist (avec accordéons)
      RiskPanel.tsx        ← Modal/drawer des alertes
      RiskBadge.tsx        ← Badge compact dans le header
  context/
    RecipeContext.tsx       ← État de l'assistant (hygieneChecks, dismissedRiskIds)
```
