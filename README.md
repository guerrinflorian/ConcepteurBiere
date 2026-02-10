# ConcepteurBière

Assistant interactif de brassage de bière maison. Application Next.js avec TypeScript, Tailwind CSS et Framer Motion.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans un navigateur.

## Build de production

```bash
npm run build
npm start
```

## Fonctionnalités

- **Wizard multi-étapes** (9 étapes) avec animations Framer Motion
- **Calculs en temps réel** : OG, FG, ABV, IBU, EBC, CO₂
- **Mode Débutant / Expert** : adapte le niveau de détail et d'aide
- **Assistant anti-erreurs** :
  - Checklist d'hygiène par étape (data-driven, extensible)
  - Détection de risques en temps réel (priming, température, cuve, etc.)
  - Panneau d'alertes avec explications pédagogiques
- **Panneau d'estimations** avec interprétations simples et détails techniques
- **Lexique du brasseur** : glossaire complet accessible partout (OG, IBU, DMS…)
- **Conseils contextuels** à chaque étape
- **Export/import** de recettes en JSON
- **Interface responsive** (desktop et mobile)
- **Données via API routes** Next.js (JSON statique)

## Mode Débutant / Expert

Un toggle dans le header permet de basculer entre les deux modes :

- **Débutant** : explications détaillées, checklists ouvertes, interprétations simples
- **Expert** : informations compactes, formules de calcul, checklists repliables

## Import / Export de recettes

- **Exporter** : à l'étape 8 (Résumé), cliquez sur « Exporter la recette (JSON) ». Le fichier est téléchargé.
- **Importer** : à l'étape 8, cliquez sur « Importer une recette » et sélectionnez un fichier JSON exporté précédemment. L'application remplira automatiquement toutes les étapes.

Les recettes importées sont compatibles même si elles ont été créées avant l'ajout de certains champs (fallback sur les valeurs par défaut).

## Documentation

- [Guide du débutant](docs/guide-debutant.md) — « Je n'y connais rien, par où commencer ? »
- [Lexique](docs/lexique.md) — Toutes les abréviations et termes techniques
- [Détail des estimations](docs/estimations.md) — Formules, hypothèses, limites, exemples
- [Étendre l'assistant](docs/assistant.md) — Comment ajouter des règles de risque et des items à la checklist

## Structure du projet

```
src/
  app/
    page.tsx              # Page principale (wizard)
    layout.tsx            # Layout racine
    globals.css           # Styles globaux
    api/                  # Routes API (equipment, malts, hops, yeasts, styles, adjuncts, tips)
  components/
    Wizard.tsx            # Composant wizard multi-étapes + intégration assistant
    steps/                # Composants pour chaque étape (0-8)
    ui/
      BeerGlass.tsx       # Visuel SVG du verre de bière
      LiveStats.tsx       # Panneau de statistiques en temps réel
      StepIndicator.tsx   # Indicateur de progression
      StyleComparison.tsx # Comparaison avec le style cible
      Tip.tsx             # Encadré de conseil
      Tooltip.tsx         # Infobulle
      ValidationErrors.tsx # Affichage des erreurs
    assistant/
      HygieneChecklist.tsx # Checklist d'hygiène par étape
      RiskPanel.tsx        # Panneau d'alertes de risques
      RiskBadge.tsx        # Badge compact d'alertes
    estimations/
      EstimationsPanel.tsx # Panneau d'estimations pédagogique
    help/
      GlossaryModal.tsx    # Modal du lexique / glossaire
  context/
    RecipeContext.tsx      # Contexte React (recette + assistant + mode)
  data/
    hygieneChecklist.ts   # Données de la checklist d'hygiène
    glossary.ts           # Données du lexique
  lib/
    types.ts              # Types TypeScript
    calculations.ts       # Calculs brassicoles (OG, FG, IBU, EBC, ABV)
    validation.ts         # Validation par étape
    riskRules.ts          # Moteur de règles de risques
    uiMode.ts             # Helpers Débutant/Expert
public/
  data/
    equipment.json        # Liste du matériel (34 items)
    malts.json            # Malts et céréales (20 items)
    hops.json             # Houblons (20 items)
    yeasts.json           # Levures (12 items)
    styles.json           # Styles de bière (12 items)
    adjuncts.json         # Adjuvants (12 items)
    tips.json             # Conseils contextuels (28 entrées)
docs/
  guide-debutant.md       # Guide complet pour débutants
  lexique.md              # Lexique des termes brassicoles
  estimations.md          # Détail des formules d'estimation
  assistant.md            # Comment étendre l'assistant
```

## Ajouter des ingrédients

Les données sont dans `public/data/`. Pour ajouter un malt par exemple, ouvrir `public/data/malts.json` et ajouter un objet :

```json
{
  "id": "mon_malt",
  "name": "Mon Malt",
  "type": "base",
  "color_ebc": 5,
  "potential_gravity": 1.037,
  "description": "Description du malt.",
  "origin": "France"
}
```

Même principe pour les houblons (`hops.json`), levures (`yeasts.json`) et matériel (`equipment.json`).

## Étendre l'assistant

Voir [docs/assistant.md](docs/assistant.md) pour ajouter :
- Des items à la checklist d'hygiène
- Des nouvelles règles de détection de risques
- Des termes au glossaire (`src/data/glossary.ts`)

## Pas de persistance

L'état de la recette est en mémoire uniquement. Aucun localStorage, IndexedDB ou base de données n'est utilisé. Utilisez l'export JSON pour sauvegarder vos recettes.
